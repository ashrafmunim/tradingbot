'use client'

import { cn } from '@/lib/utils'

interface SentimentGaugeProps {
  score: number  // -1 to 1
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function SentimentGauge({ score, size = 'md', showLabel = true }: SentimentGaugeProps) {
  // Convert -1 to 1 range to 0 to 100 for the gauge
  const percentage = ((score + 1) / 2) * 100

  const getColor = () => {
    if (score > 0.3) return 'text-emerald-500'
    if (score < -0.3) return 'text-rose-500'
    return 'text-amber-500'
  }

  const getGradient = () => {
    if (score > 0.3) return 'from-emerald-500 to-emerald-400'
    if (score < -0.3) return 'from-rose-500 to-rose-400'
    return 'from-amber-500 to-amber-400'
  }

  const getLabel = () => {
    if (score > 0.6) return 'Very Bullish'
    if (score > 0.3) return 'Bullish'
    if (score < -0.6) return 'Very Bearish'
    if (score < -0.3) return 'Bearish'
    return 'Neutral'
  }

  const sizes = {
    sm: { width: 80, height: 40, stroke: 6 },
    md: { width: 120, height: 60, stroke: 8 },
    lg: { width: 160, height: 80, stroke: 10 },
  }

  const { width, height, stroke } = sizes[size]
  const radius = height - stroke
  const circumference = Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height + 10} className="overflow-visible">
        {/* Background arc */}
        <path
          d={`M ${stroke} ${height} A ${radius} ${radius} 0 0 1 ${width - stroke} ${height}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-gray-200 dark:text-slate-700"
        />
        {/* Foreground arc */}
        <path
          d={`M ${stroke} ${height} A ${radius} ${radius} 0 0 1 ${width - stroke} ${height}`}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={cn('stop-current', getColor())} />
            <stop offset="100%" className={cn('stop-current', getColor())} />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center -mt-2">
        <p className={cn('text-lg font-bold', getColor())}>
          {score > 0 ? '+' : ''}{score.toFixed(2)}
        </p>
        {showLabel && (
          <p className="text-xs text-gray-500 dark:text-slate-500">{getLabel()}</p>
        )}
      </div>
    </div>
  )
}
