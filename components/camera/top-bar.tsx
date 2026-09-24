"use client"

import { Menu, ArrowRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SUPPORTED_LANGUAGES, getLanguageByCode } from "@/lib/vocab"
import { useAppStore } from "@/lib/store"

type TopBarProps = {
  onOpenMenu: () => void
}

export function TopBar({ onOpenMenu }: TopBarProps) {
  const sourceLanguage = useAppStore((state) => state.sourceLanguage)
  const targetLanguage = useAppStore((state) => state.targetLanguage)
  const setSourceLanguage = useAppStore((state) => state.setSourceLanguage)
  const setTargetLanguage = useAppStore((state) => state.setTargetLanguage)
  const swapLanguages = useAppStore((state) => state.swapLanguages)

  const currentSource = getLanguageByCode(sourceLanguage)
  const currentTarget = getLanguageByCode(targetLanguage)

  return (
    <header className="relative z-20 flex items-center justify-between px-4 pt-6 pb-2">
      {/* Nút Menu */}
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Mở menu"
        className="flex size-11 items-center justify-center rounded-full bg-neutral-800/70 text-neutral-100 backdrop-blur transition-colors hover:bg-neutral-700 active:scale-95"
      >
        <Menu className="size-5" />
      </button>

      {/* Bộ chọn ngôn ngữ động với Select component của shadcn */}
      <div className="flex items-center gap-1.5 rounded-full bg-neutral-800/70 p-1 backdrop-blur ring-1 ring-white/10">
        {/* Ngôn ngữ gốc */}
        <Select
          value={sourceLanguage}
          onValueChange={(val) => {
            if (typeof val === "string") setSourceLanguage(val)
          }}
        >
          <SelectTrigger className="border-none bg-transparent px-3 py-1.5 text-xs font-medium text-neutral-100 shadow-none hover:bg-neutral-700/50">
            <SelectValue placeholder="Gốc">{currentSource.label}</SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" sideOffset={8} className="min-w-36 w-[var(--radix-select-trigger-width)] max-h-[160px] overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={`source-${lang.code}`} value={lang.code}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Nút đổi chiều ngôn ngữ */}
        <button
          type="button"
          onClick={swapLanguages}
          aria-label="Đổi chiều ngôn ngữ"
          className="flex items-center justify-center p-1 transition-transform active:scale-90 hover:opacity-80"
        >
          <ArrowRight className="size-3.5 shrink-0 text-amber-400" />
        </button>

        {/* Ngôn ngữ đích */}
        <Select
          value={targetLanguage}
          onValueChange={(val) => {
            if (typeof val === "string") setTargetLanguage(val)
          }}
        >
          <SelectTrigger className="border-none bg-transparent px-3 py-1.5 text-xs font-medium text-neutral-100 shadow-none hover:bg-neutral-700/50">
            <SelectValue placeholder="Đích">{currentTarget.label}</SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" sideOffset={8} className="min-w-36 w-[var(--radix-select-trigger-width)] max-h-[160px] overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={`target-${lang.code}`} value={lang.code}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  )
}

