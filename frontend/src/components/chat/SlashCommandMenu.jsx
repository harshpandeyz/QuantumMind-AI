import { useEffect, useState } from 'react'

const commands = [
  { command: '/rag on', desc: 'Enable retrieval context' },
  { command: '/rag off', desc: 'Disable retrieval context' },
  { command: '/new chat', desc: 'Start a fresh mission thread' },
  { command: '/clear', desc: 'Clear the current input' },
  { command: '/docs', desc: 'Open knowledge source selector' },
]

export default function SlashCommandMenu({ onSelect, onClose }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActive((index) => (index + 1) % commands.length)
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActive((index) => (index - 1 + commands.length) % commands.length)
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        onSelect(commands[active].command)
      }
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [active, onClose, onSelect])

  return (
    <div className="absolute bottom-full left-8 z-20 mb-3 w-80 overflow-hidden rounded-md border border-cyan-300/30 bg-[#061427]/95 shadow-[var(--glow-cyan)] backdrop-blur">
      {commands.map((item, index) => (
        <button
          key={item.command}
          type="button"
          onMouseDown={(event) => {
            event.preventDefault()
            onSelect(item.command)
          }}
          className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition ${index === active ? 'bg-cyan-300/10 text-white' : 'text-slate-300 hover:bg-white/5'}`}
        >
          <span className="font-mono-hud text-sm text-cyan-200">{item.command}</span>
          <span className="text-xs text-slate-500">{item.desc}</span>
        </button>
      ))}
    </div>
  )
}
