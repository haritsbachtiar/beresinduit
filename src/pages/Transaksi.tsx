import { Plus, ArrowLeftRight } from 'lucide-react'
import { useForm } from '../contexts/FormContext'

export function Transaksi() {
  const { openForm } = useForm()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold">Transaksi</h1>
        <button
          onClick={openForm}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-accent hover:bg-accent-dark transition-colors active:scale-95"
        >
          <Plus size={16} />
          Tambah
        </button>
      </div>

      <div className="rounded-xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="p-4 rounded-full dark:bg-dark-surface bg-light-surface">
            <ArrowLeftRight size={28} className="dark:text-dark-muted text-light-muted" />
          </div>
          <p className="text-sm font-semibold dark:text-dark-muted text-light-muted">
            Belum ada transaksi
          </p>
          <p className="text-xs dark:text-dark-muted text-light-muted text-center px-8">
            Tap tombol Tambah untuk mencatat transaksi pertama kamu
          </p>
        </div>
      </div>
    </div>
  )
}
