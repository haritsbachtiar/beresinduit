import { TrendingUp, TrendingDown, ChevronRight, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatIDR } from '../utils/format'
import { useAuth } from '../contexts/AuthContext'
import { useBerandaData } from '../hooks/useBerandaData'

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
  const { profile } = useAuth()
  const { period, totalPemasukan, totalPengeluaran, totalSaldo, budgets, recentTransactions, loading } = useBerandaData()

  return (
    <div className="flex flex-col gap-5">

      {profile && !profile.onboarding_completed && (
        <Link
          to="/onboarding"
          className="flex items-center justify-between gap-3 rounded-2xl bg-accent/10 border border-accent/30 px-4 py-3.5"
        >
          <p className="text-sm font-bold dark:text-dark-text text-light-text">
            Selesaikan setup awal untuk pengalaman terbaik
          </p>
          <div className="flex items-center gap-1 text-accent font-extrabold text-sm flex-shrink-0">
            Setup <ArrowRight size={14} />
          </div>
        </Link>
      )}

      <div className="rounded-2xl bg-gradient-to-br from-accent to-accent-dark p-5 shadow-lg">
        <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest">
          Total Saldo
        </p>
        {loading ? (
          <div className="h-9 w-36 rounded-lg bg-white/20 animate-pulse mt-1" />
        ) : totalPemasukan === 0 && totalPengeluaran === 0 ? (
          <div className="mt-2">
            <p className="text-sm font-bold text-white/70">Belum ada transaksi bulan ini</p>
            <Link
              to="/transaksi"
              className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-white underline underline-offset-2"
            >
              Catat Transaksi <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <>
            <p className="text-[2rem] font-extrabold text-white mt-1 leading-tight">
              {formatIDR(totalSaldo)}
            </p>
            <p className="text-xs font-semibold text-white/50 mt-0.5">{period}</p>

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
                    {formatIDR(totalPemasukan)}
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
                    {formatIDR(totalPengeluaran)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

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

        {loading ? (
          <div className="rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border p-4 flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 rounded-xl dark:bg-dark-surface bg-light-surface animate-pulse" />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border px-4 py-6 flex flex-col items-center gap-2">
            <p className="text-sm font-bold dark:text-dark-muted text-light-muted text-center">
              Belum ada anggaran bulan ini
            </p>
            <Link
              to="/anggaran"
              className="flex items-center gap-1 text-xs font-extrabold text-accent"
            >
              Atur Anggaran <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border overflow-hidden">
            {budgets.slice(0, 3).map((budget, i) => {
              const pct = Math.min((budget.spent_amount / budget.limit_amount) * 100, 100)
              const isOver = budget.spent_amount >= budget.limit_amount

              return (
                <div
                  key={budget.id}
                  className={[
                    'px-4 py-3.5 flex flex-col gap-2.5',
                    i < Math.min(budgets.length, 3) - 1
                      ? 'border-b dark:border-dark-border border-light-border'
                      : '',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: budget.category_color }}
                      />
                      <span className="text-sm font-bold dark:text-dark-text text-light-text truncate">
                        {budget.category_name}
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
                      {formatIDR(budget.spent_amount)}
                      <span className="opacity-50"> / {formatIDR(budget.limit_amount)}</span>
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full dark:bg-dark-surface bg-light-surface overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isOver ? '#ef4444' : budget.category_color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

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

        {loading ? (
          <div className="rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border p-4 flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl dark:bg-dark-surface bg-light-surface animate-pulse" />
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border px-4 py-6 flex flex-col items-center gap-2">
            <p className="text-sm font-bold dark:text-dark-muted text-light-muted text-center">
              Belum ada transaksi
            </p>
            <Link
              to="/transaksi"
              className="flex items-center gap-1 text-xs font-extrabold text-accent"
            >
              Catat Transaksi <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border overflow-hidden">
            {recentTransactions.map((tx, i) => (
              <div
                key={tx.id}
                className={[
                  'flex items-center gap-3 px-4 py-3.5',
                  i < recentTransactions.length - 1
                    ? 'border-b dark:border-dark-border border-light-border'
                    : '',
                ].join(' ')}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0"
                  style={{
                    backgroundColor: tx.category_color + '20',
                    color: tx.category_color,
                  }}
                >
                  {tx.category_name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold dark:text-dark-text text-light-text truncate">
                    {tx.description}
                  </p>
                  <p className="text-xs font-semibold dark:text-dark-muted text-light-muted">
                    {tx.category_name} · {formatRelativeDate(tx.date)}
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
        )}
      </section>

    </div>
  )
}
