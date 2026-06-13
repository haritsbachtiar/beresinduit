import { useState, useCallback, useEffect } from 'react'
import { X, Delete } from 'lucide-react'
import { formatIDR } from '../utils/format'

type CategoryOption = {
  id: string
  name: string
  color: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  period: string
  editCategory: CategoryOption | null
  availableCategories: CategoryOption[]
  initialAmount?: number
  onSave: (categoryId: string, limitAmount: number) => void
}

const NUMPAD_KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '000', '0', 'backspace'] as const
type NumpadKey = (typeof NUMPAD_KEYS)[number]

function periodLabel(period: string): string {
  const [year, month] = period.split('-')
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(
    new Date(Number(year), Number(month) - 1, 1)
  )
}

export function BudgetModal({
  isOpen, onClose, period, editCategory,
  availableCategories, initialAmount, onSave,
}: Props) {
  const [amountRaw, setAmountRaw] = useState('')
  const [selectedCat, setSelectedCat] = useState<CategoryOption | null>(null)

  const isEditing = editCategory !== null

  useEffect(() => {
    if (isOpen) {
      setAmountRaw(initialAmount ? String(initialAmount) : '')
      setSelectedCat(editCategory)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      const t = setTimeout(() => {
        setAmountRaw('')
        setSelectedCat(null)
      }, 300)
      return () => clearTimeout(t)
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen, editCategory, initialAmount])

  const handleNumpad = useCallback((key: NumpadKey) => {
    setAmountRaw(prev => {
      if (key === 'backspace') return prev.slice(0, -1)
      if (prev.length >= 12) return prev
      if (key === '000') return prev ? prev + '000' : prev
      return prev + key
    })
  }, [])

  const amount = amountRaw ? parseInt(amountRaw, 10) : 0
  const activeCat = editCategory ?? selectedCat
  const canSave = amount > 0 && activeCat !== null

  function handleSave() {
    if (!canSave || !activeCat) return
    onSave(activeCat.id, amount)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? `Edit anggaran ${editCategory?.name ?? ''}` : 'Tambah anggaran'}
      className={`fixed inset-0 z-[70] flex flex-col justify-end transition-all duration-300 ${
        isOpen ? 'visible' : 'invisible pointer-events-none'
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-md mx-auto max-h-[88dvh] dark:bg-dark-surface bg-white rounded-t-3xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full dark:bg-dark-border bg-light-border" />
          </div>
          <div className="flex items-center justify-between px-4 pb-3">
            <div>
              <h2 className="text-base font-extrabold dark:text-dark-text text-light-text">
                {isEditing ? 'Edit Anggaran' : 'Tambah Anggaran'}
              </h2>
              <p className="text-xs dark:text-dark-muted text-light-muted font-semibold capitalize">
                {isEditing && editCategory ? `${editCategory.name} · ` : ''}
                {periodLabel(period)}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="p-2 rounded-xl dark:bg-dark-card bg-light-surface dark:text-dark-muted text-light-muted"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Category picker — only when adding */}
          {!isEditing && (
            <div className="px-4 pb-4">
              <p className="text-[11px] font-bold dark:text-dark-muted text-light-muted uppercase tracking-widest mb-3">
                Kategori
                {selectedCat && (
                  <span style={{ color: selectedCat.color }}> · {selectedCat.name}</span>
                )}
              </p>
              {availableCategories.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableCategories.map(cat => {
                    const isSelected = selectedCat?.id === cat.id
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCat(cat)}
                        className={[
                          'py-2.5 px-3 rounded-2xl border-2 text-sm font-bold transition-all duration-150 active:scale-95 text-center',
                          isSelected
                            ? ''
                            : 'border-transparent dark:bg-dark-card bg-light-surface dark:text-dark-text text-light-text',
                        ].join(' ')}
                        style={
                          isSelected
                            ? { borderColor: cat.color, backgroundColor: cat.color + '18', color: cat.color }
                            : undefined
                        }
                      >
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm font-semibold dark:text-dark-muted text-light-muted text-center py-4">
                  Semua kategori sudah memiliki anggaran
                </p>
              )}
            </div>
          )}

          {/* Amount display */}
          <div className="px-4 pt-2 pb-1 text-center">
            <p
              className={[
                'text-[2.5rem] font-extrabold tracking-tight leading-none',
                amount === 0 ? 'dark:text-dark-muted text-light-muted' : 'text-accent',
              ].join(' ')}
            >
              {amount === 0 ? 'Rp 0' : formatIDR(amount)}
            </p>
            <p className="text-xs dark:text-dark-muted text-light-muted font-semibold mt-1.5">
              Batas anggaran bulanan
            </p>
          </div>

          {/* Numpad */}
          <div className="px-4 py-4">
            <div className="grid grid-cols-3 gap-2">
              {NUMPAD_KEYS.map(key => (
                <button
                  key={key}
                  onClick={() => handleNumpad(key)}
                  className="h-[3.75rem] rounded-2xl dark:bg-dark-card bg-light-surface flex items-center justify-center transition-all duration-100 active:scale-95 active:dark:bg-dark-border active:bg-light-border"
                >
                  {key === 'backspace' ? (
                    <Delete size={22} className="dark:text-dark-text text-light-text" />
                  ) : (
                    <span className="text-xl font-bold dark:text-dark-text text-light-text select-none">
                      {key}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="px-4 pb-10 pt-2">
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="w-full py-4 rounded-2xl text-sm font-extrabold text-white bg-accent hover:bg-accent-dark disabled:opacity-35 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              Simpan Anggaran
            </button>
            {!canSave && (
              <p className="text-center text-xs dark:text-dark-muted text-light-muted font-semibold mt-2.5">
                {!activeCat
                  ? 'Pilih kategori terlebih dahulu'
                  : 'Masukkan nominal anggaran'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
