import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#013565] to-[#024a8c] text-white hover:from-[#024a8c] hover:to-[#013565] shadow-md hover:shadow-lg hover:shadow-[#013565]/20 active:scale-[0.98]",
        destructive:
          "bg-gradient-to-r from-[#ff1b4a] to-[#ff4d6d] text-white hover:from-[#d9143f] hover:to-[#ff1b4a] shadow-md hover:shadow-lg hover:shadow-[#ff1b4a]/20 active:scale-[0.98]",
        outline:
          "border-2 border-[#013565] bg-white text-[#013565] shadow-sm hover:bg-[#013565] hover:text-white active:scale-[0.98]",
        secondary: "bg-gray-100 text-[#013565] hover:bg-gray-200 active:scale-[0.98]",
        ghost: "text-[#013565] hover:bg-[#013565]/10 active:scale-[0.98]",
        link: "text-[#013565] underline-offset-4 hover:underline hover:text-[#ff1b4a]",
        accent:
          "bg-gradient-to-r from-[#ff1b4a] to-[#ff4d6d] text-white hover:from-[#ff4d6d] hover:to-[#ff1b4a] shadow-md hover:shadow-lg hover:shadow-[#ff1b4a]/20 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-lg px-8 text-base has-[>svg]:px-5",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
