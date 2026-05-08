export default function Navbar({ title }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[rgba(5,10,20,.82)] px-6 backdrop-blur">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="font-mono text-xs text-cyan-200">Research intelligence online</div>
    </header>
  )
}
