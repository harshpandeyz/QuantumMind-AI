import { Eye, FileText, Loader2, Trash2, UploadCloud } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { deleteDocumentApi, listDocumentsApi, uploadDocumentApi } from '../api/documents'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { useGameStore } from '../store/gameStore'
import { prettyBytes, timeAgo } from '../utils/helpers'

const statusStyle = {
  PENDING: { badge: 'badge-amber', icon: 'text-brand-amber', spin: false },
  PROCESSING: { badge: 'badge-blue', icon: 'text-brand-blue', spin: true },
  COMPLETED: { badge: 'badge-green', icon: 'text-brand-emerald', spin: false },
  FAILED: { badge: 'badge-pink', icon: 'text-red-400', spin: false },
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [uploading, setUploading] = useState(null)

  const load = useCallback(() => {
    listDocumentsApi()
      .then(setDocuments)
      .catch(() => setDocuments([]))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onDrop = useCallback(async (files) => {
    const file = files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('PDF files only')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File exceeds 50MB')
      return
    }
    setUploading(file)
    try {
      const form = new FormData()
      form.append('file', file)
      await uploadDocumentApi(form)
      const game = useGameStore.getState()
      game.addXP(20)
      game.unlockAchievement('first_doc')
      toast.success('Upload accepted')
      load()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(null)
    }
  }, [load])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 })

  const filtered = useMemo(() => (
    documents.filter((doc) => doc.originalFilename?.toLowerCase().includes(query.toLowerCase()))
  ), [documents, query])

  const remove = async (id) => {
    try {
      await deleteDocumentApi(id)
      toast.success('Document deleted')
      load()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <Layout title="Documents">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-4xl font-bold text-white">Knowledge Base</h2>
          <p className="mt-2 text-slate-400">Upload, index, and query your research PDFs.</p>
        </div>
        <Button onClick={() => document.querySelector('[data-doc-upload]')?.click()}>
          <UploadCloud className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div
        {...getRootProps()}
        className={`glass mb-6 cursor-pointer rounded-2xl border border-dashed p-10 text-center transition ${isDragActive ? 'border-brand-blue bg-brand-blue/10 shadow-[var(--shadow-blue)]' : 'border-brand-blue/30 hover:border-brand-blue/60 hover:bg-white/[0.03]'}`}
      >
        <input {...getInputProps()} data-doc-upload />
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-blue to-brand-violet">
          {uploading ? <Loader2 className="h-8 w-8 animate-spin text-white" /> : <UploadCloud className="h-8 w-8 text-white" />}
        </div>
        <h3 className="font-display text-2xl font-bold text-white">{uploading ? uploading.name : 'Drop your PDF here'}</h3>
        <p className="mt-1 text-slate-400">{uploading ? `${prettyBytes(uploading.size)} - processing upload` : 'or click to browse'}</p>
        <p className="mt-3 text-xs text-slate-500">PDF files only, max 50MB</p>
      </div>

      <div className="mb-5 max-w-md">
        <Input placeholder="Search documents" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>

      {filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((doc) => {
            const style = statusStyle[doc.processingStatus] || statusStyle.PENDING
            const Icon = style.spin ? Loader2 : FileText
            return (
              <div key={doc.id} className="glass fade-up rounded-2xl p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className={`grid h-11 w-11 place-items-center rounded-xl bg-white/5 ${style.icon}`}>
                    <Icon className={`h-5 w-5 ${style.spin ? 'animate-spin' : ''}`} />
                  </div>
                  <span className={`badge ${style.badge}`}>{doc.processingStatus}</span>
                </div>
                <h3 className="truncate font-semibold text-white">{doc.originalFilename}</h3>
                <p className="mt-2 text-sm text-slate-400">{prettyBytes(doc.fileSize)} - uploaded {timeAgo(doc.uploadedAt)}</p>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <button onClick={() => setSelected(doc)} className="text-sm font-semibold text-brand-blue hover:text-brand-violet">
                    View Summary
                  </button>
                  <button onClick={() => remove(doc.id)} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass grid place-items-center rounded-2xl py-20 text-center text-slate-400">
          <FileText className="mb-4 h-12 w-12 text-brand-blue" />
          <h3 className="font-display text-2xl font-bold text-white">Upload your first document</h3>
          <p className="mt-2">Your indexed research files will appear here.</p>
        </div>
      )}

      <Modal open={Boolean(selected)} onOpenChange={() => setSelected(null)} title={selected?.originalFilename || 'Document summary'}>
        <div className="space-y-3 text-slate-300">
          <p><span className="font-semibold text-slate-100">Status:</span> {selected?.processingStatus}</p>
          <div className="whitespace-pre-wrap rounded-xl bg-white/5 p-4">{selected?.summary || 'Summary is not ready yet.'}</div>
        </div>
      </Modal>
    </Layout>
  )
}
