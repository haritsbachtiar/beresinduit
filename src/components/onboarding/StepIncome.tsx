import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Category } from '../../types'

type StepIncomeProps = {
  incomeCategories: Category[]
  incomeAmount: number
  incomeCategoryId: string
  salaryDate: number | null
  currentBalance: number | null
  onChangeIncomeAmount: (val: number) => void
  onChangeIncomeCategoryId: (id: string) => void
  onChangeSalaryDate: (val: number | null) => void
  onChangeCurrentBalance: (val: number | null) => void
  onNext: () => void
  onBack: () => void
}

function AmountInput({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  value: number | null
  onChange: (val: number | null) => void
  placeholder?: string
  required?: boolean
}) {
  const displayValue = value !== null && value > 0
    ? value.toLocaleString('id-ID')
    : ''

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    onChange(raw ? parseInt(raw, 10) : null)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-extrabold dark:text-dark-muted text-light-muted uppercase tracking-wide">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <div className="flex items-center gap-2 rounded-xl dark:bg-dark-surface bg-light-surface border dark:border-dark-border border-light-border px-4 py-3">
        <span className="text-sm font-bold dark:text-dark-muted text-light-muted flex-shrink-0">Rp</span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder ?? '0'}
          className="flex-1 bg-transparent text-sm font-extrabold dark:text-dark-text text-light-text outline-none"
        />
      </div>
    </div>
  )
}

export function StepIncome({
  incomeCategories,
  incomeAmount,
  incomeCategoryId,
  salaryDate,
  currentBalance,
  onChangeIncomeAmount,
  onChangeIncomeCategoryId,
  onChangeSalaryDate,
  onChangeCurrentBalance,
  onNext,
  onBack,
}: StepIncomeProps) {
  const canProceed = incomeAmount > 0 && incomeCategoryId !== ''

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-extrabold dark:text-dark-text text-light-text">
            Penghasilan Bulanan
          </h2>
          <p className="text-xs font-semibold dark:text-dark-muted text-light-muted mt-0.5">
            Berapa penghasilan utama kamu per bulan?
          </p>
        </div>

        <AmountInput
          label="Nominal Penghasilan"
          value={incomeAmount > 0 ? incomeAmount : null}
          onChange={(val) => onChangeIncomeAmount(val ?? 0)}
          placeholder="Contoh: 5.000.000"
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold dark:text-dark-muted text-light-muted uppercase tracking-wide">
            Sumber Penghasilan <span className="text-accent">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {incomeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onChangeIncomeCategoryId(cat.id)}
                className={[
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all',
                  incomeCategoryId === cat.id
                    ? 'border-accent bg-accent/10 dark:text-dark-text text-light-text'
                    : 'dark:border-dark-border border-light-border dark:text-dark-muted text-light-muted',
                ].join(' ')}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold dark:text-dark-muted text-light-muted uppercase tracking-wide">
            Tanggal Gajian (Opsional)
          </label>
          <div className="flex items-center gap-2 rounded-xl dark:bg-dark-surface bg-light-surface border dark:border-dark-border border-light-border px-4 py-3">
            <input
              type="number"
              min={1}
              max={31}
              value={salaryDate ?? ''}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                onChangeSalaryDate(val >= 1 && val <= 31 ? val : null)
              }}
              placeholder="1–31"
              className="w-full bg-transparent text-sm font-extrabold dark:text-dark-text text-light-text outline-none"
            />
            <span className="text-xs font-bold dark:text-dark-muted text-light-muted flex-shrink-0">
              setiap bulan
            </span>
          </div>
        </div>
      </div>

      <div className="h-px dark:bg-dark-border bg-light-border" />

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-extrabold dark:text-dark-text text-light-text">
            Saldo Rekening Sekarang
          </h2>
          <p className="text-xs font-semibold dark:text-dark-muted text-light-muted mt-0.5">
            Berapa saldo rekening kamu saat ini? Ini membantu balance kamu lebih akurat.
          </p>
        </div>

        <AmountInput
          label="Saldo Sekarang (Opsional)"
          value={currentBalance}
          onChange={onChangeCurrentBalance}
          placeholder="Opsional"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl border dark:border-dark-border border-light-border dark:text-dark-muted text-light-muted font-bold text-sm active:scale-[0.98] transition-transform"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={[
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-sm transition-all active:scale-[0.98]',
            canProceed
              ? 'bg-gradient-to-r from-accent to-accent-dark text-white shadow-lg'
              : 'dark:bg-dark-surface bg-light-surface dark:text-dark-muted text-light-muted cursor-not-allowed',
          ].join(' ')}
        >
          Lanjut <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
