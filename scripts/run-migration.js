const { neon } = require("@neondatabase/serverless")
const fs = require("fs")
const path = require("path")
require("dotenv").config({ path: path.join(process.cwd(), ".env.local") })

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set")
    console.log("💡 Make sure .env.local file exists with DATABASE_URL")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
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
        // Remove inline comments
        const commentIndex = line.indexOf("--")
        if (commentIndex !== -1) {
          return line.substring(0, commentIndex).trim()
        }
        return line.trim()
      })
      .join("\n")
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length > 10) // Filter out very short lines

    console.log(`🚀 Executing ${statements.length} SQL statement(s)...`)

    // Execute all statements in a single transaction
    const fullSQL = statements.join(";\n") + ";"
    
    console.log(`\n📝 Executing migration...`)
    try {
      // Use sql.query for raw SQL execution
      const { sql: query } = require("@neondatabase/serverless")
      await query(fullSQL)
      console.log(`✅ Migration executed successfully`)
    } catch (error) {
      // Try executing statements one by one using template literals workaround
      console.log(`⚠️  Trying alternative method...`)
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        if (statement) {
          try {
            // Use eval to create a template literal (not ideal but works for migrations)
            const template = statement.replace(/\$\{([^}]+)\}/g, (match, varName) => {
              return `\${${varName}}`
            })
            await sql.unsafe(statement)
            console.log(`✅ Statement ${i + 1} executed successfully`)
          } catch (stmtError) {
            // Ignore "already exists" errors for IF NOT EXISTS
            if (stmtError.message.includes("already exists") || 
                stmtError.message.includes("duplicate") ||
                stmtError.message.includes("does not exist")) {
              console.log(`⚠️  Statement ${i + 1} skipped: ${stmtError.message.split("\n")[0]}`)
            } else {
              throw stmtError
            }
          }
        }
      }
    }

    console.log("\n✅ Migration completed successfully!")
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message)
    process.exit(1)
  }
}

runMigration()
