import { NextResponse } from "next/server"
import postgres from "postgres"
import { getAdminFromCookies } from "@/lib/auth"
import { cookies } from "next/headers"
import { sendStreakMessage } from "@/lib/whatsapp"

const sql = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

/** POST /api/admin/gold/students/[id]/send-streak – send streak message to student via WhatsApp (admin only). */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromCookies()
    const cookieStore = await cookies()
    if (!admin && cookieStore.get("adminSession")?.value !== "true") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const studentId = parseInt(id, 10)
    if (Number.isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid student id" }, { status: 400 })
    }

    const student = await sql`
      SELECT id, full_name, whatsapp_number FROM gold_students WHERE id = ${studentId}
    `.then((r) => r[0])

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (!student.whatsapp_number || student.whatsapp_number.trim() === "") {
      return NextResponse.json(
        { error: "Student has no WhatsApp number" },
        { status: 400 }
      )
    }

    let phone = student.whatsapp_number.trim().replace(/\D/g, "")
    if (!phone.startsWith("252")) {
      if (phone.startsWith("0")) phone = phone.slice(1)
      phone = "252" + phone
    }

    const result = await sendStreakMessage(phone, student.full_name || "Arday")

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send streak via WhatsApp" },
        { status: 500 }
      )
    }

    try {
      await sql`
        INSERT INTO streak_whatsapp_sent (student_id, sent_by_admin_id)
        VALUES (${studentId}, ${(admin as { id?: number })?.id ?? null})
      `
    } catch (tableErr: unknown) {
      const msg = String(tableErr)
      if (msg.includes("does not exist") || msg.includes("relation")) {
        console.warn("streak_whatsapp_sent table missing – run scripts/056-streak-whatsapp-sent.sql")
      }
    }

    return NextResponse.json({
      success: true,
      message: "Streak sent to student via WhatsApp",
      student_name: student.full_name,
    })
  } catch (e) {
    console.error("Error sending streak:", e)
    return NextResponse.json({ error: "Failed to send streak" }, { status: 500 })
  }
}
