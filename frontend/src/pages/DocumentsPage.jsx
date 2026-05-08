import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { deleteDocumentApi, listDocumentsApi } from '../api/documents'
import DocumentList from '../components/documents/DocumentList'
import DocumentUpload from '../components/documents/DocumentUpload'
import Layout from '../components/layout/Layout'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const load = () => listDocumentsApi().then(setDocuments).catch(() => setDocuments([]))
  useEffect(load, [])
  const filtered = useMemo(() => documents.filter((doc) => doc.originalFilename.toLowerCase().includes(query.toLowerCase())), [documents, query])
  const remove = async (id) => {
    await deleteDocumentApi(id)
    toast.success('Document deleted')
    load()
  }
  return (
    <Layout title="Documents">
      <DocumentUpload onUploaded={load} />
      <div className="my-5 max-w-md"><Input placeholder="Search documents" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      <DocumentList documents={filtered} onSummary={setSelected} onDelete={remove} />
      <Modal open={Boolean(selected)} onOpenChange={() => setSelected(null)} title={selected?.originalFilename || 'Document summary'}>
        <div className="space-y-3 text-slate-300">
          <p><span className="font-semibold text-slate-100">Status:</span> {selected?.processingStatus}</p>
          <div className="whitespace-pre-wrap rounded-md bg-black/20 p-4">{selected?.summary || 'Summary is not ready yet.'}</div>
        </div>
      </Modal>
    </Layout>
  )
}
