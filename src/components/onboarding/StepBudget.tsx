import { useState } from 'react'
import { ArrowLeft, Check, Plus, X } from 'lucide-react'
import type { Category } from '../../types'
import { formatIDR } from '../../utils/format'
import { CategoryForm } from './CategoryForm'
import type { CustomCategoryDraft, GroupKey } from './CategoryForm'
import { getIconComponent } from './IconPicker'

export type { CustomCategoryDraft }

export type BudgetEntry = {
  categoryId: string
  amount: number
}

type CategoryGroup = {
  key: GroupKey
  label: string
  description: string
  names: string[]
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    key: 'needs',
    label: 'Kebutuhan Pokok',
    description: '50% dari penghasilan',
    names: ['Makanan', 'Transport', 'Tagihan', 'Kesehatan', 'Pendidikan'],
  },
  {
    key: 'wants',
    label: 'Keinginan',
    description: '30% dari penghasilan',
    names: ['Hiburan', 'Belanja'],
  },
  {
    key: 'investment',
    label: 'Investasi',
    description: '20% dari penghasilan',
    names: ['Investasi'],
  },
  {
    key: 'other',
    label: 'Lainnya',
    description: 'Di luar kalkulasi',
    names: ['Lainnya'],
  },
]

function roundTo50k(amount: number): number {
  return Math.round(amount / 50_000) * 50_000
}

function getDbCategoryGroup(name: string): GroupKey {
  for (const g of CATEGORY_GROUPS) {
    if (g.names.includes(name)) return g.key
  }
  return 'other'
}

function countSelectedInGroup(
  groupKey: GroupKey,
  dbCategories: Category[],
  customCategories: CustomCategoryDraft[],
  selectedIds: string[],
): number {
  const dbCount = dbCategories.filter(
    (c) => getDbCategoryGroup(c.name) === groupKey && selectedIds.includes(c.id)
  ).length
  const customCount = customCategories.filter(
    (c) => c.group === groupKey && selectedIds.includes(c.tempId)
  ).length
  return dbCount + customCount
}

export function computeSuggestions(
  dbCategories: Category[],
  customCategories: CustomCategoryDraft[],
  selectedIds: string[],
  income: number,
): Record<string, number> {
  const needsCount = countSelectedInGroup('needs', dbCategories, customCategories, selectedIds)
  const wantsCount = countSelectedInGroup('wants', dbCategories, customCategories, selectedIds)
  const investmentCount = countSelectedInGroup('investment', dbCategories, customCategories, selectedIds)

  const needsPer = needsCount > 0 ? roundTo50k((income * 0.5) / needsCount) : 0
  const wantsPer = wantsCount > 0 ? roundTo50k((income * 0.3) / wantsCount) : 0
  const investmentPer = investmentCount > 0 ? roundTo50k((income * 0.2) / investmentCount) : 0

  const result: Record<string, number> = {}
  for (const id of selectedIds) {
    const dbCat = dbCategories.find((c) => c.id === id)
    const customCat = customCategories.find((c) => c.tempId === id)
    const groupKey = dbCat
      ? getDbCategoryGroup(dbCat.name)
      : (customCat?.group ?? 'other')
    result[id] = groupKey === 'needs' ? needsPer
      : groupKey === 'wants' ? wantsPer
      : groupKey === 'investment' ? investmentPer
      : 0
  }
  return result
}

type StepBudgetProps = {
  expenseCategories: Category[]
  customCategories: CustomCategoryDraft[]
  income: number
  budgets: BudgetEntry[]
  onChangeBudgets: (budgets: BudgetEntry[]) => void
  onAddCustomCategory: (draft: CustomCategoryDraft) => void
  onRemoveCustomCategory: (tempId: string) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
}

type InputMode = 'amount' | 'percent'

