import { Check, Copy, Eye, Image, Sparkles, UploadCloud } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { api } from '../api/auth'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useGameStore } from '../store/gameStore'

export default function VisionPage() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const onDrop = useCallback((accepted) => {
    const nextFile = accepted[0]
    if (!nextFile) return
    if (!nextFile.type.startsWith('image/')) {
      toast.error('Only image files are supported')
      return
    }
    setFile(nextFile)
    setPreview(URL.createObjectURL(nextFile))
    setResult(null)
  }, [])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

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
      useGameStore.getState().addXP(15)
      useGameStore.getState().unlockAchievement('vision_run')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Vision analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const copyAnalysis = async () => {
    await navigator.clipboard.writeText(result?.description || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Layout title="Vision AI">
      <div className="mb-6">
        <h2 className="font-display text-4xl font-bold text-white">Vision AI</h2>
        <p className="mt-2 text-slate-400">Analyze quantum circuits and diagrams</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-5">
          <div
            {...getRootProps()}
            className={`glass cursor-pointer rounded-2xl border border-dashed p-10 text-center transition ${isDragActive ? 'border-brand-blue bg-brand-blue/10 shadow-[var(--shadow-blue)]' : 'border-brand-blue/30 hover:border-brand-blue/60 hover:bg-white/[0.03]'}`}
          >
            <input {...getInputProps()} />
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-blue to-brand-violet">
              <UploadCloud className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-display text-2xl font-bold text-white">Drop an image here</h3>
            <p className="mt-1 text-slate-400">or click to browse PNG/JPG diagrams</p>
          </div>

          {preview && (
            <div className="glass overflow-hidden rounded-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm text-slate-300">
                <Image className="h-4 w-4 text-brand-blue" />
                <span className="truncate">{file?.name}</span>
              </div>
              <img src={preview} alt="Vision preview" className="max-h-80 w-full object-contain p-4" />
            </div>
          )}

          <Input placeholder="Ask a specific question (optional)" value={question} onChange={(event) => setQuestion(event.target.value)} />
          <Button onClick={analyze} disabled={!file || loading} loading={loading} className="w-full">
            <Sparkles className="h-4 w-4" />
            Analyze
          </Button>
        </section>

        <section className="min-h-[520px]">
          {!result ? (
            <div className="glass grid h-full place-items-center rounded-2xl border-dashed text-center text-slate-400">
              <div>
                <Eye className="mx-auto mb-4 h-12 w-12 text-brand-violet" />
                <h3 className="font-display text-2xl font-bold text-white">Analysis will appear here</h3>
                <p className="mt-2">Upload a circuit or diagram to begin.</p>
              </div>
            </div>
          ) : (
            <div className="glass-bright fade-up rounded-2xl p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h3 className="font-display text-2xl font-bold text-white">Analysis Complete</h3>
                <span className="badge badge-green"><Check className="h-3 w-3" /> Ready</span>
              </div>
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="badge badge-blue">{result.type === 'quantum_circuit' ? 'Quantum Circuit' : 'Diagram'}</span>
                {result.dimensions && <span className="badge badge-violet">{result.dimensions}</span>}
                {result.model_used && result.model_used !== 'none' && <span className="badge badge-amber">{result.model_used}</span>}
              </div>
              <div className="border-t border-white/10 pt-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{result.description}</p>
              </div>
              <Button variant="secondary" onClick={copyAnalysis} className="mt-6">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy Analysis'}
              </Button>
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}
