import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { IconPicker } from './IconPicker'

export type GroupKey = 'needs' | 'wants' | 'investment' | 'other'

export type CustomCategoryDraft = {
  tempId: string
  name: string
  icon: string
  color: string
  group: GroupKey
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#ec4899', '#64748b', '#6b7280',
]

type CategoryFormProps = {
  group: GroupKey
  groupLabel: string
  onAdd: (draft: CustomCategoryDraft) => void
  onCancel: () => void
}

export function CategoryForm({ group, groupLabel, onAdd, onCancel }: CategoryFormProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[5])
  const [icon, setIcon] = useState('tag')

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({
      tempId: `custom_${Date.now()}`,
      name: trimmed,
      icon,
      color,
      group,
    })
  }

  return (
    <div className="rounded-2xl dark:bg-dark-surface bg-light-surface border dark:border-dark-border border-light-border p-4 flex flex-col gap-4">
      <p className="text-xs font-extrabold dark:text-dark-muted text-light-muted uppercase tracking-wide">
        Tambah ke {groupLabel}
      </p>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama kategori..."
        maxLength={30}
        autoFocus
        className="rounded-xl dark:bg-dark-card bg-light-card px-3 py-2.5 text-sm font-bold dark:text-dark-text text-light-text outline-none border dark:border-dark-border border-light-border focus:border-accent transition-colors"
      />

      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
            style={{ backgroundColor: c }}
          >
            {color === c && <Check size={13} className="text-white" strokeWidth={3} />}
          </button>
        ))}
      </div>

      <IconPicker selected={icon} onSelect={setIcon} />

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-xl dark:bg-dark-card bg-light-card dark:text-dark-muted text-light-muted active:scale-90 transition-transform"
        >
          <X size={16} />
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!name.trim()}
          className={[
            'px-4 py-2 rounded-xl text-sm font-extrabold transition-all active:scale-95',
            name.trim()
              ? 'bg-accent text-white'
              : 'dark:bg-dark-card bg-light-card dark:text-dark-muted text-light-muted cursor-not-allowed',
          ].join(' ')}
        >
          Tambah
        </button>
      </div>
    </div>
  )
}
