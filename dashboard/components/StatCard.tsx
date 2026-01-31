import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  iconColor?: string
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-[#1a73e8]',
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-slate-100">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                'mt-1 text-sm',
                changeType === 'positive' && 'text-emerald-600 dark:text-emerald-400',
                changeType === 'negative' && 'text-rose-600 dark:text-rose-400',
                changeType === 'neutral' && 'text-gray-500 dark:text-slate-500'
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn('p-2 rounded-lg bg-gray-100 dark:bg-slate-700', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
