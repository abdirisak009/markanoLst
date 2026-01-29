#!/usr/bin/env node
/**
 * Run on VPS: node scripts/show-last-enrollment.js
 * Shows the last enrollment (most recent row in course_payments) with user and course info.
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") })
const postgres = require("postgres")

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set in .env")
  process.exit(1)
}

const sql = postgres(DATABASE_URL, { max: 1 })

async function main() {
  const rows = await sql`
    SELECT 
      cp.id,
      cp.user_id,
      cp.course_id,
      cp.amount,
      cp.status,
      cp.payment_method,
      cp.payment_reference,
      cp.created_at,
      cp.paid_at,
      cp.updated_at,
      gs.full_name AS user_name,
      gs.email AS user_email,
      gs.whatsapp_number AS user_phone,
      lc.title AS course_title,
      lc.price AS course_price
    FROM course_payments cp
    LEFT JOIN gold_students gs ON cp.user_id = gs.id
    LEFT JOIN learning_courses lc ON cp.course_id = lc.id
    ORDER BY cp.created_at DESC
    LIMIT 1
  `
  await sql.end()
  if (rows.length === 0) {
    console.log("No enrollments in course_payments.")
    return
  }
  console.log("=== Last enrollment (course_payments) ===\n")
  console.log(JSON.stringify(rows[0], null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
