"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { TopBar } from "@/components/camera/top-bar"
import { CameraPreview, type CameraPreviewHandle } from "@/components/camera/camera-preview"
import { BottomBar } from "@/components/camera/bottom-bar"
import { MenuDrawer } from "@/components/camera/menu-drawer"
import { CaptureModal, type CaptureData } from "@/components/camera/capture-modal"
import { getLanguageByCode, type LanguagePair } from "@/lib/vocab"
import { useAppStore } from "@/lib/store"

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [facingFront, setFacingFront] = useState(false)
  const [captured, setCaptured] = useState<CaptureData | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const sourceLanguage = useAppStore((state) => state.sourceLanguage)
  const targetLanguage = useAppStore((state) => state.targetLanguage)

  const currentSource = getLanguageByCode(sourceLanguage)
  const currentTarget = getLanguageByCode(targetLanguage)

  const activeLanguagePair: LanguagePair = {
    id: `${currentSource.code}-${currentTarget.code}`,
    from: currentSource.label,
    to: currentTarget.label,
    fromCode: currentSource.code,
    toCode: currentTarget.code,
    fromShort: currentSource.shortLabel,
    toShort: currentTarget.shortLabel,
    sourceSpeechLocale: currentSource.speechLocale,
    targetSpeechLocale: currentTarget.speechLocale,
    speechLocale: currentTarget.speechLocale,
  }

  const cameraPreviewRef = useRef<CameraPreviewHandle>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleCapture() {
    if (isCapturing) return
    setIsCapturing(true)

    try {
      const imageBase64 = cameraPreviewRef.current?.captureImage() || ""

      console.log(`Đang gửi ảnh tới API (Dịch từ ${currentSource.label} sang ${currentTarget.label})...`)

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageBase64,
          sourceLanguage: currentSource.code,
          targetLanguage: currentTarget.code,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Không thể kết nối dịch vụ AI nhận diện hình ảnh")
      }

      console.log("Kết quả từ API:", data)

      if (data.warningMessage) {
        toast.info(data.warningMessage)
      }

      setCaptured({
        imageUrl: imageBase64,
        originalWord: data.originalWord,
        originalPhonetic: data.originalPhonetic || "",
        wordType: data.wordType || data.partOfSpeech || "",
        translatedWord: data.translatedWord,
        translatedPhonetic: data.translatedPhonetic || "",
        ipa: data.ipa || "",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi nhận diện hình ảnh"
      console.error("Lỗi khi gửi ảnh tới API:", errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsCapturing(false)
    }
  }

  function handleGallery(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (isCapturing) return

    setIsCapturing(true)

    const reader = new FileReader()
    reader.onload = async (event) => {
      const imageBase64 = event.target?.result as string
      try {
        console.log(`Đang gửi ảnh từ thư viện tới API (Dịch từ ${currentSource.label} sang ${currentTarget.label})...`)

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: imageBase64,
            sourceLanguage: currentSource.code,
            targetLanguage: currentTarget.code,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Không thể nhận diện hình ảnh từ thư viện")
        }

        console.log("Kết quả từ API:", data)

        if (data.warningMessage) {
          toast.info(data.warningMessage)
        }

        setCaptured({
          imageUrl: imageBase64,
          originalWord: data.originalWord,
          originalPhonetic: data.originalPhonetic || "",
          wordType: data.wordType || data.partOfSpeech || "",
          translatedWord: data.translatedWord,
          translatedPhonetic: data.translatedPhonetic || "",
          ipa: data.ipa || "",
        })
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi nhận diện hình ảnh"
        console.error("Lỗi khi gửi ảnh từ thư viện tới API:", errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsCapturing(false)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden bg-neutral-950 text-neutral-50">
      {/* subtle warm glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-24 -z-0 mx-auto h-72 w-72 rounded-full bg-amber-500/20 blur-3xl"
      />

      {/* 1. Top Bar */}
      <TopBar onOpenMenu={() => setDrawerOpen(true)} />

      {/* 2. Camera Preview */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <CameraPreview ref={cameraPreviewRef} facingFront={facingFront} />
        <p className="mt-6 text-balance text-center text-sm text-neutral-400">
          Chụp hoặc tải lên vật thể cần dịch
        </p>
      </section>

      {/* 3. Bottom Bar */}
      <BottomBar
        onCapture={handleCapture}
        onFlip={() => setFacingFront((v) => !v)}
        onPickGallery={() => fileInputRef.current?.click()}
        isCapturing={isCapturing}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGallery}
      />

      {/* Menu Drawer (shadcn Sheet - slide left) */}
      <MenuDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Capture Modal (shadcn Dialog - capture result popup) */}
      <CaptureModal
        data={captured}
        languagePair={activeLanguagePair}
        onClose={() => setCaptured(null)}
        onRetake={() => {
          setCaptured(null)
          handleCapture()
        }}
      />
    </main>
  )
}

