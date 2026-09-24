export function playAudio(text: string, lang: string = "en-US") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Trình duyệt không hỗ trợ Web Speech API (speechSynthesis).")
    return
  }

  if (!text || !text.trim()) return

  // Ngắt phát âm cũ nếu người dùng bấm liên tục
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text.trim())
  utterance.lang = lang
  utterance.rate = 0.9 // Tốc độ đọc chuẩn tự nhiên

  window.speechSynthesis.speak(utterance)
}
