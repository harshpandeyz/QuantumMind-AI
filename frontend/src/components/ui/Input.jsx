export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input className={`input-field ${className}`} {...props} />
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
