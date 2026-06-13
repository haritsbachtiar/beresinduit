import { useState } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, Pencil, Trash2,
  TrendingDown, TrendingUp, PieChart,
} from 'lucide-react'
import { BudgetModal } from '../components/BudgetModal'
import { formatIDR } from '../utils/format'

// ── Types ─────────────────────────────────────────────────────────────────────

type BudgetItem = {
  id: string
  categoryId: string
  categoryName: string
  categoryColor: string
  limitAmount: number
  spentAmount: number
}

type MonthlyTotal = {
  month: string
  label: string
  total: number
}

type CategoryOption = {
  id: string
  name: string
  color: string
}

type MoMCategory = {
  id: string
  name: string
  color: string
  current: number
  previous: number
}

// ── Dummy data ────────────────────────────────────────────────────────────────

const CURRENT_PERIOD = '2026-06'

const SPENDING_CATEGORIES: CategoryOption[] = [
  { id: 'makanan',    name: 'Makanan',    color: '#ef4444' },
  { id: 'transport',  name: 'Transport',  color: '#f97316' },
  { id: 'belanja',    name: 'Belanja',    color: '#ec4899' },
  { id: 'kesehatan',  name: 'Kesehatan',  color: '#14b8a6' },
  { id: 'hiburan',    name: 'Hiburan',    color: '#8b5cf6' },
  { id: 'pendidikan', name: 'Pendidikan', color: '#3b82f6' },
  { id: 'tagihan',    name: 'Tagihan',    color: '#64748b' },
  { id: 'lain-out',   name: 'Lainnya',    color: '#6b7280' },
]

const INITIAL_BUDGETS: BudgetItem[] = [
  { id: '1', categoryId: 'makanan',   categoryName: 'Makanan',   categoryColor: '#ef4444', limitAmount: 1_000_000, spentAmount: 700_000 },
  { id: '2', categoryId: 'transport', categoryName: 'Transport', categoryColor: '#f97316', limitAmount: 500_000,   spentAmount: 225_000 },
  { id: '3', categoryId: 'belanja',   categoryName: 'Belanja',   categoryColor: '#ec4899', limitAmount: 1_000_000, spentAmount: 950_000 },
  { id: '4', categoryId: 'tagihan',   categoryName: 'Tagihan',   categoryColor: '#64748b', limitAmount: 600_000,   spentAmount: 380_000 },
]

const MONTHLY_TOTALS: MonthlyTotal[] = [
  { month: '2026-01', label: 'Jan', total: 2_800_000 },
  { month: '2026-02', label: 'Feb', total: 3_200_000 },
  { month: '2026-03', label: 'Mar', total: 2_500_000 },
  { month: '2026-04', label: 'Apr', total: 4_100_000 },
  { month: '2026-05', label: 'Mei', total: 3_700_000 },
  { month: '2026-06', label: 'Jun', total: 2_255_000 },
]

