"use client"

import { Editor } from "@monaco-editor/react"
import type { editor } from "monaco-editor"

interface CodeEditorProps {
  value: string
  onChange: (value: string | undefined) => void
  language: string
  height?: string
  readOnly?: boolean
  theme?: "vs-dark" | "light"
}

export function CodeEditor({
  value,
  onChange,
  language,
  height = "400px",
  readOnly = false,
  theme = "vs-dark",
}: CodeEditorProps) {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value)
  }

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
    })
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={theme}
        options={{
          readOnly,
          wordWrap: "on",
          lineNumbers: "on",
          roundedSelection: false,
          cursorStyle: "line",
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  )
}
