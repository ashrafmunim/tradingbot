import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  interactive?: boolean
  onClick?: () => void
}

export function Card({ children, className, interactive, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700',
        interactive && 'hover:border-[#1a73e8] dark:hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-4 py-3 border-b border-gray-200 dark:border-slate-700', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900 dark:text-slate-100', className)}>
      {children}
    </h3>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('p-4', className)}>{children}</div>
}
