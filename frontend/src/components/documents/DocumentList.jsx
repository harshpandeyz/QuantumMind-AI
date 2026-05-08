import { Eye, Trash2 } from 'lucide-react'
import { prettyBytes, timeAgo } from '../../utils/helpers'
import Button from '../ui/Button'

export default function DocumentList({ documents, onSummary, onDelete }) {
  const badge = (status) => ({
    COMPLETED: 'text-emerald-300 bg-emerald-400/10',
    PROCESSING: 'text-amber-300 bg-amber-400/10',
    PENDING: 'text-cyan-300 bg-cyan-400/10',
    FAILED: 'text-red-300 bg-red-400/10'
  }[status] || 'text-slate-300 bg-white/5')
  return (
    <div className="grid gap-3">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{doc.originalFilename}</h3>
            <p className="mt-1 text-sm text-slate-400">{prettyBytes(doc.fileSize)} · uploaded {timeAgo(doc.uploadedAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(doc.processingStatus)}`}>{doc.processingStatus}</span>
            <Button variant="secondary" onClick={() => onSummary(doc)}><Eye className="h-4 w-4" /> Summary</Button>
            <Button variant="ghost" onClick={() => onDelete(doc.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      ))}
      {documents.length === 0 && <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-center text-slate-400">No research documents uploaded yet.</div>}
    </div>
  )
}
