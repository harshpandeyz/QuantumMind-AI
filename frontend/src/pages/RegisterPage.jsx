import { Eye, EyeOff, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    try {
      await register({ username: form.username, email: form.email, password: form.password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <main className="aurora-bg grid min-h-screen place-items-center p-6">
      <form onSubmit={submit} className="glass-bright fade-up w-full max-w-md rounded-2xl p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-violet shadow-[var(--shadow-blue)]">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-sm text-[var(--text-2)]">Start building your quantum knowledge base</p>
        </div>

        <div className="space-y-4">
          <Input label="Username" placeholder="Researcher name" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required />
          <Input label="Email" type="email" placeholder="you@quantummind.ai" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          <div className="relative">
            <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute bottom-3 right-3 text-slate-400 hover:text-white">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Input label="Confirm Password" type={showPassword ? 'text' : 'password'} placeholder="Confirm your password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} required />
          {error && <div className="badge badge-pink fade-up w-full justify-center">{error}</div>}
          <Button loading={isLoading} className="w-full" type="submit">Get Started</Button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link className="font-semibold text-brand-blue hover:text-brand-violet" to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  )
}
