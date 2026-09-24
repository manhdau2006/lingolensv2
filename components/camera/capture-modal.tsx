"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, Bookmark, RotateCcw, Check, FolderPlus, ChevronDown, X } from "lucide-react"
import { toast } from "sonner"
import type { LanguagePair } from "@/lib/vocab"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store"
import { playAudio } from "@/lib/audio"

export type CaptureData = {
  imageUrl: string
  originalWord: string
  originalPhonetic?: string
  wordType: string
  translatedWord: string
  translatedPhonetic?: string
  ipa: string
}

type CaptureModalProps = {
  data: CaptureData | null
  languagePair: LanguagePair
  onClose: () => void
  onRetake: () => void
}

export function CaptureModal({ data, languagePair, onClose, onRetake }: CaptureModalProps) {
  const folders = useAppStore((state) => state.folders)
  const addFolder = useAppStore((state) => state.addFolder)
  const addVocabulary = useAppStore((state) => state.addVocabulary)

  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (data) {
      setSelectedFolderIds([])
      setDropdownOpen(false)
      setIsCreatingNew(false)
      setNewFolderName("")
    }
  }, [data])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownOpen])

  const toggleFolderSelect = (folderId: string) => {
    setSelectedFolderIds((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    )
  }

  const handleCreateNewFolder = () => {
    if (!newFolderName.trim()) return
    addFolder(newFolderName.trim())
    setNewFolderName("")
    setIsCreatingNew(false)
    toast.success("Đã tạo thư mục mới thành công")
  }

  const handleSave = () => {
    if (!data) return

    const targetFolderIds = selectedFolderIds.length > 0 ? selectedFolderIds : ["unsaved"]

    targetFolderIds.forEach((folderId) => {
      addVocabulary({
        folderId,
        originalWord: data.originalWord,
        wordType: data.wordType,
        translatedWord: data.translatedWord,
        ipa: data.translatedPhonetic || data.ipa,
        imageUrl: data.imageUrl,
        targetSpeechLocale: languagePair.targetSpeechLocale || languagePair.speechLocale,
      })
    })

    toast.success("Đã lưu thành công")
    onClose()
  }

  const selectedDisplayNames = folders
    .filter((f) => selectedFolderIds.includes(f.id))
    .map((f) => f.name)
    .join(", ")

  return (
    <Dialog open={!!data} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="fixed top-1/2 left-1/2 z-50 flex flex-col justify-between w-[81%] max-w-[21rem] min-h-[27rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/95 p-5 text-neutral-50 shadow-2xl backdrop-blur-xl"
      >
        {data && (
          <div className="relative flex flex-1 flex-col justify-between gap-4">
            {/* Header Title hidden for accessibility */}
            <DialogHeader className="sr-only">
              <DialogTitle>Kết quả nhận diện từ vựng</DialogTitle>
              <DialogDescription>Chi tiết từ vựng và phiên âm</DialogDescription>
            </DialogHeader>

            {/* Custom Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute -right-1 -top-1 z-20 flex size-7 items-center justify-center rounded-full bg-neutral-800/80 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-white"
              aria-label="Đóng"
            >
              <X className="size-4" />
            </button>

            {/* Top Main Section: Centered Thumbnail & Vocab Info */}
            <div className="flex flex-col items-center gap-3 pt-1 text-center">
              {/* Thumbnail Image */}
              <img
                src={data.imageUrl}
                alt={data.originalWord}
                crossOrigin="anonymous"
                className="size-20 shrink-0 rounded-2xl object-cover ring-2 ring-white/15 shadow-xl"
              />

              {/* Vocabulary Info */}
              <div className="flex w-full flex-col items-center gap-2.5 min-w-0 px-1">
                {/* Original Word Card */}
                <div className="flex flex-col items-center justify-center gap-1 w-full text-center bg-neutral-800/50 p-2.5 rounded-2xl border border-neutral-800">
                  <h2 className="text-lg font-bold text-neutral-50 leading-tight break-words max-w-full text-center">
                    {data.originalWord}
                  </h2>
                  {data.wordType && (
                    <span className="text-[11px] italic text-neutral-400 font-normal">
                      ({data.wordType})
                    </span>
                  )}
                </div>

                {/* Translated Word Card & Pronunciation */}
                <div className="flex flex-col items-center gap-1 w-full text-center bg-amber-500/10 p-2.5 rounded-2xl border border-amber-500/20">
                  <div className="flex items-center justify-center gap-2 min-w-0 w-full">
                    <span className="text-lg font-bold text-amber-400 truncate max-w-[13rem]">
                      {data.translatedWord}
                    </span>
                    <button
                      type="button"
                      onClick={() => playAudio(data.translatedWord, languagePair.targetSpeechLocale || languagePair.speechLocale || "en-US")}
                      aria-label="Nghe phát âm bản dịch"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 transition-all hover:bg-amber-500/30 active:scale-95 cursor-pointer"
                    >
                      <Volume2 className="size-3.5" />
                    </button>
                  </div>
                  {(data.translatedPhonetic || data.ipa) && (
                    <p className="font-mono text-xs text-neutral-300 truncate max-w-full">
                      {data.translatedPhonetic || data.ipa}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Section: Multi-select Folder Dropdown */}
            <div className="relative flex flex-col gap-1.5 my-auto" ref={dropdownRef}>
              <label className="text-[11px] font-medium text-neutral-400">Chọn thư mục lưu trữ:</label>
              
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-800/80 px-3.5 py-2.5 text-left text-xs text-neutral-200 transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
              >
                <span className={`truncate pr-2 ${selectedFolderIds.length === 0 ? "text-neutral-400" : "text-neutral-100 font-medium"}`}>
                  {selectedFolderIds.length === 0 ? "Chọn thư mục (Mặc định: #unsaved)" : selectedDisplayNames}
                </span>
                <ChevronDown className={`size-4 shrink-0 text-neutral-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu Content */}
              {dropdownOpen && (
                <div className="absolute bottom-full z-50 mb-1.5 w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="max-h-36 overflow-y-auto space-y-0.5 pr-1">
                    {folders.map((folder) => {
                      const isChecked = selectedFolderIds.includes(folder.id)
                      return (
                        <button
                          key={folder.id}
                          type="button"
                          onClick={() => toggleFolderSelect(folder.id)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                            isChecked
                              ? "bg-amber-500/15 font-medium text-amber-300"
                              : "text-neutral-200 hover:bg-neutral-800"
                          }`}
                        >
                          <span className="truncate">{folder.name}</span>
                          {isChecked && <Check className="size-3.5 shrink-0 text-amber-400" />}
                        </button>
                      )
                    })}
                  </div>

                  <div className="my-1 border-t border-neutral-800" />

                  {/* Create New Folder option */}
                  {isCreatingNew ? (
                    <div className="flex gap-1.5 p-1">
                      <input
                        type="text"
                        placeholder="Tên thư mục..."
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateNewFolder()
                        }}
                        className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleCreateNewFolder}
                        className="rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-amber-300"
                      >
                        Tạo
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(true)}
                      className="flex w-full items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/10"
                    >
                      <FolderPlus className="size-3.5" />
                      + Tạo thư mục mới
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions Section */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleSave}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 py-3 text-xs font-bold text-neutral-950 transition-all hover:bg-amber-300 active:scale-[0.98] shadow-lg shadow-amber-400/10"
              >
                <Bookmark className="size-4 shrink-0" />
                <span className="truncate">Lưu vào bộ sưu tập</span>
              </button>

              <button
                type="button"
                onClick={onRetake}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-800 py-2.5 text-xs font-semibold text-neutral-200 transition-colors hover:bg-neutral-700 active:scale-[0.98]"
              >
                <RotateCcw className="size-4 shrink-0" />
                <span>Chụp lại</span>
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
