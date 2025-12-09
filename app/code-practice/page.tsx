"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play } from "lucide-react"

export default function CodePracticePage() {
  const [htmlCode, setHtmlCode] = useState(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
</head>
<body>
  <h1>Hello, Markano!</h1>
  <p>Start coding here...</p>
</body>
</html>`,
  )

  const [cssCode, setCssCode] = useState(
    `body {
  font-family: Arial, sans-serif;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

h1 {
  color: #fff;
  text-align: center;
}

p {
  font-size: 18px;
  line-height: 1.6;
}`,
  )

  const [jsCode, setJsCode] = useState(
    `// Try some JavaScript!
console.log("Welcome to Markano Code Practice!");

document.addEventListener('DOMContentLoaded', () => {
  const h1 = document.querySelector('h1');
  if (h1) {
    h1.addEventListener('click', () => {
      h1.style.color = '#FFD700';
    });
  }
});`,
  )

  const [output, setOutput] = useState("")

  const runCode = () => {
    const fullCode = `
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>${jsCode}</script>
        </body>
      </html>
    `
    setOutput(fullCode)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">Code Practice Playground</h1>
          <p className="text-gray-600">Write HTML, CSS, and JavaScript code and see the results instantly</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1e3a5f]">Code Editor</h2>
              <Button onClick={runCode} className="bg-[#ef4444] hover:bg-[#dc2626]">
                <Play className="h-4 w-4 mr-2" />
                Run Code
              </Button>
            </div>

            <Tabs defaultValue="html">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="mt-4">
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="w-full h-96 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg border-0 focus:ring-2 focus:ring-[#ef4444] resize-none"
                  spellCheck={false}
                />
              </TabsContent>

              <TabsContent value="css" className="mt-4">
                <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  className="w-full h-96 p-4 bg-gray-900 text-blue-400 font-mono text-sm rounded-lg border-0 focus:ring-2 focus:ring-[#ef4444] resize-none"
                  spellCheck={false}
                />
              </TabsContent>

              <TabsContent value="javascript" className="mt-4">
                <textarea
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  className="w-full h-96 p-4 bg-gray-900 text-yellow-400 font-mono text-sm rounded-lg border-0 focus:ring-2 focus:ring-[#ef4444] resize-none"
                  spellCheck={false}
                />
              </TabsContent>
            </Tabs>
          </Card>

          {/* Live Preview */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">Live Preview</h2>
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
              {output ? (
                <iframe srcDoc={output} title="Preview" className="w-full h-[500px] border-0" sandbox="allow-scripts" />
              ) : (
                <div className="h-[500px] flex items-center justify-center text-gray-400">
                  Click "Run Code" to see your output
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sample Exercises */}
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">Sample Exercises</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:border-[#ef4444] transition-colors cursor-pointer">
              <h3 className="font-semibold text-[#1e3a5f] mb-2">Exercise 1: Create a Card</h3>
              <p className="text-sm text-gray-600">Build a profile card with an image, name, and description</p>
            </div>
            <div className="border rounded-lg p-4 hover:border-[#ef4444] transition-colors cursor-pointer">
              <h3 className="font-semibold text-[#1e3a5f] mb-2">Exercise 2: Responsive Grid</h3>
              <p className="text-sm text-gray-600">Create a responsive grid layout that adapts to screen size</p>
            </div>
            <div className="border rounded-lg p-4 hover:border-[#ef4444] transition-colors cursor-pointer">
              <h3 className="font-semibold text-[#1e3a5f] mb-2">Exercise 3: Interactive Button</h3>
              <p className="text-sm text-gray-600">Make a button that changes color when clicked using JavaScript</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
