export type LanguageOption = {
  code: string
  label: string
  shortLabel: string
  englishName: string
  /** BCP-47 code used for speech synthesis */
  speechLocale: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "vi", label: "Tiếng Việt", shortLabel: "VI", englishName: "Vietnamese", speechLocale: "vi-VN" },
  { code: "en", label: "Tiếng Anh", shortLabel: "EN", englishName: "English", speechLocale: "en-US" },
  { code: "ja", label: "Tiếng Nhật", shortLabel: "JA", englishName: "Japanese", speechLocale: "ja-JP" },
  { code: "ko", label: "Tiếng Hàn", shortLabel: "KO", englishName: "Korean", speechLocale: "ko-KR" },
  { code: "zh", label: "Tiếng Trung", shortLabel: "ZH", englishName: "Chinese", speechLocale: "zh-CN" },
  { code: "fr", label: "Tiếng Pháp", shortLabel: "FR", englishName: "French", speechLocale: "fr-FR" },
]

export function getLanguageByCode(code: string): LanguageOption {
  return (
    SUPPORTED_LANGUAGES.find((lang) => lang.code === code) ||
    SUPPORTED_LANGUAGES[0]
  )
}

export function resolveLanguage(input?: string): LanguageOption {
  if (!input || !input.trim()) return SUPPORTED_LANGUAGES[0]
  const clean = input.trim().toLowerCase()
  return (
    SUPPORTED_LANGUAGES.find(
      (lang) =>
        lang.code.toLowerCase() === clean ||
        lang.label.toLowerCase() === clean ||
        lang.englishName.toLowerCase() === clean
    ) || SUPPORTED_LANGUAGES[0]
  )
}

export type LanguagePair = {
  id: string
  from: string
  to: string
  fromCode: string
  toCode: string
  fromShort: string
  toShort: string
  sourceSpeechLocale: string
  targetSpeechLocale: string
  /** BCP-47 code used for speech synthesis of the target translated word */
  speechLocale: string
}

export type Recognition = {
  source: string
  partOfSpeech: string
  translation: string
  ipa: string
}

const SAMPLES: Recognition[] = [
  { source: "Cái ghế", partOfSpeech: "danh từ", translation: "Chair", ipa: "/tʃeər/" },
  { source: "Cái bàn", partOfSpeech: "danh từ", translation: "Table", ipa: "/ˈteɪbəl/" },
  { source: "Cửa sổ", partOfSpeech: "danh từ", translation: "Window", ipa: "/ˈwɪndoʊ/" },
  { source: "Cái cốc", partOfSpeech: "danh từ", translation: "Cup", ipa: "/kʌp/" },
]

export function recognizeSample(): Recognition {
  return SAMPLES[0]
}


