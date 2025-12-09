"use client"

import { Card, CardContent } from "@/components/ui/card"
import { QrCode } from "lucide-react"

export default function QRCodesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
          <QrCode className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">QR Codes</h1>
          <p className="text-gray-600">Generate and manage QR codes</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>QR Code generation coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
