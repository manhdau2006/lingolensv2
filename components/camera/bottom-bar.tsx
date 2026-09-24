"use client"

import { ImageIcon, SwitchCamera, Loader2 } from "lucide-react"

type BottomBarProps = {
  onCapture: () => void
  onFlip: () => void
  onPickGallery: () => void
  isCapturing?: boolean
}

export function BottomBar({ onCapture, onFlip, onPickGallery, isCapturing = false }: BottomBarProps) {
  return (
    <footer className="relative z-10 flex items-center justify-between px-12 pb-10 pt-6">
      {/* gallery */}
      <button
        type="button"
        onClick={onPickGallery}
        disabled={isCapturing}
        aria-label="Chọn ảnh từ thư viện"
        className="flex size-12 items-center justify-center rounded-full bg-neutral-800/70 text-neutral-100 backdrop-blur transition-colors hover:bg-neutral-700 active:scale-95 disabled:opacity-50"
      >
        <ImageIcon className="size-6" />
      </button>

      {/* shutter (Locket-style ring) */}
      <button
        type="button"
        onClick={onCapture}
        disabled={isCapturing}
        aria-label="Chụp ảnh"
        className="group relative flex size-20 items-center justify-center rounded-full ring-4 ring-white/90 transition-transform active:scale-95 disabled:opacity-75 disabled:pointer-events-none"
      >
        {isCapturing ? (
          <span className="flex size-16 items-center justify-center rounded-full bg-amber-400">
            <Loader2 className="size-8 animate-spin text-neutral-950" />
          </span>
        ) : (
          <span className="size-16 rounded-full bg-white transition-colors group-hover:bg-neutral-200 group-active:bg-amber-400" />
        )}
      </button>

      {/* flip camera */}
      <button
        type="button"
        onClick={onFlip}
        disabled={isCapturing}
        aria-label="Lật camera"
        className="flex size-12 items-center justify-center rounded-full bg-neutral-800/70 text-neutral-100 backdrop-blur transition-colors hover:bg-neutral-700 active:scale-95 disabled:opacity-50"
      >
        <SwitchCamera className="size-6" />
      </button>
    </footer>
  )
}
