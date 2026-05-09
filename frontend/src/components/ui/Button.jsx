export default function Button({
  children,
  onClick,
  disabled,
  variant = 'primary',
  className = '',
  type = 'button',
  loading,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variant === 'primary' ? 'btn-primary' : 'btn-secondary'} ${className}`}
    >
      {loading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Loading...
        </>
      ) : children}
    </button>
  )
}
