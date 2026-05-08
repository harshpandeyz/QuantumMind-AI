import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Atom } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const submit = async (event) => {
    event.preventDefault()
    try {
      await login(form)
      navigate('/dashboard')
    } catch {
      // toast is already shown by the store
    }
  }
  return (
    <main className="quantum-grid grid min-h-screen place-items-center p-6">
      <form onSubmit={submit} className="glass w-full max-w-md rounded-lg p-7">
        <div className="mb-6 flex items-center gap-3">
          <Atom className="h-8 w-8 text-cyan-300" />
          <div>
            <h1 className="text-2xl font-bold">QuantumMind AI</h1>
            <p className="text-sm text-slate-400">Sign in to your research intelligence workspace</p>
          </div>
        </div>
        <div className="space-y-4">
          <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Button loading={isLoading} className="w-full" type="submit">Sign In</Button>
        </div>
        <p className="mt-5 text-center text-sm text-slate-400">New here? <Link className="text-cyan-300" to="/register">Create an account</Link></p>
      </form>
    </main>
  )
}
