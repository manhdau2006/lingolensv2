"use client"

import Link from "next/link"
import { Camera, BookMarked, Layers, ChevronRight } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"

type MenuDrawerProps = {
  open: boolean
  onClose: () => void
}

const LINKS = [
  { label: "Trang chủ", description: "Camera dịch từ vựng", icon: Camera, href: "/" },
  { label: "Từ vựng đã lưu", description: "Bộ sưu tập từ của bạn", icon: BookMarked, href: "/saved" },
  { label: "Flashcards", description: "Ôn tập theo thẻ ghi nhớ", icon: Layers, href: "/flashcards" },
]

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent side="left" className="flex flex-col justify-between w-[82%] max-w-xs border-r border-neutral-800 bg-neutral-900 p-0 text-neutral-50 sm:max-w-xs">
        <div>
          <SheetHeader className="px-5 pt-6 pb-4 border-b border-neutral-800/50 text-left">
            <SheetTitle className="text-lg font-semibold text-neutral-50">LingoLens</SheetTitle>
            <SheetDescription className="text-sm text-neutral-400">Học từ vựng qua ống kính</SheetDescription>
          </SheetHeader>

          <nav className="flex flex-col gap-2 px-3 pt-4">
            {LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="group flex items-center gap-3 rounded-2xl bg-neutral-800/50 px-3 py-3.5 transition-colors hover:bg-neutral-800"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                  <link.icon className="size-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-neutral-50">{link.label}</span>
                  <span className="block text-xs text-neutral-400">{link.description}</span>
                </span>
                <ChevronRight className="size-4 text-neutral-500 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Credit Information */}
        <div className="mx-3 mb-16 rounded-2xl border border-neutral-800/80 bg-neutral-950/60 p-4 text-xs text-neutral-400">
          <p className="font-semibold text-neutral-200">Developed by Duc Manh Dau</p>
          <p className="mt-1 font-medium text-neutral-400">IT1 | HUST &apos;28</p>
          <p className="mt-1 text-neutral-400">
            Contact:{" "}
            <a
              href="mailto:manhdau2006@gmail.com"
              className="text-amber-400 font-medium hover:underline transition-colors"
            >
              manhdau2006@gmail.com
            </a>
          </p>
          <p className="mt-1 text-neutral-400">
            LinkedIn:{" "}
            <a
              href="https://www.linkedin.com/in/duc-manh-dau-b06360244"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 font-medium hover:underline transition-colors"
            >
              Duc Manh Dau
            </a>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}


