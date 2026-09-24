"use client"

import { useEffect, useState } from "react"
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion"
import { useAppStore, type Vocabulary, type Folder } from "@/lib/store"
import { playAudio } from "@/lib/audio"
import { Volume2, X, Check, RotateCcw, Folder as FolderIcon, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Search, Menu } from "lucide-react"
import Link from "next/link"
import { MenuDrawer } from "@/components/camera/menu-drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export default function FlashcardsPage() {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const folders = useAppStore((state) => state.folders)
  const vocabularies = useAppStore((state) => state.vocabularies)
  
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [deck, setDeck] = useState<Vocabulary[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [learnedCount, setLearnedCount] = useState(0)
  
  const [markStatus, setMarkStatus] = useState<'learned' | 'review' | null>(null)

  useEffect(() => {
    if (selectedFolderId) {
      const folderVocabs = vocabularies.filter(v => v.folderId === selectedFolderId)
      setDeck(shuffleArray(folderVocabs))
    }
  }, [selectedFolderId, vocabularies])

  const restart = () => {
    if (selectedFolderId) {
      const folderVocabs = vocabularies.filter(v => v.folderId === selectedFolderId)
      setDeck(shuffleArray(folderVocabs))
    }
    setCurrentIndex(0)
    setStreak(0)
    setIsFlipped(false)
    setMarkStatus(null)
    setLearnedCount(0)
  }

  const goBackToFolders = () => {
    setSelectedFolderId(null)
    setCurrentIndex(0)
    setStreak(0)
    setMaxStreak(0)
    setIsFlipped(false)
    setMarkStatus(null)
    setDeck([])
    setLearnedCount(0)
  }

  const controls = useAnimation()
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  const resetCardPosition = () => {
    x.set(0)
    controls.set({ x: 0, opacity: 1 })
    setIsFlipped(false)
    setMarkStatus(null)
  }

  const handleNext = async (remembered: boolean) => {
    if (markStatus !== null) return
    
    setIsFlipped(false) // Úp thẻ lại ngay lập tức
    setMarkStatus(remembered ? 'learned' : 'review')
    
    setTimeout(async () => {
      if (remembered) {
        const newStreak = streak + 1
        setStreak(newStreak)
        setMaxStreak((prev) => Math.max(prev, newStreak))
        setLearnedCount((prev) => prev + 1)
      } else {
        setStreak(0)
      }
      
      await controls.start({ 
        x: remembered ? 300 : -300, 
        opacity: 0, 
        transition: { duration: 0.2 } 
      })
      
      setCurrentIndex((prev) => prev + 1)
      resetCardPosition()
    }, 500)
  }

  const handleDragEnd = async (e: any, info: any) => {
    if (markStatus !== null) return

    const swipeThreshold = 100
    if (info.offset.x > swipeThreshold) {
      handleNext(true)
    } else if (info.offset.x < -swipeThreshold) {
      handleNext(false)
    }
  }

  const handlePrevCard = () => {
    if (currentIndex > 0 && markStatus === null) {
      setCurrentIndex(prev => prev - 1)
      resetCardPosition()
    }
  }

  const handleSkipCard = () => {
    if (markStatus === null) {
      setCurrentIndex(prev => prev + 1)
      resetCardPosition()
    }
  }

  // --- MÀN HÌNH 1: DANH SÁCH THƯ MỤC ---
  if (selectedFolderId === null) {
    const filteredFolders = folders.filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )

    return (
      <div className="flex h-screen w-full flex-col bg-neutral-950 text-neutral-50 antialiased overflow-hidden">
        <MenuDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <div className="mx-auto flex h-full w-full max-w-md flex-col bg-neutral-950">
          
          {/* Sticky Header Wrapper */}
          <div className="sticky top-0 z-50 shrink-0 bg-neutral-950 border-b border-zinc-800 px-4 pt-6 pb-4">
            {/* Top Row: Hamburger Menu button & Title "Chọn thư mục để học" */}
            <header className="relative flex items-center justify-between pb-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Mở menu"
                className="flex size-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/80 text-neutral-200 transition-colors hover:bg-neutral-800 hover:text-white active:scale-95 shrink-0"
              >
                <Menu className="size-5" />
              </button>

              <h1 className="text-base font-bold text-neutral-100">
                Chọn thư mục để học
              </h1>

              <div className="w-9" /> {/* Spacer */}
            </header>

            {/* Bottom Row: Subtitle "TẤT CẢ THƯ MỤC (số lượng)" & Search Input */}
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 shrink-0">
                Tất cả thư mục ({folders.length})
              </span>

              <div className="relative flex-1 max-w-[13rem]">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-amber-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm tên thư mục..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-neutral-800 bg-neutral-900/90 py-1.5 pl-8 pr-3 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/60"
                />
              </div>
            </div>
          </div>

          {/* Vùng chứa danh sách các thẻ thư mục có thể cuộn độc lập (Scrollable Main Content) */}
          <main className="flex-1 overflow-y-auto px-4 py-4">
            {!isMounted ? (
              <div className="flex h-64 w-full items-center justify-center text-muted-foreground"><div className="flex items-center text-sm font-medium"><span>Đang tải</span><span className="ml-1 flex space-x-0.5"><span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span><span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span><span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span></span></div></div>
            ) : filteredFolders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/30 p-8 text-center mt-4">
                <p className="text-sm text-neutral-400">
                  {searchQuery ? (
                    <>Không tìm thấy thư mục nào phù hợp với &quot;<span className="text-amber-400 font-medium">{searchQuery}</span>&quot;</>
                  ) : (
                    "Chưa có thư mục nào."
                  )}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-3 text-xs font-semibold text-amber-400 hover:underline"
                  >
                    Xóa tìm kiếm
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                {filteredFolders.map((folder) => {
                  const vocabCount = vocabularies.filter((v) => v.folderId === folder.id).length
                  return (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => setSelectedFolderId(folder.id)}
                      className="group relative flex h-full flex-col justify-between rounded-2xl bg-white p-4 text-neutral-900 shadow-sm ring-1 ring-neutral-200/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-amber-400/60 active:scale-95 text-left w-full"
                    >
                      <div className="block flex-1 pt-1 w-full">
                        {/* Icon */}
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                            <FolderIcon className="size-5" />
                          </div>
                        </div>

                        {/* Folder Title */}
                        <h3 className="line-clamp-1 text-base font-semibold text-neutral-900 group-hover:text-amber-600">
                          {folder.name}
                        </h3>

                        {/* Word Count */}
                        <p className="mt-4 text-xs font-medium text-neutral-500">
                          {vocabCount} từ vựng
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    )
  }

  // --- MÀN HÌNH 2: MINIGAME FLASHCARD ---

  if (deck.length === 0) {
    return (
      <div className="min-h-dvh bg-neutral-950 text-neutral-50 antialiased">
        <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center bg-neutral-950 px-4 py-6 text-center">
          <button 
            onClick={goBackToFolders}
            className="absolute top-6 left-4 flex items-center text-neutral-400 hover:text-white font-medium p-2"
          >
            <ChevronLeft size={24} />
            Quay lại
          </button>
          <div className="w-20 h-20 bg-neutral-900 text-neutral-600 rounded-full flex items-center justify-center mb-6 border border-neutral-800">
            <FolderIcon size={40} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Thư mục trống</h1>
          <p className="text-neutral-500 mb-8">Thư mục này chưa có từ vựng để học.</p>
          <button 
            onClick={goBackToFolders}
            className="px-8 py-3 bg-neutral-800 text-white rounded-full font-semibold hover:bg-neutral-700 transition-colors border border-neutral-700"
          >
            Quay lại thư mục
          </button>
        </div>
      </div>
    )
  }

  if (currentIndex >= deck.length) {
    return (
      <div className="min-h-dvh bg-neutral-950 text-neutral-50 antialiased">
        <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center bg-neutral-950 px-4 py-6 text-center">
          <button 
            onClick={goBackToFolders}
            className="absolute top-6 left-4 flex items-center text-neutral-400 hover:text-white font-medium p-2"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold mb-3 text-green-500">Chúc mừng!</h1>
          <p className="text-lg mb-10 text-neutral-400">Bạn đã ôn tập xong!</p>
          
          <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 mb-10 w-full max-w-xs mx-auto shadow-xl text-center">
            <p className="text-neutral-500 mb-2 font-medium">Chuỗi nhớ liên tiếp cao nhất</p>
            <p className="text-5xl font-black text-amber-500 drop-shadow-md">{maxStreak} 🔥</p>

            <hr className="border-neutral-800 my-6" />

            <p className="text-sm text-neutral-400 font-medium">Độ chính xác</p>
            <p className="text-3xl font-bold text-green-500 mt-1">{deck.length > 0 ? Math.round((learnedCount / deck.length) * 100) : 0}%</p>
            <p className="text-xs text-neutral-500 mt-2">({learnedCount} / {deck.length} từ)</p>
          </div>

          <div className="flex gap-4 w-full max-w-xs mx-auto">
            <button 
              onClick={goBackToFolders}
              className="flex items-center justify-center px-6 py-4 bg-neutral-800 text-neutral-200 rounded-2xl font-semibold hover:bg-neutral-700 transition-colors flex-1"
            >
              Thư mục
            </button>
            <button 
              onClick={restart}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-colors shadow-lg flex-1"
            >
              <RotateCcw size={20} />
              Học lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentVocab = deck[currentIndex]
  if (!currentVocab) return null

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto flex flex-col overflow-hidden bg-neutral-950 text-neutral-50 antialiased relative">
      
      {/* 1. Header (Top) */}
      <div className="h-24 shrink-0 flex flex-col justify-end px-4 pb-2 pt-4">
        {/* Top App Bar */}
        <div className="w-full flex justify-between items-center mb-4 relative">
          <button 
            onClick={goBackToFolders}
            className="flex items-center text-neutral-400 hover:text-white font-medium p-2 -ml-2"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2 bg-neutral-900 px-4 py-2 rounded-full border border-neutral-800 shadow-md">
            <span className="text-sm font-medium text-neutral-500">Streak:</span>
            <span className="font-bold text-amber-500">{streak} 🔥</span>
          </div>
        </div>
        
        {/* Card Navigation Header */}
        <div className="w-full flex justify-between items-center px-1">
          <button 
            onClick={handlePrevCard}
            disabled={currentIndex === 0 || markStatus !== null}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors p-2 -ml-2 rounded-lg ${currentIndex === 0 ? 'text-neutral-700 cursor-not-allowed' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
          >
            <ChevronLeft size={18} /> Trở lại
          </button>
          
          <div className="text-xs text-neutral-500 font-bold tracking-widest uppercase">
            {currentIndex + 1} / {deck.length}
          </div>
          
          <button 
            onClick={handleSkipCard}
            disabled={markStatus !== null}
            className="flex items-center gap-1.5 text-sm font-semibold text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors p-2 -mr-2 rounded-lg disabled:opacity-50"
          >
            Tiếp theo <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 2. Middle (Card Area) */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-6 relative perspective-[1000px]">
        <motion.div
          className="relative aspect-[3/4] w-full max-w-[320px] max-h-full cursor-grab active:cursor-grabbing [transform-style:preserve-3d]"
          style={{ x, opacity }}
          drag={markStatus === null ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragSnapToOrigin={true}
          onDragEnd={handleDragEnd}
          animate={controls}
        >
          <motion.div
            className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] shadow-2xl rounded-2xl"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={() => {
              if (markStatus === null) setIsFlipped(!isFlipped)
            }}
          >
            {/* Front side */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 bg-neutral-800">
              {currentVocab.imageUrl && (
                <div className="w-48 h-48 relative mb-8 rounded-2xl overflow-hidden border border-neutral-700 flex-shrink-0 bg-neutral-950">
                  <img 
                    src={currentVocab.imageUrl} 
                    alt={currentVocab.originalWord}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h2 className="text-3xl font-bold text-white text-center break-words w-full line-clamp-3">
                {currentVocab.originalWord}
              </h2>
              <p className="text-neutral-400 text-sm mt-6 font-medium">Nhấn để xem nghĩa</p>
              
              {/* Status Overlay */}
              {markStatus && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 animate-in fade-in zoom-in duration-200">
                  {markStatus === 'learned' ? (
                    <CheckCircle2 size={96} className="text-green-500 bg-neutral-900 rounded-full drop-shadow-[0_0_25px_rgba(34,197,94,0.3)]" />
                  ) : (
                    <XCircle size={96} className="text-red-500 bg-neutral-900 rounded-full drop-shadow-[0_0_25px_rgba(239,68,68,0.3)]" />
                  )}
                </div>
              )}
            </div>

            {/* Back side */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 bg-neutral-800 [transform:rotateY(180deg)] gap-4">
              <h2 className="text-3xl font-bold text-white text-center break-words w-full">
                {currentVocab.translatedWord}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {currentVocab.wordType && (
                  <span className="px-4 py-1.5 bg-neutral-700 text-neutral-300 rounded-lg text-sm font-semibold tracking-wide">
                    {currentVocab.wordType}
                  </span>
                )}
                {currentVocab.ipa && (
                  <span className="text-neutral-400 font-serif text-lg">/{currentVocab.ipa}/</span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  playAudio(currentVocab.translatedWord, currentVocab.targetSpeechLocale)
                }}
                className="p-6 bg-neutral-700 text-white rounded-full shadow-lg hover:bg-neutral-600 hover:scale-110 transition-all active:scale-95 border border-neutral-600"
              >
                <Volume2 size={36} />
              </button>
              
              <p className="text-neutral-400 text-sm font-medium">Nhấn để quay lại</p>

              {/* Status Overlay (back side) */}
              {markStatus && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 animate-in fade-in zoom-in duration-200">
                  {markStatus === 'learned' ? (
                    <CheckCircle2 size={96} className="text-green-500 bg-neutral-800 rounded-full drop-shadow-[0_0_25px_rgba(34,197,94,0.3)]" />
                  ) : (
                    <XCircle size={96} className="text-red-500 bg-neutral-800 rounded-full drop-shadow-[0_0_25px_rgba(239,68,68,0.3)]" />
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 3. Footer (Bottom Controls) */}
      <div className="h-32 shrink-0 pb-6 px-4 flex gap-4 w-full">
        <button
          onClick={() => handleNext(false)}
          disabled={markStatus !== null}
          className="flex-1 bg-neutral-900 border border-neutral-800 hover:border-red-900 hover:bg-neutral-800 text-red-500 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-neutral-900 disabled:hover:border-neutral-800"
        >
          <X size={32} strokeWidth={2.5} />
          <span className="font-bold text-sm tracking-wide">Chưa thuộc</span>
        </button>
        <button
          onClick={() => handleNext(true)}
          disabled={markStatus !== null}
          className="flex-1 bg-neutral-900 border border-neutral-800 hover:border-green-900 hover:bg-neutral-800 text-green-500 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-neutral-900 disabled:hover:border-neutral-800"
        >
          <Check size={32} strokeWidth={2.5} />
          <span className="font-bold text-sm tracking-wide">Đã thuộc</span>
        </button>
      </div>
    </div>
  )
}