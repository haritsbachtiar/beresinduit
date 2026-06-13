import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatIDR } from '../utils/format'
import type { TransactionType } from '../types'

type DummyTransaction = {
  id: string
  description: string
  category: string
  categoryColor: string
  type: TransactionType
  amount: number
  date: string
}

type DummyBudget = {
  id: string
  category: string
  categoryColor: string
  spent: number
  limit: number
}

const DUMMY_TRANSACTIONS: DummyTransaction[] = [
  { id: '1', description: 'Gaji Juni', category: 'Gaji', categoryColor: '#22c55e', type: 'pemasukan', amount: 8_000_000, date: '2026-06-01' },
  { id: '2', description: 'Makan siang warung', category: 'Makanan', categoryColor: '#ef4444', type: 'pengeluaran', amount: 45_000, date: '2026-06-13' },
  { id: '3', description: 'Grab ke kantor', category: 'Transport', categoryColor: '#f97316', type: 'pengeluaran', amount: 25_000, date: '2026-06-13' },
  { id: '4', description: 'Tagihan listrik', category: 'Tagihan', categoryColor: '#64748b', type: 'pengeluaran', amount: 380_000, date: '2026-06-12' },
  { id: '5', description: 'Beli baju di mall', category: 'Belanja', categoryColor: '#ec4899', type: 'pengeluaran', amount: 250_000, date: '2026-06-11' },
]

const DUMMY_BUDGETS: DummyBudget[] = [
  { id: '1', category: 'Makanan', categoryColor: '#ef4444', spent: 700_000, limit: 1_000_000 },
  { id: '2', category: 'Transport', categoryColor: '#f97316', spent: 225_000, limit: 500_000 },
  { id: '3', category: 'Belanja', categoryColor: '#ec4899', spent: 900_000, limit: 1_000_000 },
]

const TOTAL_SALDO = 4_500_000
const TOTAL_PEMASUKAN = 8_000_000
const TOTAL_PENGELUARAN = 3_500_000

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.getTime() === today.getTime()) return 'Hari ini'
  if (date.getTime() === yesterday.getTime()) return 'Kemarin'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date)
}

export function Beranda() {
  return (
    <div className="flex flex-col gap-5">

      {/* ── Balance Card ── */}
      <div className="rounded-2xl bg-gradient-to-br from-accent to-accent-dark p-5 shadow-lg">
        <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest">
          Total Saldo
        </p>
        <p className="text-[2rem] font-extrabold text-white mt-1 leading-tight">
          {formatIDR(TOTAL_SALDO)}
        </p>
        <p className="text-xs font-semibold text-white/50 mt-0.5">Juni 2026</p>

        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20">
              <TrendingUp size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-wide">
                Pemasukan
              </p>
              <p className="text-sm font-extrabold text-white">
                {formatIDR(TOTAL_PEMASUKAN)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20">
              <TrendingDown size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-wide">
                Pengeluaran
              </p>
              <p className="text-sm font-extrabold text-white">
                {formatIDR(TOTAL_PENGELUARAN)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Anggaran ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold dark:text-dark-text text-light-text">
            Anggaran Bulan Ini
          </h2>
          <Link
            to="/anggaran"
            className="flex items-center gap-0.5 text-xs font-bold text-accent"
          >
            Lihat semua <ChevronRight size={14} />
          </Link>
        </div>

        <div className="rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border overflow-hidden">
          {DUMMY_BUDGETS.map((budget, i) => {
            const pct = Math.min((budget.spent / budget.limit) * 100, 100)
            const isOver = budget.spent >= budget.limit

            return (
              <div
                key={budget.id}
                className={[
                  'px-4 py-3.5 flex flex-col gap-2.5',
                  i < DUMMY_BUDGETS.length - 1
                    ? 'border-b dark:border-dark-border border-light-border'
                    : '',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: budget.categoryColor }}
                    />
                    <span className="text-sm font-bold dark:text-dark-text text-light-text truncate">
                      {budget.category}
                    </span>
                    {isOver && (
                      <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        Melebihi
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold flex-shrink-0 ${isOver ? 'text-red-400' : 'dark:text-dark-muted text-light-muted'}`}
                  >
                    {formatIDR(budget.spent)}
                    <span className="opacity-50"> / {formatIDR(budget.limit)}</span>
                  </span>
                </div>

                <div className="h-1.5 rounded-full dark:bg-dark-surface bg-light-surface overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isOver ? '#ef4444' : budget.categoryColor,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Transaksi Terbaru ── */}
      <section className="pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold dark:text-dark-text text-light-text">
            Transaksi Terbaru
          </h2>
          <Link
            to="/transaksi"
            className="flex items-center gap-0.5 text-xs font-bold text-accent"
          >
            Lihat semua <ChevronRight size={14} />
          </Link>
        </div>

        <div className="rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border overflow-hidden">
          {DUMMY_TRANSACTIONS.map((tx, i) => (
            <div
              key={tx.id}
              className={[
                'flex items-center gap-3 px-4 py-3.5',
                i < DUMMY_TRANSACTIONS.length - 1
                  ? 'border-b dark:border-dark-border border-light-border'
                  : '',
              ].join(' ')}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0"
                style={{
                  backgroundColor: tx.categoryColor + '20',
                  color: tx.categoryColor,
                }}
              >
                {tx.category.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold dark:text-dark-text text-light-text truncate">
                  {tx.description}
                </p>
                <p className="text-xs font-semibold dark:text-dark-muted text-light-muted">
                  {tx.category} · {formatRelativeDate(tx.date)}
                </p>
              </div>

              <p
                className={`text-sm font-extrabold flex-shrink-0 ${tx.type === 'pemasukan' ? 'text-accent' : 'text-red-400'}`}
              >
                {tx.type === 'pemasukan' ? '+' : '−'}{formatIDR(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
