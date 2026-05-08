import { Loader2 } from 'lucide-react'
import { cx } from '../../utils/helpers'

export default function Button({ children, className, variant = 'primary', loading = false, ...props }) {
  const variants = {
    primary: 'bg-[var(--accent-primary)] text-slate-950 hover:brightness-110',
    secondary: 'bg-[var(--bg-card)] text-slate-100 border border-[var(--border)] hover:border-[var(--accent-primary)]',
    ghost: 'text-slate-300 hover:bg-white/5'
  }
  return (
    <button
      className={cx('inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 font-semibold transition disabled:opacity-60', variants[variant], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
