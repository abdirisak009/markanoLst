"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award } from "lucide-react"
import Link from "next/link"

export default function GoldAdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl">
                <Award className="h-8 w-8 text-white" />
              </div>
              Markano Gold
            </h1>
            <p className="text-slate-400 mt-1">Gold Platform</p>
          </div>
          <Link href="/admin">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
              Back to Admin
            </Button>
          </Link>
        </div>

        {/* Empty State */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Markano Gold</CardTitle>
            <CardDescription className="text-slate-400">Gold platform features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Award className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">Gold features are not available</p>
              <p className="text-slate-500 text-sm">This section has been removed from the system.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
