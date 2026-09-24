"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

export function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex items-center justify-between gap-2 rounded-full bg-neutral-800/70 px-4 py-2.5 text-sm font-medium text-neutral-100 backdrop-blur transition-colors hover:bg-neutral-700 active:scale-95 outline-none cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon data-slot="select-icon" render={<ChevronDown className="size-4 text-neutral-400" />} />
    </SelectPrimitive.Trigger>
  )
}

export function SelectValue({ placeholder, ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" placeholder={placeholder} {...props} />
}

export function SelectPortal({ ...props }: React.ComponentProps<typeof SelectPrimitive.Portal>) {
  return <SelectPrimitive.Portal data-slot="select-portal" {...props} />
}

export function SelectContent({ className, children, sideOffset = 4, position = "popper", ...props }: React.ComponentProps<typeof SelectPrimitive.Positioner> & { position?: "popper" | "item-aligned" }) {
  return (
    <SelectPortal>
      <SelectPrimitive.Positioner sideOffset={sideOffset} alignItemWithTrigger={position === "item-aligned"} data-slot="select-positioner" className={cn("z-50", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1")} {...props}>
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "min-w-36 origin-top-right overflow-y-auto max-h-[300px] rounded-2xl border border-neutral-800 bg-neutral-900 p-1.5 shadow-2xl shadow-black/50 text-neutral-100 animate-in fade-in zoom-in-95 duration-150",
            position === "popper" && "max-h-[var(--radix-select-content-available-height)] w-[var(--radix-select-trigger-width)]",
            className
          )}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPortal>
  )
}

export function SelectItem({ className, children, value, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      value={value}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-neutral-200 transition-colors hover:bg-neutral-800 data-[highlighted]:bg-neutral-800 data-[selected]:bg-amber-500/15 data-[selected]:text-amber-300 outline-none",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText data-slot="select-item-text">{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator data-slot="select-item-indicator">
        <Check className="size-4 shrink-0 text-amber-400" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}
