import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300',
  success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
  warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
  error: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

interface SignalBadgeProps {
  signal: string
}

export function SignalBadge({ signal }: SignalBadgeProps) {
  const getVariant = (): BadgeVariant => {
    switch (signal) {
      case 'strong_buy':
      case 'buy':
        return 'success'
      case 'hold':
        return 'default'
      case 'sell':
      case 'strong_sell':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatSignal = (s: string) => {
    return s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  return <Badge variant={getVariant()}>{formatSignal(signal)}</Badge>
}
