import { Send, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import Button from '../ui/Button'

export default function ChatInput({ onSend, documents = [], disabled }) {
  const [message, setMessage] = useState('')
  const [useRag, setUseRag] = useState(false)
  const [documentIds, setDocumentIds] = useState([])

  const submit = (event) => {
    event.preventDefault()
    if (!message.trim()) return
    onSend({ message: message.trim(), useRag, documentIds })
    setMessage('')
  }

  return (
    <form onSubmit={submit} className="border-t border-[var(--border)] bg-[var(--bg-secondary)] p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2 text-slate-300">
          <input type="checkbox" checked={useRag} onChange={(e) => setUseRag(e.target.checked)} className="accent-cyan-300" />
          RAG context
        </label>
        <SlidersHorizontal className="h-4 w-4 text-slate-500" />
        <select
          multiple
          value={documentIds}
          onChange={(e) => setDocumentIds(Array.from(e.target.selectedOptions).map((option) => option.value))}
          className="min-h-9 rounded-md border border-[var(--border)] bg-[#071225] px-2 text-slate-200 outline-none"
        >
          {documents.map((doc) => <option key={doc.id} value={doc.id}>{doc.originalFilename}</option>)}
        </select>
      </div>
      <div className="flex gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="Ask about a quantum paper, circuit, algorithm, or result..."
          className="max-h-40 min-h-12 flex-1 resize-y rounded-md border border-[var(--border)] bg-[#071225] px-3 py-2 text-slate-100 outline-none placeholder:text-slate-500 focus:border-[var(--accent-primary)]"
        />
        <Button disabled={disabled || !message.trim()} className="self-end" type="submit"><Send className="h-4 w-4" /> Send</Button>
      </div>
    </form>
  )
}
