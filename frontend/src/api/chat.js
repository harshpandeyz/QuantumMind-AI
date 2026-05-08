import { api } from './auth'

export const createSessionApi = (title = 'New Quantum Thread') =>
  api.post('/api/chat/sessions', { title }).then((r) => r.data)
export const listSessionsApi = () => api.get('/api/chat/sessions').then((r) => r.data)
export const listMessagesApi = (sessionId) => api.get(`/api/chat/sessions/${sessionId}/messages`).then((r) => r.data)
export const sendMessageApi = (sessionId, payload) =>
  api.post(`/api/chat/sessions/${sessionId}/messages`, payload).then((r) => r.data)

export async function* streamMessageApi(sessionId, payload) {
  const token = localStorage.getItem('qm_token')
  const baseUrl = import.meta.env.VITE_API_URL || ''
  const params = new URLSearchParams({
    message: payload.message,
    useRag: payload.useRag ? 'true' : 'false',
  })
  if (payload.documentIds?.length) {
    payload.documentIds.forEach((id) => params.append('documentIds', id))
  }

  const res = await fetch(
    `${baseUrl}/api/chat/sessions/${sessionId}/stream?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error(`Stream failed: ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value, { stream: true })
    for (const line of text.split('\n')) {
      if (line.startsWith('data: ')) {
        try {
          yield JSON.parse(line.slice(6))
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}
