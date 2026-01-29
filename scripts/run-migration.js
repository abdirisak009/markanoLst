const postgres = require("postgres")
const fs = require("fs")
const path = require("path")
require("dotenv").config({ path: path.join(process.cwd(), ".env.local") })

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set")
    console.log("💡 Make sure .env.local file exists with DATABASE_URL")
    process.exit(1)
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1, idle_timeout: 20, connect_timeout: 10 })
  const migrationFile = process.argv[2]

  if (!migrationFile) {
    console.error("❌ Please provide a migration file path")
    console.log("Usage: node scripts/run-migration.js scripts/041-add-module-id-to-lessons.sql")
    process.exit(1)
  }

  const filePath = path.join(process.cwd(), migrationFile)

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Migration file not found: ${filePath}`)
    process.exit(1)
  }

  try {
    console.log(`📄 Reading migration file: ${migrationFile}`)
    const sqlContent = fs.readFileSync(filePath, "utf-8")

    // Remove comments and split by semicolons
    const statements = sqlContent
      .split("\n")
      .map((line) => {
        const commentIndex = line.indexOf("--")
        if (commentIndex !== -1) {
          return line.substring(0, commentIndex).trim()
        }
        return line.trim()
      })
      .join("\n")
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length > 10)

    console.log(`🚀 Executing ${statements.length} SQL statement(s)...`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement) {
        try {
          await sql.unsafe(statement + ";")
          console.log(`✅ Statement ${i + 1} executed successfully`)
        } catch (stmtError) {
          if (
            stmtError.message.includes("already exists") ||
            stmtError.message.includes("duplicate") ||
            stmtError.message.includes("does not exist")
          ) {
            console.log(`⚠️  Statement ${i + 1} skipped: ${stmtError.message.split("\n")[0]}`)
          } else {
            throw stmtError
          }
        }
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
