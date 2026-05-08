import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { Image, Upload, Zap } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import { api } from '../api/auth'

export default function VisionPage() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback((accepted) => {
    const f = accepted[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      toast.error('Only image files are supported')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  const analyze = async () => {
    if (!file) {
      toast.error('Please upload an image first')
      return
    }
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      if (question.trim()) form.append('question', question.trim())
      const aiBase = import.meta.env.VITE_AI_URL || '/ai'
      const { data } = await api.post(`${aiBase}/vision/analyze`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Vision analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Vision AI">
      <div className="mx-auto max-w-3xl space-y-6">
        <div
          {...getRootProps()}
          className={`grid cursor-pointer place-items-center rounded-xl border-2 border-dashed p-10 text-center transition ${
            isDragActive
              ? 'border-cyan-300 bg-cyan-300/10'
              : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-cyan-300'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-3 h-10 w-10 text-cyan-300" />
          <p className="font-semibold text-slate-200">
            {isDragActive ? 'Drop the image here' : 'Drag & drop a quantum circuit image'}
          </p>
          <p className="mt-1 text-sm text-slate-400">PNG, JPG, GIF - any image format</p>
        </div>

        {preview && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <p className="mb-3 flex items-center gap-2 text-sm text-slate-400">
              <Image className="h-4 w-4" /> Preview
            </p>
            <img
              src={preview}
              alt="Circuit preview"
              className="mx-auto max-h-64 rounded-lg object-contain"
            />
          </div>
        )}

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Optional: ask a specific question about this circuit..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[#071225] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-[var(--accent-primary)]"
          />
          <Button
            onClick={analyze}
            disabled={!file || loading}
            loading={loading}
            className="w-full justify-center"
          >
            <Zap className="h-4 w-4" />
            {loading ? 'Analyzing...' : 'Analyze Image'}
          </Button>
        </div>

        {result && !loading && (
          <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <h3 className="font-semibold text-cyan-200">Analysis Result</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
                {result.type === 'quantum_circuit' ? 'Quantum Circuit' : 'Diagram'}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                {result.dimensions}
              </span>
              {result.model_used && result.model_used !== 'none' && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                  {result.model_used}
                </span>
              )}
            </div>
            <div className="rounded-lg bg-black/20 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                {result.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
