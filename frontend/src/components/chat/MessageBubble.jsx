import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { timeAgo } from '../../utils/helpers'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] rounded-lg px-4 py-3 ${isUser ? 'bg-[var(--accent-secondary)] text-white' : 'border-l-2 border-[var(--accent-primary)] bg-[var(--bg-card)] text-slate-100'}`}>
        {!isUser && <div className="mb-1 font-mono text-xs text-cyan-200">QuantumMind AI</div>}
        <div className="prose prose-invert max-w-none prose-p:my-2 prose-pre:bg-black/30">
          {isUser ? <p className="m-0 whitespace-pre-wrap">{message.content}</p> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>}
        </div>
        <div className="mt-2 text-right text-[11px] text-slate-300/80">{timeAgo(message.createdAt)}</div>
      </div>
    </div>
  )
}
