const postgres = require("postgres")
const fs = require("fs")
const path = require("path")
require("dotenv").config({ path: path.join(process.cwd(), ".env.local") })

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1, idle_timeout: 20, connect_timeout: 10 })
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

    console.log("\n✅ Migration completed successfully!")
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

runMigration()
