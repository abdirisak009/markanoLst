"use client"

import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"

export function Toasters() {
  return (
    <>
      <Toaster />
      <SonnerToaster position="top-center" richColors />
    </>
  )
}
