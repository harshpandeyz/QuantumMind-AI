import { Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { streamMessageApi } from '../../api/chat'
import { useGameStore } from '../../store/gameStore'
import ChatInput from './ChatInput'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

const suggestions = [
  'Explain quantum entanglement',
  'Summarize my document',
  'What is superposition?',
  "Explain Shor's algorithm",
]

export default function ChatWindow({ messages, isTyping, onSend, documents, activeSessionId, onMessagesRefresh }) {
  const bottom = useRef(null)
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, streamingContent])

  const handleSend = async (payload) => {
    if (!activeSessionId) return onSend(payload)
    setIsStreaming(true)
    setStreamingContent('')
    let accumulated = ''
    try {
      for await (const event of streamMessageApi(activeSessionId, payload)) {
        if (event.token) {
          accumulated += event.token
          setStreamingContent(accumulated)
        }
        if (event.done) {
          setStreamingContent('')
          setIsStreaming(false)
          useGameStore.getState().addXP(10)
          useGameStore.getState().unlockAchievement('first_chat')
          if (onMessagesRefresh) onMessagesRefresh(activeSessionId)
          return
        }
        if (event.error) throw new Error(event.error)
      }
      setIsStreaming(false)
      if (onMessagesRefresh) onMessagesRefresh(activeSessionId)
    } catch {
      setStreamingContent('')
      setIsStreaming(false)
      return onSend(payload)
    }
  }

  const sendSuggestion = (text) => {
    setDraft(text)
    handleSend({ message: text, useRag: false, documentIds: [] })
  }

  return (
    <section className="glass flex h-[calc(100vh-132px)] flex-1 flex-col overflow-hidden rounded-2xl">
      <div className="scrollbar flex-1 overflow-y-auto p-6">
        {messages.length === 0 && !isStreaming && (
          <div className="grid h-full place-items-center text-center">
            <div className="max-w-xl">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-violet shadow-[var(--shadow-blue)]">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="font-display text-3xl font-bold text-white">Ask QuantumMind anything</h2>
              <p className="mt-2 text-slate-400">Explore papers, circuits, algorithms, and uploaded research context.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestions.map((item) => (
                  <button key={item} onClick={() => sendSuggestion(item)} className="badge badge-blue transition hover:bg-brand-blue/25">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
        {isStreaming && streamingContent && (
          <div className="mb-4 flex justify-start">
            <div className="mr-3 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold">AI</div>
            <div className="max-w-[78%] rounded-2xl rounded-bl-sm border border-white/10 border-l-[3px] border-l-blue-400 bg-[var(--bg-card)] px-4 py-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                THINKING
                <span className="dot-bounce h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span className="dot-bounce h-1.5 w-1.5 rounded-full bg-violet-400" />
                <span className="dot-bounce h-1.5 w-1.5 rounded-full bg-pink-400" />
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{streamingContent}<span className="animate-pulse">|</span></p>
            </div>
          </div>
        )}
        {isTyping && !isStreaming && <TypingIndicator />}
        <div ref={bottom} />
      </div>
      <ChatInput onSend={handleSend} documents={documents} disabled={isTyping || isStreaming} draft={draft} onDraftSent={() => setDraft('')} />
    </section>
  )
}
