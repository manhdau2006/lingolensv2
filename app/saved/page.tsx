"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, Folder, MoreVertical, Pencil, Trash2, Plus, Search } from "lucide-react"
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
import { useAppStore, type Folder as StoreFolder } from "@/lib/store"
import { MenuDrawer } from "@/components/camera/menu-drawer"

export default function SavedFoldersPage() {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const folders = useAppStore((state) => state.folders)
  const vocabularies = useAppStore((state) => state.vocabularies)
  const searchQuery = useAppStore((state) => state.searchQuery)
  const setSearchQuery = useAppStore((state) => state.setSearchQuery)
  const addFolder = useAppStore((state) => state.addFolder)
  const updateFolder = useAppStore((state) => state.updateFolder)
  const deleteFolder = useAppStore((state) => state.deleteFolder)

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")

  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<StoreFolder | null>(null)
  const [renameInput, setRenameInput] = useState("")

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingFolder, setDeletingFolder] = useState<StoreFolder | null>(null)

  // Create folder handler
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return
    addFolder(newFolderName.trim())
    setNewFolderName("")
    setCreateDialogOpen(false)
    toast.success("Đã tạo thư mục thành công")
  }

  // Rename folder handler
  const handleRenameFolder = () => {
    if (!editingFolder || !renameInput.trim()) return
    updateFolder(editingFolder.id, renameInput.trim())
    setEditingFolder(null)
    setRenameInput("")
    setRenameDialogOpen(false)
    toast.success("Đã cập nhật tên thư mục thành công")
  }

  // Delete folder handler
  const handleDeleteFolder = () => {
    if (!deletingFolder) return
    deleteFolder(deletingFolder.id)
    toast.success(`Đã xóa thư mục ${deletingFolder.name}`)
    setDeletingFolder(null)
    setDeleteDialogOpen(false)
  }

  return (
    <div className="flex h-screen w-full flex-col bg-neutral-950 text-neutral-50 antialiased overflow-hidden">
      <div className="mx-auto flex h-full w-full max-w-md flex-col bg-neutral-950">
        {/* Sticky Header Section */}
        <div className="sticky top-0 z-50 shrink-0 bg-neutral-950 border-b border-zinc-800 px-4 pt-6 pb-4">
          {/* Top row: Hamburger Menu button, Page Title, Create New Button */}
          <header className="relative flex items-center justify-between pb-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Mở menu"
              className="flex size-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/80 text-neutral-200 transition-colors hover:bg-neutral-800 hover:text-white active:scale-95"
            >
              <Menu className="size-5" />
            </button>

            <h1 className="text-base font-bold text-neutral-100">
              Bộ sưu tập
            </h1>

            {/* + Tạo thư mục mới button */}
            <button
              type="button"
              onClick={() => setCreateDialogOpen(true)}
              className="flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1.5 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-400/25 active:scale-95"
            >
              <Plus className="size-3.5" />
              <span>Tạo mới</span>
            </button>
          </header>

          {/* Bottom row: Subtitle / Folder Count & Search Bar */}
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

        {/* Scrollable Content Section */}
        <main className="flex-1 overflow-y-auto px-4 py-4">

          {/* Grid Layout (2 columns on mobile) */}
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
          ) : (() => {
            const filteredFolders = folders.filter((f) =>
              f.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
            )

            if (filteredFolders.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/30 p-8 text-center">
                  <p className="text-sm text-neutral-400">
                    Không tìm thấy thư mục nào phù hợp với &quot;<span className="text-amber-400 font-medium">{searchQuery}</span>&quot;
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-3 text-xs font-semibold text-amber-400 hover:underline"
                  >
                    Xóa tìm kiếm
                  </button>
                </div>
              )
            }

            return (
              <div className="grid grid-cols-2 gap-3.5">
                {filteredFolders.map((folder) => {
                  const count = vocabularies.filter((v) => v.folderId === folder.id).length
                  return (
                    <div
                      key={folder.id}
                      className="group relative flex h-full flex-col justify-between rounded-2xl bg-white p-4 text-neutral-900 shadow-sm ring-1 ring-neutral-200/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-amber-400/60"
                    >
                      {/* 3-dots Dropdown Menu positioned top-right */}
                      <div className="absolute right-2 top-2 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="flex size-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                            aria-label="Tùy chọn thư mục"
                          >
                            <MoreVertical className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-36 border-neutral-800 bg-neutral-900 text-neutral-100 shadow-xl">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingFolder(folder)
                                setRenameInput(folder.name)
                                setRenameDialogOpen(true)
                              }}
                              className="cursor-pointer text-xs"
                            >
                              <Pencil className="size-3.5 text-amber-400" />
                              <span>Đổi tên</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setDeletingFolder(folder)
                                setDeleteDialogOpen(true)
                              }}
                              className="cursor-pointer text-xs text-red-400 hover:bg-red-500/15 hover:text-red-300 focus:bg-red-500/15 focus:text-red-300"
                            >
                              <Trash2 className="size-3.5 text-red-400" />
                              <span>Xóa</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Clickable Card Link area */}
                      <Link href={`/saved/${folder.id}`} className="block flex-1 pt-1">
                        {/* Icon & Folder Name */}
                        <div className="mb-3 flex items-center justify-between pr-6">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                            <Folder className="size-5" />
                          </div>
                        </div>

                        {/* Folder Title / Hash */}
                        <h2 className="line-clamp-1 text-base font-semibold text-neutral-900 group-hover:text-amber-600">
                          {folder.name}
                        </h2>

                        {/* Word Count */}
                        <p className="mt-4 text-xs font-medium text-neutral-500">
                          {count} từ vựng
                        </p>
                      </Link>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </main>

        {/* Dialog 1: Create New Folder */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="w-[85%] max-w-xs rounded-3xl border-neutral-800 bg-neutral-900 p-5 text-neutral-50">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-neutral-50">Tạo thư mục mới</DialogTitle>
              <DialogDescription className="text-xs text-neutral-400">
                Nhập tên thư mục để phân loại từ vựng của bạn.
              </DialogDescription>
            </DialogHeader>

            <div className="my-2">
              <input
                type="text"
                placeholder="Ví dụ: Phòng bếp, Trường học..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder()
                }}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-800/80 px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                autoFocus
              />
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setCreateDialogOpen(false)}
                className="flex-1 rounded-xl bg-neutral-800 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateFolder}
                className="flex-1 rounded-xl bg-amber-400 py-2.5 text-xs font-semibold text-neutral-900 hover:bg-amber-300"
              >
                Tạo thư mục
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog 2: Rename Folder */}
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent className="w-[85%] max-w-xs rounded-3xl border-neutral-800 bg-neutral-900 p-5 text-neutral-50">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-neutral-50">Đổi tên thư mục</DialogTitle>
              <DialogDescription className="text-xs text-neutral-400">
                Nhập tên mới cho thư mục <span className="font-semibold text-amber-400">{editingFolder?.name}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="my-2">
              <input
                type="text"
                placeholder="Tên thư mục mới..."
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameFolder()
                }}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-800/80 px-3.5 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                autoFocus
              />
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setRenameDialogOpen(false)}
                className="flex-1 rounded-xl bg-neutral-800 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleRenameFolder}
                className="flex-1 rounded-xl bg-amber-400 py-2.5 text-xs font-semibold text-neutral-900 hover:bg-amber-300"
              >
                Lưu thay đổi
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog 3: Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="w-[85%] max-w-xs rounded-3xl border-neutral-800 bg-neutral-900 p-5 text-neutral-50">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-red-400">Xóa thư mục?</DialogTitle>
              <DialogDescription className="text-xs text-neutral-300 pt-1">
                Bạn có chắc chắn muốn xóa thư mục <span className="font-semibold text-white">"{deletingFolder?.name}"</span> không? Tất cả từ vựng trong thư mục này cũng sẽ bị xóa.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="flex-1 rounded-xl bg-neutral-800 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteFolder}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-xs font-semibold text-white hover:bg-red-600"
              >
                Xóa thư mục
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Menu Drawer */}
        <MenuDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </div>
  )
}