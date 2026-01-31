'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface TickerItem {
  symbol: string
  price: number
  change: number
}

interface MarketTickerProps {
  items: TickerItem[]
}

export function MarketTicker({ items }: MarketTickerProps) {
  // Duplicate items for seamless scrolling
  const duplicatedItems = [...items, ...items]

  return (
    <div className="relative bg-slate-50 dark:bg-slate-800/50 py-2 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="ticker-wrapper">
        <div className="ticker-content flex animate-ticker">
          {duplicatedItems.map((item, index) => (
            <div
              key={`${item.symbol}-${index}`}
              className="flex items-center gap-3 px-6 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap"
            >
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {item.symbol}
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-200">
                ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={cn(
                  'flex items-center gap-1 text-sm',
                  item.change >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {item.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Indicator */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center px-4 bg-gradient-to-l from-slate-50 dark:from-slate-800/80 to-transparent">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>LIVE</span>
        </div>
      </div>
    </div>
  )
}
