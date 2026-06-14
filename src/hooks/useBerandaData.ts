import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { BudgetSummary } from '../types'

type TransactionWithCategory = {
  id: string
  type: 'pemasukan' | 'pengeluaran'
  amount: number
  description: string
  date: string
  category_name: string
  category_color: string
}

type BerandaData = {
  period: string
  totalPemasukan: number
  totalPengeluaran: number
  totalSaldo: number
  budgets: BudgetSummary[]
  recentTransactions: TransactionWithCategory[]
  loading: boolean
}

export function useBerandaData(): BerandaData {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [totalPemasukan, setTotalPemasukan] = useState(0)
  const [totalPengeluaran, setTotalPengeluaran] = useState(0)
  const [budgets, setBudgets] = useState<BudgetSummary[]>([])
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithCategory[]>([])

  const now = new Date()
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const periodLabel = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  useEffect(() => {
    if (!user) return

    setLoading(true)

    const monthStart = `${period}-01`
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const monthEnd = nextMonth.toISOString().split('T')[0]

    Promise.all([
      supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .gte('date', monthStart)
        .lt('date', monthEnd),

      supabase
        .from('budget_summary')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', period),

      supabase
        .from('transactions')
        .select('id, type, amount, description, date, categories(name, color)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5),
    ]).then(([txResult, budgetResult, recentResult]) => {
      if (txResult.data) {
        const pemasukan = txResult.data
          .filter((t) => t.type === 'pemasukan')
          .reduce((sum, t) => sum + t.amount, 0)
        const pengeluaran = txResult.data
          .filter((t) => t.type === 'pengeluaran')
          .reduce((sum, t) => sum + t.amount, 0)
        setTotalPemasukan(pemasukan)
        setTotalPengeluaran(pengeluaran)
      }

      if (budgetResult.data) {
        setBudgets(budgetResult.data as BudgetSummary[])
      }

      if (recentResult.data) {
        const mapped = recentResult.data.map((t) => {
          const cat = t.categories as { name: string; color: string } | null
          return {
            id: t.id,
            type: t.type,
            amount: t.amount,
            description: t.description,
            date: t.date,
            category_name: cat?.name ?? 'Lainnya',
            category_color: cat?.color ?? '#6b7280',
          }
        })
        setRecentTransactions(mapped)
      }

      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, period])

  return {
    period: periodLabel,
    totalPemasukan,
    totalPengeluaran,
    totalSaldo: totalPemasukan - totalPengeluaran,
    budgets,
    recentTransactions,
    loading,
  }
}
