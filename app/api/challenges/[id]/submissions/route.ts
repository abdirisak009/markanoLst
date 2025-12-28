import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: challengeId } = await params
    const { searchParams } = new URL(request.url)
    const round = searchParams.get("round")
    const studentId = searchParams.get("student_id")

    let submissions

    if (!round && !studentId) {
      submissions = await sql`
        SELECT 
          cs.*,
          us.full_name as student_name,
          us.class_id
        FROM challenge_submissions cs
        JOIN university_students us ON cs.student_id = us.student_id
        WHERE cs.challenge_id = ${challengeId}
        ORDER BY cs.submitted_at DESC
      `
    } else if (round && studentId) {
      submissions = await sql`
        SELECT 
          cs.*,
          us.full_name as student_name,
          us.class_id
        FROM challenge_submissions cs
        JOIN university_students us ON cs.student_id = us.student_id
        WHERE cs.challenge_id = ${challengeId}
          AND cs.round_number = ${Number.parseInt(round)}
          AND cs.student_id = ${studentId}
        ORDER BY cs.submitted_at DESC
      `
    } else if (round) {
      submissions = await sql`
        SELECT 
          cs.*,
          us.full_name as student_name,
          us.class_id
        FROM challenge_submissions cs
        JOIN university_students us ON cs.student_id = us.student_id
        WHERE cs.challenge_id = ${challengeId}
          AND cs.round_number = ${Number.parseInt(round)}
        ORDER BY cs.submitted_at DESC
      `
    } else {
      submissions = await sql`
        SELECT 
          cs.*,
          us.full_name as student_name,
          us.class_id
        FROM challenge_submissions cs
        JOIN university_students us ON cs.student_id = us.student_id
        WHERE cs.challenge_id = ${challengeId}
          AND cs.student_id = ${studentId}
        ORDER BY cs.submitted_at DESC
      `
    }

    return Response.json({ submissions })
  } catch (error) {
    console.error("[v0] Error fetching submissions:", error)
    return Response.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: challengeId } = await params
    const body = await request.json()
    const { student_id, round_number, submission_content, submission_url } = body

    const [submission] = await sql`
      INSERT INTO challenge_submissions (
        challenge_id, student_id, round_number, submission_content, submission_url
      ) VALUES (
        ${challengeId}, ${student_id}, ${round_number || 1}, ${submission_content}, ${submission_url}
      )
      RETURNING *
    `

    return Response.json({ submission }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating submission:", error)
    return Response.json({ error: "Failed to create submission" }, { status: 500 })
  }
}
