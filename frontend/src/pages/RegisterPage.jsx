import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Atom } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const submit = async (event) => {
    event.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    try {
      await register({ username: form.username, email: form.email, password: form.password })
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
            <h1 className="text-2xl font-bold">Join QuantumMind</h1>
            <p className="text-sm text-slate-400">Create a secure research workspace</p>
          </div>
        </div>
        <div className="space-y-4">
          <Input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Input type="password" placeholder="Confirm password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          <Button loading={isLoading} className="w-full" type="submit">Create Account</Button>
        </div>
        <p className="mt-5 text-center text-sm text-slate-400">Already registered? <Link className="text-cyan-300" to="/login">Sign in</Link></p>
      </form>
    </main>
  )
}
