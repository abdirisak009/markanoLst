import postgres from "postgres"
import { type NextRequest, NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function POST(req: NextRequest) {
  try {
    const { student_id } = await req.json()

    if (!student_id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    // Get student info
    const studentResult = await sql`
      SELECT 
        us.student_id,
        us.full_name,
        us.phone,
        us.gender,
        us.status,
        c.name as class_name,
        c.id as class_id,
        u.name as university_name,
        u.abbreviation as university_abbr
      FROM university_students us
      LEFT JOIN classes c ON us.class_id = c.id
      LEFT JOIN universities u ON us.university_id = u.id
      WHERE us.student_id = ${student_id}
    `

    if (studentResult.length === 0) {
      return NextResponse.json(
        { error: "Student ID-kan lama helin. Fadlan hubi inaad si sax ah u gelisay." },
        { status: 404 },
      )
    }

    const student = studentResult[0]

    // Get all assignments for this student's class
    const assignmentsResult = await sql`
      SELECT 
        a.id,
        a.title,
        a.description,
        a.max_marks,
        a.due_date,
        a.period,
        sm.marks_obtained,
        sm.percentage,
        sm.grade,
        sm.submitted_at
      FROM assignments a
      LEFT JOIN student_marks sm ON a.id = sm.assignment_id AND sm.student_id = ${student_id}
      WHERE a.class_id = ${student.class_id}
      ORDER BY a.due_date DESC, a.id DESC
    `

    // Calculate statistics
    const gradedAssignments = assignmentsResult.filter((a: any) => a.marks_obtained !== null)
    const totalMarksObtained = gradedAssignments.reduce((sum: number, a: any) => sum + Number(a.marks_obtained || 0), 0)
    const totalMaxMarks = gradedAssignments.reduce((sum: number, a: any) => sum + Number(a.max_marks || 0), 0)
    const averagePercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0

    // Get class rank
    const rankResult = await sql`
      WITH student_totals AS (
        SELECT 
          sm.student_id,
          SUM(sm.marks_obtained) as total_marks
        FROM student_marks sm
        JOIN assignments a ON sm.assignment_id = a.id
        WHERE a.class_id = ${student.class_id}
        GROUP BY sm.student_id
      ),
      ranked AS (
        SELECT 
          student_id,
          total_marks,
          RANK() OVER (ORDER BY total_marks DESC) as rank
        FROM student_totals
      )
      SELECT rank, total_marks, (SELECT COUNT(*) FROM ranked) as total_students
      FROM ranked
      WHERE student_id = ${student_id}
    `

    const rankInfo = rankResult.length > 0 ? rankResult[0] : { rank: null, total_students: 0 }

    // Get video watch progress
    const videoProgressResult = await sql`
      SELECT 
        COUNT(DISTINCT vwh.video_id) as videos_watched,
        COALESCE(SUM(vwh.watch_duration), 0) as total_watch_time,
        (SELECT COUNT(*) FROM videos WHERE access_type = 'free' OR access_type IS NULL) as total_videos
      FROM video_watch_history vwh
      WHERE vwh.student_id = ${student_id}
    `

    const videoProgress = videoProgressResult[0] || { videos_watched: 0, total_watch_time: 0, total_videos: 0 }

    return NextResponse.json({
      student: {
        ...student,
        rank: rankInfo.rank,
        total_students: rankInfo.total_students,
      },
      assignments: assignmentsResult,
      statistics: {
        total_assignments: assignmentsResult.length,
        graded_assignments: gradedAssignments.length,
        pending_assignments: assignmentsResult.length - gradedAssignments.length,
        total_marks_obtained: totalMarksObtained,
        total_max_marks: totalMaxMarks,
        average_percentage: Math.round(averagePercentage * 10) / 10,
        class_rank: rankInfo.rank,
        total_students_in_class: rankInfo.total_students,
      },
      video_progress: {
        videos_watched: Number(videoProgress.videos_watched) || 0,
        total_videos: Number(videoProgress.total_videos) || 0,
        total_watch_time: Number(videoProgress.total_watch_time) || 0,
      },
    })
  } catch (error) {
    console.error("Error fetching student performance:", error)
    return NextResponse.json({ error: "Failed to fetch performance data" }, { status: 500 })
  }
}
