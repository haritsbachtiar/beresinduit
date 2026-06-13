export function LoadingScreen() {
  return (
    <div className="min-h-dvh flex items-center justify-center dark:bg-dark-base bg-light-base">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-dark-border border-t-accent animate-spin" />
        <p className="text-sm font-semibold dark:text-dark-muted text-light-muted">
          Memuat...
        </p>
      </div>
    </div>
  )
}
