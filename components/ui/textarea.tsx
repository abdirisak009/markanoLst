import type * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-[#253c5d] focus-visible:ring-[#253c5d]/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-24 w-full rounded-md border bg-white px-3 py-2.5 text-base shadow-sm transition-all duration-200 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm hover:border-gray-400 hover:shadow-md dark:bg-slate-800 dark:border-slate-600 dark:hover:border-slate-500",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
