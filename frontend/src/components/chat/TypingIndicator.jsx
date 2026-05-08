export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
        {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" style={{ animationDelay: `${i * 120}ms` }} />)}
      </div>
    </div>
  )
}
