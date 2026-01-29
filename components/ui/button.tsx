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
          "bg-[#31827a]  text-white hover:opacity-90 shadow-md hover:shadow-lg hover:shadow-[#31827a]/20 active:scale-[0.98]",
        destructive:
          "bg-black text-white hover:opacity-90 shadow-md hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]",
        outline:
          "border-2 border-[#31827a] bg-white text-[#31827a] shadow-sm hover:bg-[#31827a] hover:text-white active:scale-[0.98]",
        secondary: "bg-[#eef4ff] text-[#31827a] hover:bg-[#d4f0c4] active:scale-[0.98]",
        ghost: "text-[#31827a] hover:bg-[#31827a]/10 active:scale-[0.98]",
        link: "text-[#31827a] underline-offset-4 hover:underline hover:text-[#31827a]",
        accent:
          "bg-[#31827a] text-white hover:opacity-90 shadow-md hover:shadow-lg hover:shadow-[#31827a]/30 active:scale-[0.98]",
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
