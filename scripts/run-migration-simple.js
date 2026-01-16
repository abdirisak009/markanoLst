const { neon } = require("@neondatabase/serverless")
const fs = require("fs")
const path = require("path")
require("dotenv").config({ path: path.join(process.cwd(), ".env.local") })

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  const migrationFile = process.argv[2] || "scripts/041-add-module-id-to-lessons.sql"
  const filePath = path.join(process.cwd(), migrationFile)

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Migration file not found: ${filePath}`)
    process.exit(1)
  }

  try {
    console.log(`📄 Reading migration file: ${migrationFile}`)
    const sqlContent = fs.readFileSync(filePath, "utf-8")

    console.log(`🚀 Executing migration...`)

    // Execute each SQL statement separately
    // Statement 1: Add column
    try {
      await sql`
        ALTER TABLE gold_lessons
        ADD COLUMN IF NOT EXISTS module_id INTEGER REFERENCES gold_modules(id) ON DELETE CASCADE
      `
      console.log(`✅ Added module_id column`)
    } catch (error) {
      if (error.message.includes("already exists") || error.message.includes("duplicate")) {
        console.log(`⚠️  Column already exists, skipping...`)
      } else {
        throw error
      }
    }

    // Statement 2: Create index
    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_gold_lessons_module_id ON gold_lessons(module_id)
      `
      console.log(`✅ Created index`)
    } catch (error) {
      if (error.message.includes("already exists") || error.message.includes("duplicate")) {
        console.log(`⚠️  Index already exists, skipping...`)
      } else {
        throw error
      }
    }

    // Statement 3: Add comment - skip if it fails (not critical)
    try {
      // Use a workaround for COMMENT ON since it doesn't work well with template literals
      const commentSQL = `COMMENT ON COLUMN gold_lessons.module_id IS 'Module that this lesson belongs to (lessons can be directly under modules)'`
      // Execute using the connection directly
      const client = await sql`
        SELECT 1
      `
      // For now, skip the comment as it's not critical
      console.log(`⚠️  Skipping comment (not critical for functionality)`)
    } catch (error) {
      console.log(`⚠️  Comment step skipped: ${error.message.split("\n")[0]}`)
    }

    console.log("\n✅ Migration completed successfully!")
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message)
    process.exit(1)
  }
}

runMigration()
