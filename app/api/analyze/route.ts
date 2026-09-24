import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { resolveLanguage } from "@/lib/vocab"

// Smart multi-language fallback dataset for object recognition when API rate limit (429) occurs
const FALLBACK_OBJECTS: Record<
  string,
  { word: string; phonetic: string; wordType: string }
> = {
  vi: { word: "Cái ghế", phonetic: "/cái ghế/", wordType: "danh từ" },
  en: { word: "Chair", phonetic: "/tʃeər/", wordType: "noun" },
  ja: { word: "椅子", phonetic: "いす (Isu)", wordType: "名詞" },
  ko: { word: "의자", phonetic: "[uija]", wordType: "명사" },
  zh: { word: "椅子", phonetic: "yǐzi", wordType: "名词" },
  fr: { word: "Chaise", phonetic: "/ʃɛz/", wordType: "nom" },
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { image, base64Image, sourceLanguage, targetLanguage } = body

    const rawImage = base64Image || image

    if (!rawImage) {
      return NextResponse.json(
        { error: "Hình ảnh không được để trống" },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

    // Normalize source and target languages using resolveLanguage
    const srcLang = resolveLanguage(sourceLanguage)
    const tgtLang = resolveLanguage(targetLanguage)

    if (!apiKey || !apiKey.trim()) {
      console.warn("Chưa cấu hình GEMINI_API_KEY, tự động chuyển sang dữ liệu thử nghiệm chuẩn theo ngôn ngữ đã chọn.")
      return NextResponse.json(getFallbackData(srcLang.code, tgtLang.code))
    }

    // Cắt bỏ phần tiền tố data:image/...;base64, nếu có
    const cleanedBase64 = rawImage.includes(";base64,")
      ? rawImage.split(";base64,").pop()!
      : rawImage

    const mimeTypeMatch = rawImage.match(/^data:(image\/\w+);base64,/)
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg"

    const ai = new GoogleGenAI({ apiKey })

    const prompt = `You are a multi-language vocabulary recognition expert.
Identify the primary object in this image.
- Source language: ${srcLang.englishName} (code: '${srcLang.code}')
- Target language: ${tgtLang.englishName} (code: '${tgtLang.code}')

Return ONLY a raw JSON object with no markdown formatting formatted as follows:
{
  "originalWord": "Name of object in ${srcLang.englishName}",
  "originalPhonetic": "Phonetic / Romaji / Pinyin / Hangul pronunciation for originalWord (if applicable)",
  "translatedWord": "Translation of object name in ${tgtLang.englishName}",
  "translatedPhonetic": "Phonetic / IPA / Romaji / Pinyin pronunciation for translatedWord",
  "wordType": "Part of speech in Vietnamese (e.g. danh từ, động từ, tính từ)",
  "ipa": "Full phonetic representation"
}`

    const candidateModels = [
      "gemini-3.5-flash-lite",
      "gemini-2.5-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash-latest",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
    ]

    let response = null
    let lastError: unknown = null

    for (const modelName of candidateModels) {
      try {
        console.log(`Đang kết nối Gemini AI (${modelName}) [${srcLang.code} -> ${tgtLang.code}]...`)
        response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              inlineData: {
                data: cleanedBase64,
                mimeType: mimeType,
              },
            },
            prompt,
          ],
        })

        if (response && response.text) {
          console.log(`Kết nối thành công model: ${modelName}`)
          break
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err)
        console.warn(`Model ${modelName} không khả dụng:`, errMsg)
        lastError = err

        if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
          break
        }
      }
    }

    if (!response || !response.text) {
      const errString = lastError instanceof Error ? lastError.message : String(lastError)

      if (errString.includes("429") || errString.includes("RESOURCE_EXHAUSTED") || errString.includes("Quota exceeded")) {
        console.warn(`HẠN NGẠCH 429: Gemini bận. Tự động trả về dữ liệu mẫu cho cặp ngôn ngữ [${srcLang.code} -> ${tgtLang.code}]`)
        return NextResponse.json(getFallbackData(srcLang.code, tgtLang.code))
      }

      throw lastError || new Error("Không có Gemini model nào phản hồi.")
    }

    const textResponse = response.text || ""
    const cleanedText = textResponse
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim()

    const jsonResult = JSON.parse(cleanedText)

    if (!jsonResult.originalPhonetic) jsonResult.originalPhonetic = ""
    if (!jsonResult.translatedPhonetic) jsonResult.translatedPhonetic = jsonResult.ipa || ""

    return NextResponse.json(jsonResult)
  } catch (error: unknown) {
    console.error("Lỗi khi xử lý API analyze:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Có lỗi xảy ra khi xử lý nhận diện hình ảnh",
      },
      { status: 500 }
    )
  }
}

function getFallbackData(srcCode: string, tgtCode: string) {
  const src = FALLBACK_OBJECTS[srcCode] || FALLBACK_OBJECTS.vi
  const tgt = FALLBACK_OBJECTS[tgtCode] || FALLBACK_OBJECTS.en

  return {
    originalWord: src.word,
    originalPhonetic: src.phonetic,
    wordType: "danh từ",
    translatedWord: tgt.word,
    translatedPhonetic: tgt.phonetic,
    ipa: src.phonetic ? `${src.phonetic} → ${tgt.phonetic}` : tgt.phonetic,
    isFallback: true,
    warningMessage: `Đang sử dụng dữ liệu nhận diện mẫu cho cặp ngôn ngữ (${srcCode.toUpperCase()} → ${tgtCode.toUpperCase()}).`,
  }
}

