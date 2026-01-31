import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function getSentimentColor(score: number): string {
  if (score > 0.3) return 'text-emerald-600 dark:text-emerald-400'
  if (score < -0.3) return 'text-rose-600 dark:text-rose-400'
  return 'text-amber-600 dark:text-amber-400'
}

export function getSentimentBgColor(score: number): string {
  if (score > 0.3) return 'bg-emerald-100 dark:bg-emerald-900/30'
  if (score < -0.3) return 'bg-rose-100 dark:bg-rose-900/30'
  return 'bg-amber-100 dark:bg-amber-900/30'
}

export function getSignalBadgeClass(signal: string): string {
  switch (signal) {
    case 'strong_buy':
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
    case 'buy':
      return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
    case 'hold':
      return 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300'
    case 'sell':
      return 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
    case 'strong_sell':
      return 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300'
    default:
      return 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300'
  }
}
