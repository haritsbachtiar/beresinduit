import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { BudgetEntry } from '../components/onboarding/StepBudget'
import type { CustomCategoryDraft } from '../components/onboarding/CategoryForm'

type OnboardingData = {
  incomeAmount: number
  incomeCategoryId: string
  salaryDate: number | null
  currentBalance: number | null
  budgets: BudgetEntry[]
  customCategories: CustomCategoryDraft[]
}

const INITIAL_DATA: OnboardingData = {
  incomeAmount: 0,
  incomeCategoryId: '',
  salaryDate: null,
  currentBalance: null,
  budgets: [],
  customCategories: [],
}

export function useOnboarding() {
  const { user, refreshProfile } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateData(partial: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...partial }))
  }

  function addCustomCategory(draft: CustomCategoryDraft) {
    setData((prev) => ({
      ...prev,
      customCategories: [...prev.customCategories, draft],
    }))
  }

  function removeCustomCategory(tempId: string) {
    setData((prev) => ({
      ...prev,
      customCategories: prev.customCategories.filter((c) => c.tempId !== tempId),
      budgets: prev.budgets.filter((b) => b.categoryId !== tempId),
    }))
  }

  function goNext() {
    setStep((s) => Math.min(s + 1, 3) as 1 | 2 | 3)
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3)
  }

  async function completeOnboarding(): Promise<boolean> {
    if (!user) return false
    setLoading(true)
    setError(null)

    try {
      const today = new Date().toISOString().split('T')[0]
      const period = today.slice(0, 7)

      // 1. Insert custom categories first, build tempId → realId map
      const tempIdToRealId: Record<string, string> = {}
      if (data.customCategories.length > 0) {
        const { data: created, error: catErr } = await supabase
          .from('categories')
          .insert(
            data.customCategories.map((c) => ({
              user_id: user.id,
              name: c.name,
              icon: c.icon,
              color: c.color,
              type: 'pengeluaran' as const,
              is_default: false,
            }))
          )
          .select('id, name')
        if (catErr) throw catErr
        // Match by position — insert returns rows in insert order
        data.customCategories.forEach((draft, i) => {
          if (created?.[i]) tempIdToRealId[draft.tempId] = created[i].id
        })
      }

      // 2. Insert initial balance as starting transaction
      if (data.currentBalance && data.currentBalance > 0) {
        let saldoAwalCategoryId: string | null = null

        const { data: existing } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', 'Saldo Awal')
          .single()

        if (existing) {
          saldoAwalCategoryId = existing.id
        } else {
          const { data: created, error: catErr } = await supabase
            .from('categories')
            .insert({
              user_id: user.id,
              name: 'Saldo Awal',
              icon: 'wallet',
              color: '#22c55e',
              type: 'pemasukan',
              is_default: false,
            })
            .select('id')
            .single()
          if (catErr) throw catErr
          saldoAwalCategoryId = created?.id ?? null
        }

        const { error: balErr } = await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'pemasukan',
          category_id: saldoAwalCategoryId,
          amount: data.currentBalance,
          description: 'Saldo Awal',
          date: today,
        })
        if (balErr) throw balErr
      }

      // 3. Insert budgets — swap tempIds with real IDs
      if (data.budgets.length > 0) {
        const budgetInserts = data.budgets.map((b) => ({
          user_id: user.id,
          category_id: tempIdToRealId[b.categoryId] ?? b.categoryId,
          limit_amount: b.amount,
          period,
        }))
        const { error: budgetErr } = await supabase.from('budgets').insert(budgetInserts)
        if (budgetErr) throw budgetErr
      }

      // 4. Update profile
      const profileUpdate = {
        onboarding_completed: true,
        ...(data.salaryDate ? { salary_date: data.salaryDate } : {}),
      }

      const { error: profileErr } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id)
      if (profileErr) throw profileErr

      await refreshProfile()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    step,
    data,
    loading,
    error,
    updateData,
    addCustomCategory,
    removeCustomCategory,
    goNext,
    goBack,
    completeOnboarding,
  }
}
