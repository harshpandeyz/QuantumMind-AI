import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { FileText, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '../ui/Button'

export default function ChatInput({ onSend, documents = [], disabled, draft = '', onDraftSent }) {
  const [message, setMessage] = useState(draft)
  const [useRag, setUseRag] = useState(false)
  const [documentIds, setDocumentIds] = useState([])

  useEffect(() => {
    if (draft) setMessage(draft)
  }, [draft])

  const submit = (event) => {
    event.preventDefault()
    if (!message.trim()) return
    onSend({ message: message.trim(), useRag, documentIds })
    setMessage('')
    onDraftSent?.()
  }

  const toggleDoc = (id) => {
    setDocumentIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id])
  }

  return (
    <form onSubmit={submit} className="border-t border-white/10 bg-[rgba(8,13,31,0.72)] p-4 backdrop-blur-xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setUseRag((value) => !value)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${useRag ? 'border-brand-blue/50 bg-brand-blue/15 text-blue-200 shadow-[var(--shadow-blue)]' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'}`}
          >
            <span className={`h-4 w-8 rounded-full p-0.5 transition ${useRag ? 'bg-brand-blue/40' : 'bg-white/10'}`}>
              <span className={`block h-3 w-3 rounded-full bg-white transition ${useRag ? 'translate-x-4' : ''}`} />
            </span>
            RAG
          </button>
          {useRag && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button type="button" className="btn-secondary py-1.5 text-xs">
                  <FileText className="h-4 w-4" />
                  {documentIds.length ? `${documentIds.length} docs selected` : 'Choose docs'}
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="start" sideOffset={8} className="z-50 max-h-72 w-80 overflow-auto rounded-xl border border-white/10 bg-[#0d1530] p-2 shadow-[var(--shadow-card)]">
                  {documents.length === 0 && <p className="px-3 py-2 text-sm text-slate-400">No completed documents available</p>}
                  {documents.map((doc) => {
                    const id = String(doc.id)
                    const checked = documentIds.includes(id)
                    return (
                      <DropdownMenu.CheckboxItem
                        key={id}
                        checked={checked}
                        onCheckedChange={() => toggleDoc(id)}
                        onSelect={(event) => event.preventDefault()}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none hover:bg-white/5"
                      >
                        <span className={`h-3 w-3 rounded border ${checked ? 'border-brand-blue bg-brand-blue' : 'border-white/30'}`} />
                        <span className="truncate">{doc.originalFilename}</span>
                      </DropdownMenu.CheckboxItem>
                    )
                  })}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
          {useRag && documentIds.map((id) => {
            const doc = documents.find((item) => String(item.id) === id)
            return <span key={id} className="badge badge-blue max-w-[180px] truncate">{doc?.originalFilename || id}</span>
          })}
        </div>
        <span className="badge badge-violet">Ctrl+Enter</span>
      </div>
      <div className="flex gap-3">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') submit(event)
          }}
          rows={2}
          placeholder="Ask anything about quantum computing..."
          className="input-field max-h-40 min-h-[52px] flex-1 resize-y"
        />
        <Button disabled={disabled || !message.trim()} loading={disabled} className="self-end px-4" type="submit">
          <Send className="h-4 w-4" />
          {message.trim() ? 'Send' : ''}
        </Button>
      </div>
    </form>
  )
}
