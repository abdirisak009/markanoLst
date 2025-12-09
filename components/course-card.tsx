import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, BookOpen, Star, Users } from "lucide-react"

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  duration: string
  thumbnail: string | null
  rating: number | string
  students_count: number
  modules_count: number
  lessons_count: number
  type: string
}

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const ratingValue =
    typeof course.rating === "number" ? course.rating : Number.parseFloat(course.rating?.toString() || "0")

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 hover:border-[#ef4444]/20">
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
        {course.thumbnail ? (
          <img
            src={course.thumbnail || "/placeholder.svg"}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-20 w-20 text-white/50" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-[#ef4444] text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
          <Star className="h-4 w-4 fill-current" />
          {ratingValue.toFixed(1)}
        </div>
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#1e3a5f] px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          {course.type}
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-[#1e3a5f] mb-2 line-clamp-2 group-hover:text-[#ef4444] transition-colors">
          {course.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
        <p className="text-sm text-gray-500 mb-4">
          <span className="font-semibold">Instructor:</span> {course.instructor}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-[#ef4444]" />
            <span className="font-medium">{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-[#ef4444]" />
            <span className="font-medium">{course.lessons_count} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-[#ef4444]" />
            <span className="font-medium">{course.students_count}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button className="w-full bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#b91c1c] text-white font-semibold shadow-lg hover:shadow-xl transition-all">
            View Course Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
