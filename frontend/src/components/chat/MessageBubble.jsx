import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react'
import { useState } from 'react'
import { timeAgo } from '../../utils/helpers'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const copy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`mb-4 flex fade-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mr-3 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold">
          AI
        </div>
      )}

      <div className={`group relative max-w-[78%] ${
        isUser
          ? 'rounded-2xl rounded-br-sm border border-blue-400/25 bg-gradient-to-br from-blue-500/20 to-violet-500/20 px-4 py-3'
          : 'rounded-2xl rounded-bl-sm border border-white/10 border-l-[3px] border-l-blue-400 bg-[var(--bg-card)] px-4 py-3'
      }`}>
        <div className={`mb-1 flex items-center gap-2 text-xs font-medium ${isUser ? 'justify-end text-blue-300' : 'text-slate-400'}`}>
          {!isUser && (
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              QuantumMind
            </span>
          )}
          <span>{timeAgo(message.createdAt)}</span>
          {isUser && <span className="text-slate-400">You</span>}
        </div>

        <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-pre:border prose-pre:border-white/10 prose-pre:bg-black/40 prose-code:rounded prose-code:bg-blue-500/10 prose-code:px-1 prose-code:text-blue-300 prose-headings:text-white prose-a:text-blue-400">
          {isUser
            ? <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
            : <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          }
        </div>

        {!isUser && (
          <div className="mt-3 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button onClick={copy} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 transition-all hover:bg-white/10 hover:text-white">
              {copied
                ? <><Check className="h-3 w-3 text-emerald-400" /> Copied</>
                : <><Copy className="h-3 w-3" /> Copy</>
              }
            </button>
            <button onClick={() => setFeedback('up')} className={`rounded-lg p-1 transition-all ${feedback === 'up' ? 'bg-emerald-400/15 text-emerald-400' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button onClick={() => setFeedback('down')} className={`rounded-lg p-1 transition-all ${feedback === 'down' ? 'bg-red-400/15 text-red-400' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
              <ThumbsDown className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="ml-3 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-xs font-bold">
          U
        </div>
      )}
    </div>
  )
}
