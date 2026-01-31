'use client'

import { cn } from '@/lib/utils'

interface FearGreedGaugeProps {
  value: number  // 0-100
  classification: string
}

export function FearGreedGauge({ value, classification }: FearGreedGaugeProps) {
  const getColor = () => {
    if (value >= 75) return 'text-emerald-500'
    if (value >= 55) return 'text-emerald-400'
    if (value >= 45) return 'text-amber-500'
    if (value >= 25) return 'text-orange-500'
    return 'text-rose-500'
  }

  const getBgColor = () => {
    if (value >= 75) return 'bg-emerald-500'
    if (value >= 55) return 'bg-emerald-400'
    if (value >= 45) return 'bg-amber-500'
    if (value >= 25) return 'bg-orange-500'
    return 'bg-rose-500'
  }

  // Calculate needle rotation (0 = -90deg, 100 = 90deg)
  const rotation = (value / 100) * 180 - 90

  return (
    <div className="flex flex-col items-center">
      {/* Gauge */}
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Background gradient arc */}
        <div className="absolute inset-0">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Gradient background */}
            <defs>
              <linearGradient id="fng-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="25%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="75%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            {/* Arc */}
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="url(#fng-gradient)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Tick marks */}
            {[0, 25, 50, 75, 100].map((tick) => {
              const angle = (tick / 100) * 180 - 90
              const radians = (angle * Math.PI) / 180
              const x1 = 100 + 75 * Math.cos(radians)
              const y1 = 100 + 75 * Math.sin(radians)
              const x2 = 100 + 85 * Math.cos(radians)
              const y2 = 100 + 85 * Math.sin(radians)
              return (
                <line
                  key={tick}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-400 dark:text-slate-600"
                />
              )
            })}
          </svg>
        </div>

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-500"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="w-1 h-20 bg-gray-800 dark:bg-slate-200 rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gray-800 dark:bg-slate-200" />
        </div>
      </div>

      {/* Value */}
      <div className="text-center mt-2">
        <p className={cn('text-3xl font-bold', getColor())}>{value}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
          {classification}
        </p>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between w-full mt-2 px-2 text-xs text-gray-500 dark:text-slate-500">
        <span>Extreme Fear</span>
        <span>Neutral</span>
        <span>Extreme Greed</span>
      </div>
    </div>
  )
}
