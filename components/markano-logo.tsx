export function MarkanoLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { container: "h-8", text: "text-xl" },
    md: { container: "h-12", text: "text-3xl" },
    lg: { container: "h-16", text: "text-4xl" },
  }

  return (
    <div className={`flex items-center ${sizes[size].container}`}>
      <span className={`${sizes[size].text} font-bold text-[#31827a]`}>Markano</span>
    </div>
  )
}
