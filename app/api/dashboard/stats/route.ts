import postgres from "postgres"
import { NextResponse } from "next/server"

const sql = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20, connect_timeout: 10 })

export async function GET() {
  try {
    // Get total counts
    const [studentsCount] = await sql`
      SELECT 
        (SELECT COUNT(*) FROM university_students) as university_students,
        (SELECT COUNT(*) FROM penn_students) as penn_students
    `

    const [videosCount] = await sql`
      SELECT COUNT(*) as total, SUM(views) as total_views FROM videos
    `

    const [groupsCount] = await sql`
      SELECT COUNT(*) as total FROM groups
    `

    const [classesCount] = await sql`
      SELECT COUNT(*) as total FROM classes
    `

    // Get top performing students by marks
    const topStudents = await sql`
      SELECT 
        us.full_name,
        us.student_id,
        c.name as class_name,
        ROUND(AVG(sm.percentage), 1) as avg_percentage,
        COUNT(sm.id) as assignments_completed
      FROM university_students us
      JOIN student_marks sm ON us.student_id = sm.student_id
      JOIN classes c ON us.class_id = c.id
      GROUP BY us.student_id, us.full_name, c.name
      HAVING COUNT(sm.id) > 0
      ORDER BY avg_percentage DESC
      LIMIT 10
    `

    // Get group statistics
    const groupStats = await sql`
      SELECT 
        g.id,
        g.name as group_name,
        c.name as class_name,
        g.capacity,
        COUNT(gm.id) as member_count,
        (SELECT COUNT(*) FROM group_payments gp WHERE gp.group_id = g.id) as paid_count
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN classes c ON g.class_id = c.id
      GROUP BY g.id, g.name, c.name, g.capacity
      ORDER BY member_count DESC
      LIMIT 6
    `

    // Get video views by category
    const videosByCategory = await sql`
      SELECT 
        category,
        COUNT(*) as video_count,
        SUM(views) as total_views
      FROM videos
      GROUP BY category
      ORDER BY total_views DESC
    `

    // Get recent marks/performance data for chart
    const performanceData = await sql`
      SELECT 
        DATE_TRUNC('day', sm.submitted_at) as date,
        ROUND(AVG(sm.percentage), 1) as avg_score,
        COUNT(*) as submissions
      FROM student_marks sm
      WHERE sm.submitted_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', sm.submitted_at)
      ORDER BY date ASC
    `

    // Get class distribution
    const classDistribution = await sql`
      SELECT 
        c.name as class_name,
        COUNT(us.id) as student_count
      FROM classes c
      LEFT JOIN university_students us ON c.id = us.class_id
      GROUP BY c.id, c.name
      ORDER BY student_count DESC
      LIMIT 8
    `

    // Get payment summary
    const [paymentSummary] = await sql`
      SELECT 
        COALESCE(SUM(gp.amount_paid), 0) as total_collected,
        COALESCE((SELECT SUM(amount) FROM group_expenses), 0) as total_expenses,
        COALESCE((SELECT SUM(amount) FROM general_expenses), 0) as general_expenses
      FROM group_payments gp
    `

    return NextResponse.json({
      totalStudents: Number(studentsCount.university_students) + Number(studentsCount.penn_students),
      universityStudents: Number(studentsCount.university_students),
      pennStudents: Number(studentsCount.penn_students),
      totalVideos: Number(videosCount.total),
      totalViews: Number(videosCount.total_views) || 0,
      totalGroups: Number(groupsCount.total),
      totalClasses: Number(classesCount.total),
      topStudents,
      groupStats,
      videosByCategory,
      performanceData,
      classDistribution,
      paymentSummary: {
        totalCollected: Number(paymentSummary.total_collected),
        totalExpenses: Number(paymentSummary.total_expenses) + Number(paymentSummary.general_expenses),
        netBalance:
          Number(paymentSummary.total_collected) -
          Number(paymentSummary.total_expenses) -
          Number(paymentSummary.general_expenses),
      },
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
