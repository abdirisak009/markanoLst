import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { student_ids, from_group_id, to_group_id } = await request.json()

    console.log("[v0] Transfer request:", {
      student_ids,
      from_group_id,
      to_group_id,
    })

    // Validate input
    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return Response.json({ message: "Student IDs are required" }, { status: 400 })
    }

    if (!to_group_id) {
      return Response.json({ message: "Target group ID is required" }, { status: 400 })
    }

    // Get target group info to validate capacity
    const targetGroup = await sql`
      SELECT id, capacity, class_id, university_id
      FROM groups
      WHERE id = ${to_group_id}
    `

    if (targetGroup.length === 0) {
      return Response.json({ message: "Target group not found" }, { status: 404 })
    }

    // Get current member count in target group
    const currentMembers = await sql`
      SELECT COUNT(*) as count
      FROM group_members
      WHERE group_id = ${to_group_id}
    `

    const currentCount = Number.parseInt(currentMembers[0].count)
    const capacity = targetGroup[0].capacity

    // Check if adding these members would exceed capacity
    if (currentCount + student_ids.length > capacity) {
      return Response.json(
        {
          message: `Cannot transfer ${student_ids.length} students. Target group capacity: ${capacity}, current: ${currentCount}`,
        },
        { status: 400 },
      )
    }

    // Remove students from ANY previous group (not just the source group)
    for (const studentId of student_ids) {
      await sql`
        DELETE FROM group_members
        WHERE student_id = ${studentId}
      `
    }

    const targetClassId = targetGroup[0].class_id
    for (const studentId of student_ids) {
      // Get student info to verify they exist
      const studentCheck = await sql`
        SELECT student_id FROM university_students 
        WHERE student_id = ${studentId}
        LIMIT 1
      `

      if (studentCheck.length === 0) {
        console.warn(`[v0] Student ${studentId} not found, skipping`)
        continue
      }

      await sql`
        UPDATE university_students
        SET class_id = ${targetClassId}
        WHERE student_id = ${studentId}
      `

      await sql`
        INSERT INTO group_members (group_id, student_id, class_id, added_by_leader, added_at)
        VALUES (
          ${to_group_id},
          ${studentId},
          ${targetClassId},
          'ADMIN_TRANSFER',
          NOW()
        )
      `
    }

    console.log("[v0] Transfer completed successfully - students moved to new class if needed")

    return Response.json({
      message: "Students transferred successfully (cross-class transfers supported)",
      transferred_count: student_ids.length,
    })
  } catch (error: any) {
    console.error("[v0] Transfer error:", error)
    return Response.json({ message: error.message || "Failed to transfer students" }, { status: 500 })
  }
}
