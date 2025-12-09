"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Approvals</h1>
          <p className="text-gray-600">Manage student and content approvals</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Approvals management coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
