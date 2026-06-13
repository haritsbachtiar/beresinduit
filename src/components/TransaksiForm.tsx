import { useState, useCallback, useEffect, useRef } from 'react'
import type { ElementType } from 'react'
import {
  X, Delete, RefreshCw, Calendar, Camera, Loader2,
  Briefcase, Laptop, TrendingUp, Gift, PlusCircle,
  Utensils, Car, ShoppingBag, Heart, Tv, BookOpen, FileText, MoreHorizontal,
} from 'lucide-react'
import type { TransactionType } from '../types'
import { formatIDR } from '../utils/format'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useCategories } from '../hooks/useCategories'

// ── Category data (matches DB defaults) ──────────────────────────────────────

type Category = {
  id: string
  name: string
  icon: ElementType
  color: string
  type: TransactionType
}

const CATEGORIES: Category[] = [
  { id: 'gaji',       name: 'Gaji',       icon: Briefcase,     color: '#22c55e', type: 'pemasukan' },
  { id: 'freelance',  name: 'Freelance',  icon: Laptop,        color: '#10b981', type: 'pemasukan' },
  { id: 'investasi',  name: 'Investasi',  icon: TrendingUp,    color: '#06b6d4', type: 'pemasukan' },
  { id: 'hadiah',     name: 'Hadiah',     icon: Gift,          color: '#f59e0b', type: 'pemasukan' },
  { id: 'lain-in',   name: 'Lainnya',    icon: PlusCircle,    color: '#6b7280', type: 'pemasukan' },
  { id: 'makanan',    name: 'Makanan',    icon: Utensils,      color: '#ef4444', type: 'pengeluaran' },
  { id: 'transport',  name: 'Transport',  icon: Car,           color: '#f97316', type: 'pengeluaran' },
  { id: 'belanja',    name: 'Belanja',    icon: ShoppingBag,   color: '#ec4899', type: 'pengeluaran' },
  { id: 'kesehatan',  name: 'Kesehatan',  icon: Heart,         color: '#14b8a6', type: 'pengeluaran' },
  { id: 'hiburan',    name: 'Hiburan',    icon: Tv,            color: '#8b5cf6', type: 'pengeluaran' },
  { id: 'pendidikan', name: 'Pendidikan', icon: BookOpen,      color: '#3b82f6', type: 'pengeluaran' },
  { id: 'tagihan',    name: 'Tagihan',    icon: FileText,      color: '#64748b', type: 'pengeluaran' },
  { id: 'lain-out',  name: 'Lainnya',    icon: MoreHorizontal,color: '#6b7280', type: 'pengeluaran' },
]

// Maps local form category ID → category name in the database
const LOCAL_ID_TO_DB_NAME: Record<string, string> = {
  'gaji': 'Gaji', 'freelance': 'Freelance', 'investasi': 'Investasi',
  'hadiah': 'Hadiah', 'lain-in': 'Lainnya', 'lain-out': 'Lainnya',
  'makanan': 'Makanan', 'transport': 'Transport', 'belanja': 'Belanja',
  'kesehatan': 'Kesehatan', 'hiburan': 'Hiburan', 'pendidikan': 'Pendidikan',
  'tagihan': 'Tagihan',
}

const NUMPAD_KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '000', '0', 'backspace'] as const
type NumpadKey = typeof NUMPAD_KEYS[number]

// ── Form state ────────────────────────────────────────────────────────────────

type FormState = {
  type: TransactionType
  amountRaw: string
  categoryId: string | null
  date: string
  description: string
  isRecurring: boolean
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function formatDisplayDate(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso + 'T00:00:00'))
}

function makeInitial(): FormState {
  return {
    type: 'pengeluaran',
    amountRaw: '',
    categoryId: null,
    date: todayISO(),
    description: '',
    isRecurring: false,
  }
}

// ── Image resize helper ───────────────────────────────────────────────────────

