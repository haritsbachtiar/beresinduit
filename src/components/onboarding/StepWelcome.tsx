import { Wallet, ArrowRight } from 'lucide-react'

type StepWelcomeProps = {
  fullName: string
  onNext: () => void
}

export function StepWelcome({ fullName, onNext }: StepWelcomeProps) {
  const firstName = fullName.split(' ')[0]

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-lg">
        <Wallet size={36} className="text-white" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold dark:text-dark-text text-light-text">
          Halo, {firstName}!
        </h1>
        <p className="text-sm font-semibold dark:text-dark-muted text-light-muted leading-relaxed max-w-xs">
          Selamat datang di BeresinDuit. Mari setup keuangan kamu agar balance dan anggaran
          bulanan langsung terlihat.
        </p>
      </div>

      <div className="w-full rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border p-4 flex flex-col gap-3 text-left">
        {[
          { icon: '💰', text: 'Catat penghasilan bulanan kamu' },
          { icon: '📊', text: 'Atur anggaran per kategori' },
          { icon: '📈', text: 'Pantau keuangan bulan ini' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <span className="text-xl">{icon}</span>
            <p className="text-sm font-semibold dark:text-dark-text text-light-text">{text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-accent-dark text-white font-extrabold py-3.5 rounded-2xl shadow-lg active:scale-[0.98] transition-transform"
      >
        Mulai Setup <ArrowRight size={18} />
      </button>
    </div>
  )
}
