import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type FormContextValue = {
  isOpen: boolean
  openForm: () => void
  closeForm: () => void
}

const FormContext = createContext<FormContextValue | null>(null)

export function FormProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <FormContext.Provider value={{
      isOpen,
      openForm: () => setIsOpen(true),
      closeForm: () => setIsOpen(false),
    }}>
      {children}
    </FormContext.Provider>
  )
}

export function useForm(): FormContextValue {
  const ctx = useContext(FormContext)
  if (!ctx) throw new Error('useForm harus digunakan di dalam FormProvider')
  return ctx
}
