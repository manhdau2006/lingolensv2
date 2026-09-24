"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  Volume2,
  MoreVertical,
  Copy,
  FolderInput,
  Trash2,
  CheckSquare,
  Square,
  X,
  Layers,
  Check,
  Search,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { playAudio } from "@/lib/audio"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function FolderDetailPage({
  params,
}: {
  params: Promise<{ folderID: string }>
}) {
  const { folderID } = use(params)

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const folders = useAppStore((state) => state.folders)
  const vocabularies = useAppStore((state) => state.vocabularies)
  const deleteVocabulary = useAppStore((state) => state.deleteVocabulary)
  const moveVocabulary = useAppStore((state) => state.moveVocabulary)
  const deleteMultipleVocabularies = useAppStore((state) => state.deleteMultipleVocabularies)
  const moveMultipleVocabularies = useAppStore((state) => state.moveMultipleVocabularies)
  const copyVocabularyToFolder = useAppStore((state) => state.copyVocabularyToFolder)
  const copyMultipleVocabulariesToFolder = useAppStore((state) => state.copyMultipleVocabulariesToFolder)

  // Search State
  const [searchTerm, setSearchTerm] = useState("")

  // Information of current folder
  const currentFolder = folders.find((f) => f.id === folderID)
  const folderTitle = currentFolder ? currentFolder.name : `#${folderID}`

  // Vocabularies in current folder
  const folderVocabs = vocabularies.filter((v) => v.folderId === folderID)

  // Filtered Vocabularies based on search term
  const filteredVocabs = folderVocabs.filter((vocab) => {
    if (!searchTerm.trim()) return true
    const query = searchTerm.toLowerCase().trim()
    const matchOriginal = vocab.originalWord.toLowerCase().includes(query)
    const matchTranslated = vocab.translatedWord.toLowerCase().includes(query)
    const matchIpa = vocab.ipa ? vocab.ipa.toLowerCase().includes(query) : false
    const matchType = vocab.wordType ? vocab.wordType.toLowerCase().includes(query) : false
    return matchOriginal || matchTranslated || matchIpa || matchType
  })

  // Selection Mode States
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Dialog States
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [copyDialogOpen, setCopyDialogOpen] = useState(false)

  const [targetVocabId, setTargetVocabId] = useState<string | null>(null) // null means multi-select
  const [selectedTargetFolderId, setSelectedTargetFolderId] = useState<string>("")

  // Available destination folders (excluding current folder)
  const destinationFolders = folders.filter((f) => f.id !== folderID)

  // Toggle card selection
  const toggleSelectVocab = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredVocabs.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredVocabs.map((v) => v.id))
    }
  }

  // --- COPY ACTIONS ---
  const openCopySingleModal = (id: string) => {
    setTargetVocabId(id)
    setSelectedTargetFolderId(destinationFolders[0]?.id || "")
    setCopyDialogOpen(true)
  }

  const openCopyBulkModal = () => {
    if (selectedIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 từ vựng")
      return
    }
    setTargetVocabId(null)
    setSelectedTargetFolderId(destinationFolders[0]?.id || "")
    setCopyDialogOpen(true)
  }

  const handleConfirmCopy = () => {
    if (!selectedTargetFolderId) {
      toast.error("Vui lòng chọn thư mục đích")
      return
    }

    const targetFolder = folders.find((f) => f.id === selectedTargetFolderId)
    const targetName = targetFolder ? targetFolder.name : "thư mục đích"

    if (targetVocabId) {
      copyVocabularyToFolder(targetVocabId, selectedTargetFolderId)
      toast.success(`Đã sao chép từ vựng sang ${targetName}`)
    } else {
      copyMultipleVocabulariesToFolder(selectedIds, selectedTargetFolderId)
      toast.success(`Đã sao chép ${selectedIds.length} từ vựng sang ${targetName}`)
      setIsSelectionMode(false)
      setSelectedIds([])
    }

    setCopyDialogOpen(false)
    setTargetVocabId(null)
  }

  // --- MOVE ACTIONS ---
  const openMoveSingleModal = (id: string) => {
    setTargetVocabId(id)
    setSelectedTargetFolderId(destinationFolders[0]?.id || "")
    setMoveDialogOpen(true)
  }

  const openMoveBulkModal = () => {
    if (selectedIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 từ vựng")
      return
    }
    setTargetVocabId(null)
    setSelectedTargetFolderId(destinationFolders[0]?.id || "")
    setMoveDialogOpen(true)
  }

  const handleConfirmMove = () => {
    if (!selectedTargetFolderId) {
      toast.error("Vui lòng chọn thư mục đích")
      return
    }

    const targetFolder = folders.find((f) => f.id === selectedTargetFolderId)
    const targetName = targetFolder ? targetFolder.name : "thư mục mới"

    if (targetVocabId) {
      moveVocabulary(targetVocabId, selectedTargetFolderId)
      toast.success(`Đã di chuyển từ vựng sang ${targetName}`)
    } else {
      moveMultipleVocabularies(selectedIds, selectedTargetFolderId)
      toast.success(`Đã di chuyển ${selectedIds.length} từ vựng sang ${targetName}`)
      setIsSelectionMode(false)
      setSelectedIds([])
    }

    setMoveDialogOpen(false)
    setTargetVocabId(null)
  }

  // Single Item Delete
  const handleDeleteSingle = (id: string, word: string) => {
    deleteVocabulary(id)
    toast.success(`Đã xóa từ "${word}" khỏi thư mục`)
  }

  // Bulk Delete
  const handleDeleteBulk = () => {
    if (selectedIds.length === 0) return
    const count = selectedIds.length
    deleteMultipleVocabularies(selectedIds)
    toast.success(`Đã xóa ${count} từ vựng`)
    setIsSelectionMode(false)
    setSelectedIds([])
  }

  return (
    <div className="flex h-screen w-full flex-col bg-neutral-950 text-neutral-50 antialiased overflow-hidden">
      <div className="mx-auto flex h-full w-full max-w-md flex-col bg-neutral-950">
        {/* Sticky Header Section (wraps Row 1 & Row 2) */}
        <div className="sticky top-0 z-50 shrink-0 bg-neutral-950 border-b border-zinc-800 px-4 pt-6 pb-4">
          {/* Row 1: Back button, Folder Title, Action "Chọn nhiều" / "Xong" */}
          <header className="relative flex items-center justify-between pb-4">
            <Link
              href="/saved"
              className="flex items-center gap-1 text-sm font-medium text-neutral-300 transition-colors hover:text-white active:scale-95"
              aria-label="Quay về danh sách bộ sưu tập"
            >
              <ChevronLeft className="size-5" />
              <span>Back</span>
            </Link>

            <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-neutral-100 truncate max-w-[10rem]">
              {folderTitle}
            </h1>

            {/* Action "Chọn nhiều" / "Xong" */}
            {folderVocabs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsSelectionMode((prev) => !prev)
                  setSelectedIds([])
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelectionMode
                    ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    : "bg-amber-400/15 text-amber-400 hover:bg-amber-400/25"
                }`}
              >
                {isSelectionMode ? "Xong" : "Chọn nhiều"}
              </button>
            )}
          </header>

          {/* Row 2: Subtitle & Search Bar */}
          <div className="flex items-center justify-between gap-2.5 w-full">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                DANH SÁCH TỪ VỰNG ({filteredVocabs.length})
              </span>

              {isSelectionMode && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs font-semibold text-amber-400 hover:underline"
                >
                  {selectedIds.length === filteredVocabs.length ? "Bỏ chọn" : "Chọn tất"}
                </button>
              )}
            </div>

            {/* Search Input Component */}
            <div className="relative flex-1 max-w-[13rem]">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-amber-400/90 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm từ vựng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-neutral-800 bg-neutral-900/90 py-1.5 pl-8 pr-3 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/60 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Main Content Section */}
        <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">

          {/* Vocabulary List Container */}
          {!isMounted ? (
            <div className="flex h-64 w-full items-center justify-center text-neutral-400">
              <div className="flex items-center text-sm font-medium">
                <span>Đang tải</span>
                <span className="ml-1 flex space-x-0.5">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                </span>
              </div>
            </div>
          ) : filteredVocabs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/40 p-8 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                {searchTerm ? <Search className="size-6" /> : <Layers className="size-6" />}
              </div>
              <p className="text-sm font-semibold text-neutral-200">
                {searchTerm ? (
                  <>Không tìm thấy từ vựng chứa &quot;<span className="text-amber-400">{searchTerm}</span>&quot;</>
                ) : (
                  "Chưa có từ vựng nào"
                )}
              </p>
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-3 text-xs font-semibold text-amber-400 hover:underline"
                >
                  Xóa từ khóa tìm kiếm
                </button>
              ) : (
                <>
                  <p className="mt-1 text-xs text-neutral-400">
                    Hãy quay lại trang chủ và chụp ảnh đồ vật để lưu từ mới vào thư mục này.
                  </p>
                  <Link
                    href="/"
                    className="mt-4 rounded-xl bg-amber-400 px-4 py-2 text-xs font-semibold text-neutral-900 transition-colors hover:bg-amber-300"
                  >
                    Chụp ảnh ngay
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredVocabs.map((vocab) => {
                const isSelected = selectedIds.includes(vocab.id)
                return (
                  <div
                    key={vocab.id}
                    onClick={() => {
                      if (isSelectionMode) toggleSelectVocab(vocab.id)
                    }}
                    className={`relative flex items-center gap-3.5 rounded-2xl border p-3 transition-all ${
                      isSelectionMode ? "cursor-pointer" : ""
                    } ${
                      isSelected
                        ? "border-amber-400 bg-amber-500/10 shadow-md shadow-amber-500/5 ring-1 ring-amber-400"
                        : "border-neutral-800 bg-neutral-900/80 hover:border-neutral-700 shadow-lg shadow-black/20"
                    }`}
                  >
                    {/* Checkbox indicator in selection mode */}
                    {isSelectionMode && (
                      <div className="flex items-center justify-center pl-1 pr-0.5">
                        {isSelected ? (
                          <CheckSquare className="size-5 text-amber-400" />
                        ) : (
                          <Square className="size-5 text-neutral-500" />
                        )}
                      </div>
                    )}

                    {/* Thumbnail Image */}
                    <img
                      src={vocab.imageUrl}
                      alt={vocab.originalWord}
                      className="w-16 h-16 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
                    />

                    {/* Vocabulary Info */}
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <div className="flex items-baseline gap-1.5">
                        <h2 className="truncate text-base font-semibold text-neutral-50">
                          {vocab.originalWord}
                        </h2>
                        {vocab.wordType && (
                          <span className="shrink-0 text-xs italic text-neutral-400">
                            ({vocab.wordType})
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-sm font-medium text-amber-400">
                          {vocab.translatedWord}
                        </span>
                        {!isSelectionMode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              playAudio(vocab.translatedWord, vocab.targetSpeechLocale)
                            }}
                            aria-label="Nghe phát âm"
                            className="flex size-6 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 transition-colors hover:bg-amber-500/25 active:scale-95 cursor-pointer"
                          >
                            <Volume2 className="size-3.5" />
                          </button>
                        )}
                      </div>

                      {vocab.ipa && (
                        <p className="mt-0.5 font-mono text-[11px] text-neutral-400">
                          {vocab.ipa}
                        </p>
                      )}
                    </div>

                    {/* 3-dots Menu (hidden in selection mode) */}
                    {!isSelectionMode && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-white active:scale-95"
                          aria-label="Tùy chọn từ vựng"
                        >
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-44 border-neutral-800 bg-neutral-900 text-neutral-100 shadow-2xl">
                          {/* Copy to another folder */}
                          <DropdownMenuItem
                            onClick={() => openCopySingleModal(vocab.id)}
                            className="cursor-pointer text-xs"
                          >
                            <Copy className="size-3.5 text-amber-400" />
                            <span>Sao chép sang...</span>
                          </DropdownMenuItem>

                          {/* Move to another folder */}
                          <DropdownMenuItem
                            onClick={() => openMoveSingleModal(vocab.id)}
                            className="cursor-pointer text-xs"
                          >
                            <FolderInput className="size-3.5 text-blue-400" />
                            <span>Di chuyển</span>
                          </DropdownMenuItem>

                          {/* Delete */}
                          <DropdownMenuItem
                            onClick={() => handleDeleteSingle(vocab.id, vocab.originalWord)}
                            className="cursor-pointer text-xs text-red-400 hover:bg-red-500/15 hover:text-red-300 focus:bg-red-500/15 focus:text-red-300"
                          >
                            <Trash2 className="size-3.5 text-red-400" />
                            <span>Xóa</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </main>

        {/* Floating Action Bar in Selection Mode */}
        {isSelectionMode && (
          <div className="fixed bottom-6 left-1/2 z-50 flex w-[94%] max-w-md -translate-x-1/2 items-center justify-between gap-1.5 rounded-2xl border border-neutral-800 bg-neutral-900/95 p-2.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <span className="pl-1 text-xs font-semibold text-neutral-300 shrink-0">
              Đã chọn <span className="text-amber-400 font-bold">{selectedIds.length}</span>
            </span>

            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {/* Copy Selected Items to another folder */}
              <button
                type="button"
                onClick={openCopyBulkModal}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-1 rounded-xl bg-neutral-800 px-2.5 py-2 text-xs font-semibold text-neutral-200 transition-colors hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Copy className="size-3.5 text-amber-400" />
                <span>Sao chép</span>
              </button>

              {/* Move Selected Items to another folder */}
              <button
                type="button"
                onClick={openMoveBulkModal}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-1 rounded-xl bg-neutral-800 px-2.5 py-2 text-xs font-semibold text-neutral-200 transition-colors hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <FolderInput className="size-3.5 text-blue-400" />
                <span>Di chuyển</span>
              </button>

              {/* Delete Selected Items */}
              <button
                type="button"
                onClick={handleDeleteBulk}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-1 rounded-xl bg-red-500/20 px-2.5 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Trash2 className="size-3.5" />
                <span>Xóa ({selectedIds.length})</span>
              </button>

              {/* Cancel Selection Mode */}
              <button
                type="button"
                onClick={() => {
                  setIsSelectionMode(false)
                  setSelectedIds([])
                }}
                className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                aria-label="Đóng thanh chọn"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* Dialog 1: Copy Vocabulary to another folder */}
        <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
          <DialogContent className="w-[85%] max-w-xs rounded-3xl border-neutral-800 bg-neutral-900 p-5 text-neutral-50">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-neutral-50">Sao chép từ vựng</DialogTitle>
              <DialogDescription className="text-xs text-neutral-400">
                {targetVocabId
                  ? "Chọn thư mục đích để sao chép từ vựng này sang:"
                  : `Chọn thư mục đích cho ${selectedIds.length} từ vựng đã chọn:`}
              </DialogDescription>
            </DialogHeader>

            <div className="my-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {destinationFolders.length === 0 ? (
                <p className="text-center text-xs text-neutral-400 py-3">Không có thư mục nào khác.</p>
              ) : (
                destinationFolders.map((folder) => {
                  const isChecked = selectedTargetFolderId === folder.id
                  return (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => setSelectedTargetFolderId(folder.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition-colors ${
                        isChecked
                          ? "bg-amber-500/15 font-semibold text-amber-400 ring-1 ring-amber-400/50"
                          : "bg-neutral-800/80 text-neutral-200 hover:bg-neutral-800"
                      }`}
                    >
                      <span className="truncate">{folder.name}</span>
                      {isChecked && <Check className="size-4 text-amber-400 shrink-0" />}
                    </button>
                  )
                })
              )}
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setCopyDialogOpen(false)}
                className="flex-1 rounded-xl bg-neutral-800 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmCopy}
                disabled={destinationFolders.length === 0 || !selectedTargetFolderId}
                className="flex-1 rounded-xl bg-amber-400 py-2.5 text-xs font-semibold text-neutral-900 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sao chép
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog 2: Move Vocabulary to another folder */}
        <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
          <DialogContent className="w-[85%] max-w-xs rounded-3xl border-neutral-800 bg-neutral-900 p-5 text-neutral-50">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-neutral-50">Di chuyển từ vựng</DialogTitle>
              <DialogDescription className="text-xs text-neutral-400">
                {targetVocabId
                  ? "Chọn thư mục mới để chuyển từ vựng này sang:"
                  : `Chọn thư mục mới cho ${selectedIds.length} từ vựng đã chọn:`}
              </DialogDescription>
            </DialogHeader>

            <div className="my-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {destinationFolders.length === 0 ? (
                <p className="text-center text-xs text-neutral-400 py-3">Không có thư mục nào khác.</p>
              ) : (
                destinationFolders.map((folder) => {
                  const isChecked = selectedTargetFolderId === folder.id
                  return (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => setSelectedTargetFolderId(folder.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition-colors ${
                        isChecked
                          ? "bg-amber-500/15 font-semibold text-amber-400 ring-1 ring-amber-400/50"
                          : "bg-neutral-800/80 text-neutral-200 hover:bg-neutral-800"
                      }`}
                    >
                      <span className="truncate">{folder.name}</span>
                      {isChecked && <Check className="size-4 text-amber-400 shrink-0" />}
                    </button>
                  )
                })
              )}
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setMoveDialogOpen(false)}
                className="flex-1 rounded-xl bg-neutral-800 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmMove}
                disabled={destinationFolders.length === 0 || !selectedTargetFolderId}
                className="flex-1 rounded-xl bg-amber-400 py-2.5 text-xs font-semibold text-neutral-900 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Di chuyển
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}