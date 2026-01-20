import { NextResponse } from "next/server"

/**
 * POST /api/learning/code/execute
 * Execute code using Judge0 API (free tier)
 * 
 * Note: For production, you should use a proper code execution service
 * or set up your own sandboxed environment for security.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, language, stdin = "" } = body

    if (!code || !language) {
      return NextResponse.json(
        { error: "code and language are required" },
        { status: 400 }
      )
    }

    const lang = language.toLowerCase()

    // HTML and CSS don't execute - they render/display
    if (lang === "html" || lang === "css") {
      // For HTML/CSS, we return the code as "output" since they don't execute
      // The frontend can handle rendering/preview
      return NextResponse.json({
        stdout: code,
        stderr: "",
        status: { id: 3, description: "Accepted" },
        time: "0.000",
        memory: 0,
        is_markup: true, // Flag to indicate this is markup, not executable code
      })
    }

    // Map language names to Judge0 language IDs
    const languageMap: Record<string, number> = {
      javascript: 63, // Node.js
      python: 71, // Python 3
      java: 62, // Java
      cpp: 54, // C++
      c: 50, // C
      php: 68, // PHP
      ruby: 72, // Ruby
      go: 60, // Go
      rust: 73, // Rust
      typescript: 74, // TypeScript
    }

    const languageId = languageMap[lang]
    if (!languageId) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      )
    }

    // Use Judge0 RapidAPI (free tier) or self-hosted instance
    // For now, we'll use a simple approach with Judge0 public API
    // Note: In production, use a secure, rate-limited service
    const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com"
    const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || ""

    if (!JUDGE0_API_KEY) {
      // Fallback: Return a mock response for development
      // In production, you MUST set up proper code execution
      console.warn("JUDGE0_API_KEY not set. Using mock response.")
      return NextResponse.json({
        stdout: "Mock output (set JUDGE0_API_KEY for real execution)",
        stderr: "",
        status: { id: 3, description: "Accepted" },
        time: "0.001",
        memory: 1000,
      })
    }

    // Submit code for execution
    const submitResponse = await fetch(`${JUDGE0_API_URL}/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": JUDGE0_API_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: stdin,
      }),
    })

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text()
      console.error("Judge0 submission error:", errorText)
      return NextResponse.json(
        { error: "Failed to submit code for execution" },
        { status: 500 }
      )
    }

    const submission = await submitResponse.json()
    const token = submission.token

    // Poll for result (with timeout)
    const maxAttempts = 30
    let attempts = 0

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second

      const resultResponse = await fetch(
        `${JUDGE0_API_URL}/submissions/${token}`,
        {
          headers: {
            "X-RapidAPI-Key": JUDGE0_API_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        }
      )

      if (!resultResponse.ok) {
        return NextResponse.json(
          { error: "Failed to get execution result" },
          { status: 500 }
        )
      }

      const result = await resultResponse.json()

      // Status 1 = In Queue, Status 2 = Processing
      if (result.status.id <= 2) {
        attempts++
        continue
      }

      // Execution completed
      return NextResponse.json({
        stdout: result.stdout || "",
        stderr: result.stderr || "",
        compile_output: result.compile_output || "",
        status: {
          id: result.status.id,
          description: result.status.description,
        },
        time: result.time,
        memory: result.memory,
      })
    }

    return NextResponse.json(
      { error: "Execution timeout" },
      { status: 504 }
    )
  } catch (error: any) {
    console.error("Error executing code:", error)
    return NextResponse.json(
      { error: "Failed to execute code", details: error.message },
      { status: 500 }
    )
  }
}
