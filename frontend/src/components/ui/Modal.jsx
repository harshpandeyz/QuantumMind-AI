import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

export default function Modal({ open, onOpenChange, title, children }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[82vh] w-[min(720px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
            <Dialog.Close className="rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-white">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
