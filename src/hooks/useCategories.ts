import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Category } from '../types'
import { useAuth } from '../contexts/AuthContext'

type UseCategoriesResult = {
  categories: Category[]
  loading: boolean
}

export function useCategories(): UseCategoriesResult {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setCategories(data)
        setLoading(false)
      })
  }, [user])

  return { categories, loading }
}
