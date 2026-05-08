import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout({ title, children }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <Navbar title={title} />
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
