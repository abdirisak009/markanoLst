"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(1,53,101,0.04)]",
        "dark:border-[#e63946]/20 dark:shadow-none",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table data-slot="table" className={cn("w-full caption-bottom text-sm", className)} {...props} />
      </div>
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "bg-gradient-to-r from-[#013565] to-[#024a8c] text-white",
        "dark:from-[#0f1419] dark:to-[#0a0a0f] dark:border-b dark:border-[#e63946]/20",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&_tr:last-child]:border-0 bg-white dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-gray-50 border-t font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-gray-100 dark:border-[#e63946]/10 transition-colors duration-150",
        "hover:bg-[#013565]/[0.03] dark:hover:bg-[#e63946]/5",
        "data-[state=selected]:bg-[#013565]/[0.08] dark:data-[state=selected]:bg-[#e63946]/10",
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 px-4 text-left align-middle font-semibold text-white whitespace-nowrap",
        "text-xs uppercase tracking-wider",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-4 align-middle text-gray-700 dark:text-gray-300",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption data-slot="table-caption" className={cn("text-muted-foreground mt-4 text-sm", className)} {...props} />
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
