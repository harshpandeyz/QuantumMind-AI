import { api } from './auth'

export const listDocumentsApi = () => api.get('/api/documents').then((r) => r.data)
export const uploadDocumentApi = (file, onProgress) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/api/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
  }).then((r) => r.data)
}
export const deleteDocumentApi = (id) => api.delete(`/api/documents/${id}`).then((r) => r.data)
export const getSummaryApi = (id) => api.get(`/api/documents/${id}/summary`).then((r) => r.data)
export const getAnalyticsApi = () => api.get('/api/analytics/summary').then((r) => r.data)