const MOM_CATEGORIES: MoMCategory[] = [
  { id: 'makanan',   name: 'Makanan',   color: '#ef4444', current: 700_000,  previous: 850_000 },
  { id: 'belanja',   name: 'Belanja',   color: '#ec4899', current: 950_000,  previous: 620_000 },
  { id: 'transport', name: 'Transport', color: '#f97316', current: 225_000,  previous: 310_000 },
  { id: 'tagihan',   name: 'Tagihan',   color: '#64748b', current: 380_000,  previous: 380_000 },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatShort(amount: number): string {
  if (amount >= 1_000_000) {
    const v = amount / 1_000_000
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}jt`
  }
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}rb`
  return String(amount)
}

function periodLabel(period: string): string {
  const [year, month] = period.split('-')
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(
    new Date(Number(year), Number(month) - 1, 1)
  )
}

function monthName(period: string): string {
  const [year, month] = period.split('-')
  return new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(
    new Date(Number(year), Number(month) - 1, 1)
  )
}

function shiftPeriod(period: string, n: number): string {
  const [year, month] = period.split('-').map(Number)
  const d = new Date(year, month - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ── Monthly Bar Chart ─────────────────────────────────────────────────────────

function MonthlyBarChart({ data, activePeriod }: { data: MonthlyTotal[]; activePeriod: string }) {
  const max = Math.max(...data.map(d => d.total), 1)

  return (
    <section>
      <h2 className="text-sm font-extrabold dark:text-dark-text text-light-text mb-3">
        Pengeluaran 6 Bulan Terakhir
      </h2>
      <div className="rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border p-4">
        <div className="flex gap-1.5">
          {data.map(d => {
            const pct = (d.total / max) * 100
            const isCurrent = d.month === activePeriod
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span
                  className={[
                    'text-[9px] font-bold whitespace-nowrap',
                    isCurrent ? 'text-accent' : 'dark:text-dark-muted text-light-muted',
                  ].join(' ')}
                >
                  {formatShort(d.total)}
                </span>
                <div className="w-full h-[88px] flex items-end">
                  <div
                    className={[
                      'w-full rounded-t-lg transition-all duration-500',
                      isCurrent ? 'bg-accent' : 'dark:bg-dark-border bg-light-border',
                    ].join(' ')}
                    style={{ height: `${Math.max(pct, 5)}%` }}
                  />
                </div>
                <span
                  className={[
                    'text-[10px] font-bold',
                    isCurrent ? 'text-accent' : 'dark:text-dark-muted text-light-muted',
                  ].join(' ')}
                >
                  {d.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Month-over-Month Comparison ───────────────────────────────────────────────

function MoMComparison({ currentPeriod }: { currentPeriod: string }) {
  const prevPeriod = shiftPeriod(currentPeriod, -1)
  const current = MONTHLY_TOTALS.find(d => d.month === currentPeriod)?.total ?? 0
  const previous = MONTHLY_TOTALS.find(d => d.month === prevPeriod)?.total ?? 0
  const changePct = previous > 0 ? ((current - previous) / previous) * 100 : 0
  const isHemat = current <= previous

  return (
    <section>
      <h2 className="text-sm font-extrabold dark:text-dark-text text-light-text mb-3">
        Perbandingan Bulan Ini
      </h2>
      <div className="rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border overflow-hidden">
        {/* Two-column totals */}
        <div className="grid grid-cols-2 divide-x dark:divide-dark-border divide-light-border">
          <div className="px-4 py-4">
            <p className="text-[10px] font-bold dark:text-dark-muted text-light-muted uppercase tracking-widest mb-0.5">
              Bulan Ini
            </p>
            <p className="text-[11px] font-semibold dark:text-dark-muted text-light-muted mb-2 capitalize">
              {periodLabel(currentPeriod)}
            </p>
            <p className="text-xl font-extrabold text-red-400">
              {formatIDR(current)}
            </p>
          </div>
          <div className="px-4 py-4">
            <p className="text-[10px] font-bold dark:text-dark-muted text-light-muted uppercase tracking-widest mb-0.5">
              Bulan Lalu
            </p>
            <p className="text-[11px] font-semibold dark:text-dark-muted text-light-muted mb-2 capitalize">
              {periodLabel(prevPeriod)}
            </p>
            <p className="text-xl font-extrabold dark:text-dark-text text-light-text">
              {formatIDR(previous)}
            </p>
          </div>
        </div>

        {/* Change badge */}
        <div
          className={[
            'mx-4 mb-4 px-3 py-2.5 rounded-xl flex items-center gap-2',
            isHemat ? 'bg-accent/10' : 'bg-red-500/10',
          ].join(' ')}
        >
          {isHemat
            ? <TrendingDown size={15} className="text-accent flex-shrink-0" />
            : <TrendingUp size={15} className="text-red-400 flex-shrink-0" />}
          <p className={`text-xs font-bold ${isHemat ? 'text-accent' : 'text-red-400'}`}>
            {Math.abs(changePct).toFixed(1)}%{' '}
            {isHemat ? 'lebih hemat dari bulan lalu' : 'lebih boros dari bulan lalu'}
          </p>
        </div>

        {/* Per-category breakdown */}
        <div className="px-4 pb-4 flex flex-col gap-0 divide-y dark:divide-dark-border divide-light-border">
          {MOM_CATEGORIES.map(cat => {
            const diff = cat.current - cat.previous
            const isNaik = diff > 0
            const pctDiff = cat.previous > 0 ? (diff / cat.previous) * 100 : 0

            return (
              <div key={cat.id} className="flex items-center gap-3 py-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs font-bold dark:text-dark-text text-light-text flex-1 min-w-0 truncate">
                  {cat.name}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-xs dark:text-dark-muted text-light-muted font-semibold">
                    {formatIDR(cat.current)}
                  </span>
                  {diff !== 0 && (
                    <span
                      className={[
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                        isNaik
                          ? 'text-red-400 bg-red-400/10'
                          : 'text-accent bg-accent/10',
                      ].join(' ')}
                    >
                      {isNaik ? '+' : '−'}{Math.abs(pctDiff).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function Anggaran() {
  const [activePeriod, setActivePeriod] = useState(CURRENT_PERIOD)
  const [budgets, setBudgets] = useState<BudgetItem[]>(INITIAL_BUDGETS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null)

  const isCurrentPeriod = activePeriod === CURRENT_PERIOD
  const totalLimit = budgets.reduce((s, b) => s + b.limitAmount, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spentAmount, 0)
  const overallPct = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0
  const isOverBudget = totalSpent > totalLimit

  const budgetedIds = new Set(budgets.map(b => b.categoryId))
  const availableCategories = SPENDING_CATEGORIES.filter(c => !budgetedIds.has(c.id))

  function handleSaveBudget(categoryId: string, limitAmount: number) {
    if (editingBudget) {
      setBudgets(prev => prev.map(b =>
        b.id === editingBudget.id ? { ...b, limitAmount } : b
      ))
    } else {
      const cat = SPENDING_CATEGORIES.find(c => c.id === categoryId)!
      setBudgets(prev => [
        ...prev,
        {
          id: String(Date.now()),
          categoryId,
          categoryName: cat.name,
          categoryColor: cat.color,
          limitAmount,
          spentAmount: 0,
        },
      ])
    }
    setEditingBudget(null)
  }

  function openAdd() {
    setEditingBudget(null)
    setModalOpen(true)
  }

  function openEdit(budget: BudgetItem) {
    setEditingBudget(budget)
    setModalOpen(true)
  }

  function handleDelete(id: string) {
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  function handleModalClose() {
    setModalOpen(false)
    setEditingBudget(null)
  }

  return (
    <div className="flex flex-col gap-5 pb-2">

      {/* ── Month selector ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActivePeriod(p => shiftPeriod(p, -1))}
          aria-label="Bulan sebelumnya"
          className="p-2 rounded-xl dark:bg-dark-card bg-light-card dark:text-dark-text text-light-text border dark:border-dark-border border-light-border active:scale-95 transition-transform"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-base font-extrabold dark:text-dark-text text-light-text capitalize">
          {periodLabel(activePeriod)}
        </p>
        <button
          onClick={() => setActivePeriod(p => shiftPeriod(p, 1))}
          disabled={activePeriod >= CURRENT_PERIOD}
          aria-label="Bulan berikutnya"
          className="p-2 rounded-xl dark:bg-dark-card bg-light-card dark:text-dark-text text-light-text border dark:border-dark-border border-light-border disabled:opacity-30 active:scale-95 transition-transform"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Summary card ── */}
      {isCurrentPeriod && budgets.length > 0 && (
        <div className="rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[10px] font-bold dark:text-dark-muted text-light-muted uppercase tracking-widest mb-0.5">
                Total Anggaran
              </p>
              <p className="text-xl font-extrabold dark:text-dark-text text-light-text">
                {formatIDR(totalLimit)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold dark:text-dark-muted text-light-muted uppercase tracking-widest mb-0.5">
                Terpakai
              </p>
              <p className={`text-xl font-extrabold ${isOverBudget ? 'text-red-400' : 'text-accent'}`}>
                {formatIDR(totalSpent)}
              </p>
            </div>
          </div>
          <div className="h-2.5 rounded-full dark:bg-dark-surface bg-light-surface overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-400' : 'bg-accent'}`}
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <p className="text-[11px] dark:text-dark-muted text-light-muted font-semibold mt-1.5">
            {isOverBudget
              ? `Melebihi anggaran ${formatIDR(totalSpent - totalLimit)}`
              : `Sisa ${formatIDR(totalLimit - totalSpent)} dari total anggaran`}
          </p>
        </div>
      )}

      {/* ── Monthly bar chart ── */}
      <MonthlyBarChart data={MONTHLY_TOTALS} activePeriod={activePeriod} />

      {/* ── MoM comparison — current period only ── */}
      {isCurrentPeriod && <MoMComparison currentPeriod={activePeriod} />}

      {/* ── Budget list ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold dark:text-dark-text text-light-text capitalize">
            Anggaran {monthName(activePeriod)}
          </h2>
          {isCurrentPeriod && (
            <button
              onClick={openAdd}
              disabled={availableCategories.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-accent hover:bg-accent-dark disabled:opacity-40 transition-colors active:scale-95"
            >
              <Plus size={13} />
              Tambah
            </button>
          )}
        </div>

        {isCurrentPeriod && budgets.length > 0 ? (
          <div className="rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border overflow-hidden">
            {budgets.map((budget, i) => {
              const pct = Math.min((budget.spentAmount / budget.limitAmount) * 100, 100)
              const isOver = budget.spentAmount >= budget.limitAmount

              return (
                <div
                  key={budget.id}
                  className={[
                    'px-4 py-3.5',
                    i < budgets.length - 1 ? 'border-b dark:border-dark-border border-light-border' : '',
                  ].join(' ')}
                >
                  {/* Row 1: name + actions */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: budget.categoryColor }}
                      />
                      <span className="text-sm font-bold dark:text-dark-text text-light-text truncate">
                        {budget.categoryName}
                      </span>
                      {isOver && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          Melebihi
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEdit(budget)}
                        aria-label={`Edit anggaran ${budget.categoryName}`}
                        className="p-1.5 rounded-lg dark:bg-dark-surface bg-light-surface dark:text-dark-muted text-light-muted hover:text-accent transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        aria-label={`Hapus anggaran ${budget.categoryName}`}
                        className="p-1.5 rounded-lg dark:bg-dark-surface bg-light-surface dark:text-dark-muted text-light-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: amounts */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-xs font-extrabold ${isOver ? 'text-red-400' : 'dark:text-dark-text text-light-text'}`}
                    >
                      {formatIDR(budget.spentAmount)}
                    </span>
                    <span className="text-xs dark:text-dark-muted text-light-muted font-semibold">
                      dari {formatIDR(budget.limitAmount)}
                    </span>
                  </div>

                  {/* Progress bar */}
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
        ) : (
          <div className="rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border py-14 flex flex-col items-center gap-3">
            <div className="p-3.5 rounded-full dark:bg-dark-surface bg-light-surface">
              <PieChart size={24} className="dark:text-dark-muted text-light-muted" />
            </div>
            <p className="text-sm font-bold dark:text-dark-muted text-light-muted">
              {isCurrentPeriod ? 'Belum ada anggaran' : 'Tidak ada anggaran bulan ini'}
            </p>
            {isCurrentPeriod && (
              <button
                onClick={openAdd}
                className="text-xs font-bold text-accent underline-offset-2 hover:underline"
              >
                + Buat anggaran pertama
              </button>
            )}
          </div>
        )}
      </section>

      {/* ── Budget modal ── */}
      <BudgetModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        period={activePeriod}
        editCategory={
          editingBudget
            ? { id: editingBudget.categoryId, name: editingBudget.categoryName, color: editingBudget.categoryColor }
            : null
        }
        availableCategories={availableCategories}
        initialAmount={editingBudget?.limitAmount}
        onSave={handleSaveBudget}
      />
    </div>
  )
}
