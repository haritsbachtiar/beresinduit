type ProgressBarProps = {
  current: 1 | 2 | 3
  total: 3
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const step = (i + 1) as 1 | 2 | 3
        const isCompleted = step < current
        const isActive = step === current
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={[
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all',
                isActive
                  ? 'bg-accent text-white'
                  : isCompleted
                    ? 'bg-accent/30 text-accent'
                    : 'dark:bg-dark-surface bg-light-surface dark:text-dark-muted text-light-muted',
              ].join(' ')}
            >
              {step}
            </div>
            {i < total - 1 && (
              <div
                className={[
                  'h-0.5 w-8 rounded-full transition-all',
                  isCompleted ? 'bg-accent/50' : 'dark:bg-dark-border bg-light-border',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
      <span className="ml-1 text-xs font-bold dark:text-dark-muted text-light-muted">
        {current}/{total}
      </span>
    </div>
  )
}
