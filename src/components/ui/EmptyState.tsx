import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-forest/10 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-gold">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mt-5 font-serif text-2xl font-black text-forest">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-forest/65">{description}</p>
      {actionLabel && onAction ? <Button className="mt-6" onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  )
}
