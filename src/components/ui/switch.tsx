"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        // Use flexbox justify-start/end instead of transform translate-x.
        // justify-end is a LOGICAL property that respects the dir attribute:
        //   LTR: end = right, RTL: end = left.
        // This fixes the bug where the rtl: Tailwind variant matched the
        // <html dir="rtl"> ancestor (always set by the layout) even when
        // the dashboard root div had dir="ltr" (English mode), causing the
        // thumb to translate in the wrong direction.
        "justify-start data-[state=checked]:justify-end px-0.5",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-700",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-all duration-200 ease-in-out"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
