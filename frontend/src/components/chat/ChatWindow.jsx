import { useEffect, useRef, useState } from 'react'
import { streamMessageApi } from '../../api/chat'
import ChatInput from './ChatInput'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

export default function ChatWindow({ messages, isTyping, onSend, documents, activeSessionId, onMessagesRefresh }) {
  const bottom = useRef(null)
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, streamingContent])

  const handleSend = async (payload) => {
    if (!activeSessionId) {
      // No session yet - fall back to standard (creates session internally)
      return onSend(payload)
    }
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
          // Reload messages from backend to get the persisted version
          if (onMessagesRefresh) onMessagesRefresh(activeSessionId)
          return
        }
        if (event.error) throw new Error(event.error)
      }
      setStreamingContent('')
      setIsStreaming(false)
      if (onMessagesRefresh) onMessagesRefresh(activeSessionId)
    } catch {
      // Streaming failed - fall back to non-streaming
      setStreamingContent('')
      setIsStreaming(false)
      return onSend(payload)
    }
  }

  return (
    <section className="flex h-[calc(100vh-7rem)] flex-1 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="scrollbar flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && !isStreaming && (
          <div className="grid h-full place-items-center text-center text-slate-400">
            <div>
              <p className="text-lg font-semibold text-slate-200">Open a quantum research thread</p>
              <p className="mt-2 max-w-md">Ask for derivations, paper summaries, experiment critique, or RAG-grounded answers from uploaded PDFs.</p>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isStreaming && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[78%] rounded-lg border-l-2 border-[var(--accent-primary)] bg-[var(--bg-card)] px-4 py-3 text-slate-100">
              <div className="mb-1 font-mono text-xs text-cyan-200">QuantumMind AI</div>
              <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed">
                {streamingContent}
                <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-cyan-400 align-middle" />
              </p>
            </div>
          </div>
        )}
        {isTyping && !isStreaming && <TypingIndicator />}
        <div ref={bottom} />
      </div>
      <ChatInput onSend={handleSend} documents={documents} disabled={isTyping || isStreaming} />
    </section>
  )
}
