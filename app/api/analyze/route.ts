import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { resolveLanguage } from "@/lib/vocab"


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
      return NextResponse.json(
        { error: "Chưa cấu hình GEMINI_API_KEY. Vui lòng kiểm tra lại cấu hình." },
        { status: 500 }
      )
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
        return NextResponse.json(
          { error: "Hệ thống AI đang quá tải (Hạn ngạch 429). Vui lòng thử lại sau giây lát." },
          { status: 429 }
        )
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



