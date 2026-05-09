export default function TypingIndicator() {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold">
        AI
      </div>
      <div className="glass rounded-2xl rounded-bl-sm border-l-[3px] border-l-blue-400 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="mr-2 text-xs text-slate-400">Thinking</span>
          <div className="dot-bounce h-1.5 w-1.5 rounded-full bg-blue-400" />
          <div className="dot-bounce h-1.5 w-1.5 rounded-full bg-violet-400" />
          <div className="dot-bounce h-1.5 w-1.5 rounded-full bg-pink-400" />
        </div>
      </div>
    </div>
  )
}
