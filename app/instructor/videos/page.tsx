"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Video, FileVideo } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function InstructorVideosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Video className="h-7 w-7 text-[#e63946]" />
          Videos
        </h1>
        <p className="text-slate-500 mt-1">Manage video content for your courses</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-12 text-center">
          <FileVideo className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Videos are managed per lesson</p>
          <p className="text-slate-500 text-sm mt-1">
            Add or edit video URLs in each course’s modules and lessons. Use Admin → Learning Courses → [Course] → modules/lessons, or the learning API.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/instructor/courses">Go to My Courses</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