export function StepBudget({
  expenseCategories,
  customCategories,
  income,
  budgets,
  onChangeBudgets,
  onAddCustomCategory,
  onRemoveCustomCategory,
  onSubmit,
  onBack,
  loading,
}: StepBudgetProps) {
  const [inputModes, setInputModes] = useState<Record<string, InputMode>>({})
  const [showFormForGroup, setShowFormForGroup] = useState<GroupKey | null>(null)

  const selectedIds = budgets.map((b) => b.categoryId)
  const totalAllocated = budgets.reduce((sum, b) => sum + b.amount, 0)
  const sisaDana = income - totalAllocated
  const canProceed = budgets.length > 0 && budgets.every((b) => b.amount > 0)

  function getMode(id: string): InputMode {
    return inputModes[id] ?? 'amount'
  }

  function setMode(id: string, mode: InputMode) {
    setInputModes((prev) => ({ ...prev, [id]: mode }))
  }

  function toggleCategory(categoryId: string) {
    const newSelected = selectedIds.includes(categoryId)
      ? selectedIds.filter((id) => id !== categoryId)
      : [...selectedIds, categoryId]

    if (selectedIds.includes(categoryId)) {
      onChangeBudgets(budgets.filter((b) => b.categoryId !== categoryId))
      return
    }

    const suggestions = computeSuggestions(expenseCategories, customCategories, newSelected, income)
    const updated = newSelected.map((id) => {
      const existing = budgets.find((b) => b.categoryId === id)
      return { categoryId: id, amount: existing?.amount ?? suggestions[id] ?? 0 }
    })
    onChangeBudgets(updated)
  }

  function handleAmountChange(categoryId: string, raw: string) {
    const amount = parseInt(raw.replace(/\D/g, ''), 10) || 0
    onChangeBudgets(budgets.map((b) => b.categoryId === categoryId ? { ...b, amount } : b))
  }

  function handlePercentChange(categoryId: string, raw: string) {
    const pct = Math.min(parseFloat(raw) || 0, 100)
    const amount = income > 0 ? roundTo50k((income * pct) / 100) : 0
    onChangeBudgets(budgets.map((b) => b.categoryId === categoryId ? { ...b, amount } : b))
  }

  function getDisplayPercent(amount: number): string {
    if (income === 0) return '0'
    return ((amount / income) * 100).toFixed(1).replace(/\.0$/, '')
  }

  function getGroupDescription(group: CategoryGroup): string {
    if (income === 0) return group.description
    const dbIds = expenseCategories.filter((c) => group.names.includes(c.name)).map((c) => c.id)
    const customIds = customCategories.filter((c) => c.group === group.key).map((c) => c.tempId)
    const groupTotal = budgets
      .filter((b) => [...dbIds, ...customIds].includes(b.categoryId))
      .reduce((sum, b) => sum + b.amount, 0)
    if (groupTotal === 0) return group.description
    return `${Math.round((groupTotal / income) * 100)}% dari penghasilan`
  }

  function renderBudgetInput(categoryId: string) {
    const budget = budgets.find((b) => b.categoryId === categoryId)
    if (!budget) return null
    const mode = getMode(categoryId)

    return (
      <div className="px-4 pb-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1 self-end">
          {(['amount', 'percent'] as InputMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(categoryId, m)}
              className={[
                'px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all',
                mode === m
                  ? 'bg-accent text-white'
                  : 'dark:bg-dark-surface bg-light-surface dark:text-dark-muted text-light-muted',
              ].join(' ')}
            >
              {m === 'amount' ? 'Rp' : '%'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl dark:bg-dark-surface bg-light-surface px-3 py-2.5">
          <span className="text-xs font-bold dark:text-dark-muted text-light-muted flex-shrink-0">
            {mode === 'amount' ? 'Rp' : '%'}
          </span>
          {mode === 'amount' ? (
            <input
              type="text"
              inputMode="numeric"
              value={budget.amount > 0 ? budget.amount.toLocaleString('id-ID') : ''}
              onChange={(e) => handleAmountChange(categoryId, e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent text-sm font-extrabold dark:text-dark-text text-light-text outline-none"
            />
          ) : (
            <input
              type="text"
              inputMode="decimal"
              value={income > 0 ? getDisplayPercent(budget.amount) : ''}
              onChange={(e) => handlePercentChange(categoryId, e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent text-sm font-extrabold dark:text-dark-text text-light-text outline-none"
            />
          )}
          {mode === 'percent' && budget.amount > 0 && (
            <span className="text-xs font-bold dark:text-dark-muted text-light-muted flex-shrink-0">
              = {formatIDR(budget.amount)}
            </span>
          )}
        </div>
        {income > 0 && mode === 'amount' && budget.amount > 0 && (
          <p className="text-[11px] font-semibold dark:text-dark-muted text-light-muted px-1">
            {getDisplayPercent(budget.amount)}% dari penghasilanmu
          </p>
        )}
      </div>
    )
  }

  const groupedCategories = CATEGORY_GROUPS.map((group) => ({
    ...group,
    dbCategories: expenseCategories.filter((c) => group.names.includes(c.name)),
    customCats: customCategories.filter((c) => c.group === group.key),
  })).filter((g) => g.dbCategories.length > 0 || g.customCats.length > 0)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-extrabold dark:text-dark-text text-light-text">
          Atur Anggaran Bulanan
        </h2>
        <p className="text-xs font-semibold dark:text-dark-muted text-light-muted mt-0.5">
          Pilih kategori dan atur batas pengeluaran bulan ini.
        </p>
      </div>

      {income > 0 && (
        <div className={[
          'rounded-2xl px-4 py-3 flex flex-col gap-2',
          sisaDana < 0
            ? 'bg-red-500/10 border border-red-500/20'
            : sisaDana === 0
              ? 'bg-accent/10 border border-accent/20'
              : 'dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border',
        ].join(' ')}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold uppercase tracking-wide dark:text-dark-muted text-light-muted">
              Pendapatan Bulanan
            </p>
            <p className="text-sm font-extrabold dark:text-dark-text text-light-text">
              {formatIDR(income)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold uppercase tracking-wide dark:text-dark-muted text-light-muted">
              Dialokasikan
            </p>
            <p className="text-sm font-extrabold dark:text-dark-text text-light-text">
              − {formatIDR(totalAllocated)}
            </p>
          </div>
          <div className="h-px dark:bg-dark-border bg-light-border" />
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold uppercase tracking-wide dark:text-dark-muted text-light-muted">
              Sisa Pendapatan
            </p>
            <p className={[
              'text-base font-extrabold',
              sisaDana < 0 ? 'text-red-400' : sisaDana === 0 ? 'text-accent' : 'dark:text-dark-text text-light-text',
            ].join(' ')}>
              {sisaDana < 0 ? '−' : ''}{formatIDR(Math.abs(sisaDana))}
            </p>
          </div>
        </div>
      )}

      {groupedCategories.map((group) => {
        const allItems = [
          ...group.dbCategories.map((c) => ({ id: c.id, name: c.name, color: c.color, isCustom: false as const, data: c })),
          ...group.customCats.map((c) => ({ id: c.tempId, name: c.name, color: c.color, isCustom: true as const, data: c })),
        ]

        return (
          <div key={group.key} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-extrabold dark:text-dark-muted text-light-muted uppercase tracking-wide">
                {group.label}
              </span>
              <span className="text-[11px] font-bold text-accent/70">
                {getGroupDescription(group)}
              </span>
            </div>

            <div className="rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border overflow-hidden">
              {allItems.map((item, i) => {
                const isSelected = selectedIds.includes(item.id)
                const isLast = i === allItems.length - 1 && showFormForGroup !== group.key

                return (
                  <div
                    key={item.id}
                    className={[
                      'flex flex-col',
                      !isLast ? 'border-b dark:border-dark-border border-light-border' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <button
                        onClick={() => toggleCategory(item.id)}
                        className={[
                          'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                          isSelected ? 'bg-accent border-accent' : 'dark:border-dark-border border-light-border',
                        ].join(' ')}
                      >
                        {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                      </button>

                      {item.isCustom ? (
                        (() => {
                          const IconComp = getIconComponent(item.data.icon)
                          return (
                            <div
                              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: item.color + '25', color: item.color }}
                            >
                              <IconComp size={14} />
                            </div>
                          )
                        })()
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      )}

                      <span
                        className="text-sm font-bold dark:text-dark-text text-light-text flex-1 cursor-pointer"
                        onClick={() => toggleCategory(item.id)}
                      >
                        {item.name}
                      </span>

                      {item.isCustom && (
                        <button
                          onClick={() => onRemoveCustomCategory(item.id)}
                          className="p-1 rounded-lg dark:text-dark-muted text-light-muted active:opacity-60 flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {isSelected && renderBudgetInput(item.id)}
                  </div>
                )
              })}

              {showFormForGroup === group.key && (
                <div className="border-t dark:border-dark-border border-light-border p-3">
                  <CategoryForm
                    group={group.key}
                    groupLabel={group.label}
                    onAdd={(draft) => {
                      onAddCustomCategory(draft)
                      setShowFormForGroup(null)
                    }}
                    onCancel={() => setShowFormForGroup(null)}
                  />
                </div>
              )}

              {showFormForGroup !== group.key && (
                <button
                  onClick={() => setShowFormForGroup(group.key)}
                  className={[
                    'w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold dark:text-dark-muted text-light-muted active:opacity-60 transition-opacity',
                    allItems.length > 0 ? 'border-t dark:border-dark-border border-light-border' : '',
                  ].join(' ')}
                >
                  <Plus size={13} /> Tambah ke {group.label}
                </button>
              )}
            </div>
          </div>
        )
      })}

      <div className="flex gap-3 pt-1">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl border dark:border-dark-border border-light-border dark:text-dark-muted text-light-muted font-bold text-sm active:scale-[0.98] transition-transform"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <button
          onClick={onSubmit}
          disabled={!canProceed || loading}
          className={[
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-sm transition-all active:scale-[0.98]',
            canProceed && !loading
              ? 'bg-gradient-to-r from-accent to-accent-dark text-white shadow-lg'
              : 'dark:bg-dark-surface bg-light-surface dark:text-dark-muted text-light-muted cursor-not-allowed',
          ].join(' ')}
        >
          {loading ? 'Menyimpan...' : 'Selesai'}
        </button>
      </div>
    </div>
  )
}