function resizeAndEncode(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = e => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const MAX = 1024
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round(height * MAX / width)
            width = MAX
          } else {
            width = Math.round(width * MAX / height)
            height = MAX
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function TransaksiForm({ isOpen, onClose }: Props) {
  const { user } = useAuth()
  const { categories: dbCategories } = useCategories()

  const [form, setForm] = useState<FormState>(makeInitial)
  const [isScanLoading, setIsScanLoading] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleScanFile = useCallback(async (file: File) => {
    setScanError(null)
    setIsScanLoading(true)
    try {
      const dataUrl = await resizeAndEncode(file)
      const base64 = dataUrl.split(',')[1]
      const mimeType = file.type || 'image/jpeg'

      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      })

      const data = await res.json() as Record<string, unknown>

      if (!res.ok) {
        setScanError(typeof data.error === 'string' ? data.error : 'Tidak dapat memproses struk')
        return
      }

      setForm(prev => ({
        ...prev,
        type: (data.type as FormState['type']) ?? prev.type,
        amountRaw: typeof data.amount === 'number' ? String(data.amount) : prev.amountRaw,
        categoryId: typeof data.categoryId === 'string' ? data.categoryId : prev.categoryId,
        date: typeof data.date === 'string' ? data.date : prev.date,
        description: typeof data.description === 'string' ? data.description : prev.description,
      }))
    } catch {
      setScanError('Terjadi kesalahan. Pastikan koneksi internet aktif.')
    } finally {
      setIsScanLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [])

  // Lock body scroll when open; reset form after close animation
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      const t = setTimeout(() => setForm(makeInitial()), 300)
      return () => clearTimeout(t)
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleNumpad = useCallback((key: NumpadKey) => {
    setForm(prev => {
      const raw = prev.amountRaw
      if (key === 'backspace') return { ...prev, amountRaw: raw.slice(0, -1) }
      if (raw.length >= 12) return prev
      if (key === '000') return { ...prev, amountRaw: raw ? raw + '000' : raw }
      return { ...prev, amountRaw: raw + key }
    })
  }, [])

  const setType = (type: TransactionType) =>
    setForm(prev => ({ ...prev, type, categoryId: null }))

  const toggleCategory = (id: string) =>
    setForm(prev => ({ ...prev, categoryId: prev.categoryId === id ? null : id }))

  const handleSave = async () => {
    if (!isValid || !user || !form.categoryId) return
    setSaveError(null)
    setIsSaving(true)
    try {
      const targetName = LOCAL_ID_TO_DB_NAME[form.categoryId]
      const category = dbCategories.find(
        c => c.name === targetName && c.type === form.type
      )
      if (!category) {
        setSaveError('Kategori tidak ditemukan. Coba lagi.')
        return
      }
      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        category_id: category.id,
        type: form.type,
        amount: parseInt(form.amountRaw, 10),
        description: form.description || targetName,
        date: form.date,
      })
      if (error) {
        setSaveError('Gagal menyimpan. Coba lagi.')
        return
      }
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const amount = form.amountRaw ? parseInt(form.amountRaw, 10) : 0
  const isValid = amount > 0 && form.categoryId !== null
  const visibleCategories = CATEGORIES.filter(c => c.type === form.type)
  const selectedCategory = CATEGORIES.find(c => c.id === form.categoryId)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tambah Transaksi"
      className={`fixed inset-0 z-[60] flex flex-col justify-end transition-all duration-300 ${
        isOpen ? 'visible' : 'invisible pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`relative w-full max-w-md mx-auto max-h-[92dvh] dark:bg-dark-surface bg-white rounded-t-3xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* ── Sticky header ── */}
        <div className="flex-shrink-0">
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full dark:bg-dark-border bg-light-border" />
          </div>

          <div className="flex items-center justify-between px-4 pb-3">
            <h2 className="text-base font-extrabold dark:text-dark-text text-light-text">
              Tambah Transaksi
            </h2>
            <button
              onClick={onClose}
              aria-label="Tutup form"
              className="p-2 rounded-xl dark:bg-dark-card bg-light-surface dark:text-dark-muted text-light-muted"
            >
              <X size={18} />
            </button>
          </div>

          {/* Type toggle */}
          <div className="mx-4 mb-1 p-1 rounded-xl dark:bg-dark-card bg-light-surface flex gap-1">
            {(['pengeluaran', 'pemasukan'] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={[
                  'flex-1 py-2.5 rounded-lg text-sm font-extrabold transition-all duration-200',
                  form.type === t
                    ? t === 'pengeluaran'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'bg-accent text-white shadow-sm'
                    : 'dark:text-dark-muted text-light-muted',
                ].join(' ')}
              >
                {t === 'pengeluaran' ? 'Pengeluaran' : 'Pemasukan'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Amount display */}
          <div className="px-4 pt-5 pb-2 text-center">
            <p
              className={[
                'text-[2.5rem] font-extrabold tracking-tight transition-colors leading-none',
                amount === 0
                  ? 'dark:text-dark-muted text-light-muted'
                  : form.type === 'pemasukan'
                  ? 'text-accent'
                  : 'text-red-400',
              ].join(' ')}
            >
              {amount === 0 ? 'Rp 0' : formatIDR(amount)}
            </p>
          </div>

          {/* Scan button */}
          <div className="px-4 pb-4 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-2xl dark:bg-dark-card bg-light-surface text-sm font-bold dark:text-dark-muted text-light-muted border dark:border-dark-border border-light-border transition-all active:scale-95 disabled:opacity-50"
            >
              {isScanLoading ? (
                <Loader2 size={15} className="animate-spin text-accent" />
              ) : (
                <Camera size={15} className="text-accent" />
              )}
              {isScanLoading ? 'Memproses struk...' : 'Scan Struk'}
            </button>
            {scanError && (
              <p className="text-xs text-red-400 font-semibold text-center px-4">{scanError}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) void handleScanFile(file)
              }}
            />
          </div>

          {/* Numpad */}
          <div className="px-4 pb-5">
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

          {/* Divider */}
          <div className="mx-4 h-px dark:bg-dark-border bg-light-border mb-5" />

          {/* Categories */}
          <div className="px-4 pb-5">
            <p className="text-[11px] font-bold dark:text-dark-muted text-light-muted uppercase tracking-widest mb-3">
              Kategori
              {selectedCategory && (
                <span style={{ color: selectedCategory.color }}>
                  {' '}· {selectedCategory.name}
                </span>
              )}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {visibleCategories.map(cat => {
                const Icon = cat.icon
                const isSelected = form.categoryId === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={[
                      'flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border-2 transition-all duration-150 active:scale-95',
                      isSelected ? '' : 'border-transparent dark:bg-dark-card bg-light-surface',
                    ].join(' ')}
                    style={
                      isSelected
                        ? { borderColor: cat.color, backgroundColor: cat.color + '18' }
                        : undefined
                    }
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: cat.color + '25', color: cat.color }}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-bold dark:text-dark-text text-light-text leading-tight text-center w-full truncate">
                      {cat.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date */}
          <div className="px-4 pb-5">
            <p className="text-[11px] font-bold dark:text-dark-muted text-light-muted uppercase tracking-widest mb-3">
              Tanggal
            </p>
            <div
              className="relative flex items-center gap-3 dark:bg-dark-card bg-light-surface rounded-xl px-4 py-3.5 cursor-pointer overflow-hidden"
              onClick={() => dateInputRef.current?.showPicker?.()}
            >
              <Calendar size={18} className="text-accent flex-shrink-0" />
              <p className="flex-1 text-sm font-bold dark:text-dark-text text-light-text capitalize truncate">
                {formatDisplayDate(form.date)}
              </p>
              <input
                ref={dateInputRef}
                type="date"
                value={form.date}
                max={todayISO()}
                onChange={e => e.target.value && setForm(prev => ({ ...prev, date: e.target.value }))}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              />
            </div>
          </div>

          {/* Description */}
          <div className="px-4 pb-5">
            <p className="text-[11px] font-bold dark:text-dark-muted text-light-muted uppercase tracking-widest mb-3">
              Deskripsi <span className="normal-case opacity-60">(opsional)</span>
            </p>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Contoh: Makan siang di warung..."
              maxLength={100}
              className="w-full rounded-xl px-4 py-3.5 text-sm font-semibold dark:bg-dark-card bg-light-surface dark:text-dark-text text-light-text border dark:border-dark-border border-light-border outline-none focus:border-accent transition-colors placeholder:dark:text-dark-muted placeholder:text-light-muted"
            />
          </div>

          {/* Recurring toggle */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between dark:bg-dark-card bg-light-surface rounded-xl px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-accent/10 flex-shrink-0">
                  <RefreshCw size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold dark:text-dark-text text-light-text">
                    Transaksi Berulang
                  </p>
                  <p className="text-xs dark:text-dark-muted text-light-muted font-semibold">
                    Catat otomatis setiap bulan
                  </p>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={form.isRecurring}
                onClick={() => setForm(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
                className={[
                  'w-12 h-6 rounded-full relative flex-shrink-0 transition-colors duration-200',
                  form.isRecurring ? 'bg-accent' : 'dark:bg-dark-border bg-light-border',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200',
                    form.isRecurring ? 'left-[26px]' : 'left-0.5',
                  ].join(' ')}
                />
              </button>
            </div>
          </div>

          {/* Save */}
          <div className="px-4 pb-10 pt-2">
            <button
              onClick={() => void handleSave()}
              disabled={!isValid || isSaving}
              className="w-full py-4 rounded-2xl text-sm font-extrabold text-white bg-accent hover:bg-accent-dark disabled:opacity-35 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
            {saveError && (
              <p className="text-center text-xs text-red-400 font-semibold mt-2.5">{saveError}</p>
            )}
            {!isValid && !saveError && (
              <p className="text-center text-xs dark:text-dark-muted text-light-muted font-semibold mt-2.5">
                {amount === 0
                  ? 'Masukkan jumlah terlebih dahulu'
                  : 'Pilih kategori terlebih dahulu'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
