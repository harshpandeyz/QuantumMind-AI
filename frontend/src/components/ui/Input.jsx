import { cx } from '../../utils/helpers'

export default function Input({ className, ...props }) {
  return (
    <input
      className={cx('w-full rounded-md border border-[var(--border)] bg-[#071225] px-3 py-2 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-[var(--accent-primary)]', className)}
      {...props}
    />
  )
}
