import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCategories } from '../hooks/useCategories'
import { useOnboarding } from '../hooks/useOnboarding'
import { ProgressBar } from '../components/onboarding/ProgressBar'
import { StepWelcome } from '../components/onboarding/StepWelcome'
import { StepIncome } from '../components/onboarding/StepIncome'
import { StepBudget, computeSuggestions } from '../components/onboarding/StepBudget'
import type { BudgetEntry } from '../components/onboarding/StepBudget'

export function Onboarding() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { categories } = useCategories()
  const { step, data, loading, error, updateData, addCustomCategory, removeCustomCategory, goNext, goBack, completeOnboarding } = useOnboarding()

  const fullName = profile?.full_name ?? user?.user_metadata?.full_name ?? 'Kamu'
  const incomeCategories = categories.filter((c) => c.type === 'pemasukan')
  const expenseCategories = categories.filter((c) => c.type === 'pengeluaran')

  function handleStep2Next() {
    if (data.budgets.length === 0 && data.incomeAmount > 0) {
      const defaultNames = ['Makanan', 'Transport', 'Tagihan', 'Hiburan', 'Belanja', 'Investasi']
      const defaultSelected = expenseCategories
        .filter((c) => defaultNames.includes(c.name))
        .map((c) => c.id)
      const suggestions = computeSuggestions(expenseCategories, [], defaultSelected, data.incomeAmount)
      const budgets: BudgetEntry[] = defaultSelected.map((id) => ({
        categoryId: id,
        amount: suggestions[id] ?? 0,
      }))
      updateData({ budgets })
    }
    goNext()
  }

  async function handleComplete() {
    const ok = await completeOnboarding()
    if (ok) navigate('/beranda', { replace: true })
  }

  return (
    <div className="min-h-dvh dark:bg-dark-base bg-light-base flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-5 py-6 gap-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-extrabold dark:text-dark-text text-light-text">
            BeresinDuit
          </span>
          {step > 1 && (
            <ProgressBar current={step} total={3} />
          )}
        </div>

        <div className="flex-1">
          {step === 1 && (
            <StepWelcome fullName={fullName} onNext={goNext} />
          )}

          {step === 2 && (
            <StepIncome
              incomeCategories={incomeCategories}
              incomeAmount={data.incomeAmount}
              incomeCategoryId={data.incomeCategoryId}
              salaryDate={data.salaryDate}
              currentBalance={data.currentBalance}
              onChangeIncomeAmount={(val) => updateData({ incomeAmount: val })}
              onChangeIncomeCategoryId={(id) => updateData({ incomeCategoryId: id })}
              onChangeSalaryDate={(val) => updateData({ salaryDate: val })}
              onChangeCurrentBalance={(val) => updateData({ currentBalance: val })}
              onNext={handleStep2Next}
              onBack={goBack}
            />
          )}

          {step === 3 && (
            <StepBudget
              expenseCategories={expenseCategories}
              customCategories={data.customCategories}
              income={data.incomeAmount}
              budgets={data.budgets}
              onChangeBudgets={(budgets) => updateData({ budgets })}
              onAddCustomCategory={addCustomCategory}
              onRemoveCustomCategory={removeCustomCategory}
              onSubmit={handleComplete}
              onBack={goBack}
              loading={loading}
            />
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-sm font-semibold text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
