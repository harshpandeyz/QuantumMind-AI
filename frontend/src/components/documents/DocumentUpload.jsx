import { UploadCloud } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { uploadDocumentApi } from '../../api/documents'
import { useGameStore } from '../../store/gameStore'
import { prettyBytes } from '../../utils/helpers'

export default function DocumentUpload({ onUploaded }) {
  const [uploads, setUploads] = useState([])
  const onDrop = useCallback(async (files) => {
    for (const file of files) {
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF`)
        continue
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 50MB`)
        continue
      }
      setUploads((items) => [...items, { name: file.name, progress: 0, size: file.size }])
      try {
        await uploadDocumentApi(file, (event) => {
          const progress = Math.round((event.loaded * 100) / (event.total || file.size))
          setUploads((items) => items.map((item) => item.name === file.name ? { ...item, progress } : item))
        })
        toast.success(`${file.name} uploaded`)
        const game = useGameStore.getState()
        game.addXP(20)
        game.unlockAchievement('first_doc')
        const uploadCount = Number(localStorage.getItem('qm_doc_upload_count') || '0') + 1
        localStorage.setItem('qm_doc_upload_count', String(uploadCount))
        if (uploadCount >= 5) game.unlockAchievement('docs_5')
        onUploaded()
      } catch (error) {
        toast.error(error.response?.data?.message || `Upload failed for ${file.name}`)
      }
    }
  }, [onUploaded])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] } })

  return (
    <div>
      <div {...getRootProps()} className={`grid cursor-pointer place-items-center rounded-lg border border-dashed p-8 text-center transition ${isDragActive ? 'border-cyan-300 bg-cyan-300/10' : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-cyan-300'}`}>
        <input {...getInputProps()} />
        <UploadCloud className="mb-3 h-9 w-9 text-cyan-300" />
        <p className="font-semibold">Drop PDF files here or click to browse</p>
        <p className="mt-1 text-sm text-slate-400">Maximum file size: 50MB</p>
      </div>
      {uploads.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploads.map((upload) => (
            <div key={upload.name} className="rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <div className="mb-2 flex justify-between text-sm"><span>{upload.name}</span><span>{prettyBytes(upload.size)}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-black/30"><div className="h-full bg-cyan-300" style={{ width: `${upload.progress}%` }} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
