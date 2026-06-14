import type { LucideIcon } from 'lucide-react'
import {
  Utensils, Coffee, Car, Train, Bike, Bus,
  ShoppingBag, ShoppingCart, Tag, Heart, Activity, Stethoscope,
  Tv2, Music, Film, Gamepad2, Headphones,
  BookOpen, GraduationCap,
  Landmark, TrendingUp, PiggyBank, Wallet, Banknote, CreditCard,
  FileText, Zap, Phone, Home, Gift, Star, Briefcase, Laptop,
  Camera, Globe, Dumbbell, Scissors, Shirt, Baby,
} from 'lucide-react'

type IconEntry = {
  name: string
  Component: LucideIcon
}

export const ICON_LIST: IconEntry[] = [
  { name: 'utensils', Component: Utensils },
  { name: 'coffee', Component: Coffee },
  { name: 'car', Component: Car },
  { name: 'train', Component: Train },
  { name: 'bike', Component: Bike },
  { name: 'bus', Component: Bus },
  { name: 'shopping-bag', Component: ShoppingBag },
  { name: 'shopping-cart', Component: ShoppingCart },
  { name: 'tag', Component: Tag },
  { name: 'heart', Component: Heart },
  { name: 'activity', Component: Activity },
  { name: 'stethoscope', Component: Stethoscope },
  { name: 'tv-2', Component: Tv2 },
  { name: 'music', Component: Music },
  { name: 'film', Component: Film },
  { name: 'gamepad-2', Component: Gamepad2 },
  { name: 'headphones', Component: Headphones },
  { name: 'book-open', Component: BookOpen },
  { name: 'graduation-cap', Component: GraduationCap },
  { name: 'landmark', Component: Landmark },
  { name: 'trending-up', Component: TrendingUp },
  { name: 'piggy-bank', Component: PiggyBank },
  { name: 'wallet', Component: Wallet },
  { name: 'banknote', Component: Banknote },
  { name: 'credit-card', Component: CreditCard },
  { name: 'file-text', Component: FileText },
  { name: 'zap', Component: Zap },
  { name: 'phone', Component: Phone },
  { name: 'home', Component: Home },
  { name: 'gift', Component: Gift },
  { name: 'star', Component: Star },
  { name: 'briefcase', Component: Briefcase },
  { name: 'laptop', Component: Laptop },
  { name: 'camera', Component: Camera },
  { name: 'globe', Component: Globe },
  { name: 'dumbbell', Component: Dumbbell },
  { name: 'scissors', Component: Scissors },
  { name: 'shirt', Component: Shirt },
  { name: 'baby', Component: Baby },
]

export function getIconComponent(name: string): LucideIcon {
  return ICON_LIST.find((i) => i.name === name)?.Component ?? Tag
}

type IconPickerProps = {
  selected: string
  onSelect: (name: string) => void
}

export function IconPicker({ selected, onSelect }: IconPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {ICON_LIST.map(({ name, Component }) => (
        <button
          key={name}
          type="button"
          onClick={() => onSelect(name)}
          className={[
            'w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90',
            selected === name
              ? 'bg-accent text-white'
              : 'dark:bg-dark-surface bg-light-surface dark:text-dark-muted text-light-muted',
          ].join(' ')}
        >
          <Component size={16} />
        </button>
      ))}
    </div>
  )
}
