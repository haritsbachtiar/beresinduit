export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type TransactionType = 'pemasukan' | 'pengeluaran'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          onboarding_completed: boolean
          salary_date: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          salary_date?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          salary_date?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          color: string
          type: TransactionType
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string
          color?: string
          type: TransactionType
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          color?: string
          type?: TransactionType
          is_default?: boolean
          created_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          type: TransactionType
          amount: number
          description: string
          notes: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          type: TransactionType
          amount: number
          description?: string
          notes?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          type?: TransactionType
          amount?: number
          description?: string
          notes?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          }
        ]
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          limit_amount: number
          period: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          limit_amount: number
          period?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          limit_amount?: number
          period?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      budget_summary: {
        Row: {
          id: string
          user_id: string
          category_id: string
          category_name: string
          category_icon: string
          category_color: string
          limit_amount: number
          spent_amount: number
          period: string
          created_at: string
          updated_at: string
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: {
      transaction_type: TransactionType
    }
  }
}

// Shorthand types untuk penggunaan di seluruh app
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Budget = Database['public']['Tables']['budgets']['Row']
export type BudgetSummary = Database['public']['Views']['budget_summary']['Row']

export type NewTransaction = Database['public']['Tables']['transactions']['Insert']
export type NewBudget = Database['public']['Tables']['budgets']['Insert']
export type NewCategory = Database['public']['Tables']['categories']['Insert']
