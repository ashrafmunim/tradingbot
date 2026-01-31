'use client'

import { Badge, SignalBadge } from './Badge'
import { cn, formatCurrency } from '@/lib/utils'
import type { Trade } from '@/lib/types'

interface TradeTableProps {
  trades: Trade[]
  compact?: boolean
}

export function TradeTable({ trades, compact = false }: TradeTableProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-slate-700">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Symbol
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Side
            </th>
            {!compact && (
              <>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Price
                </th>
              </>
            )}
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Value
            </th>
            {!compact && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Signal
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
          {trades.map((trade) => (
            <tr
              key={trade.id}
              className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400 whitespace-nowrap">
                {formatTime(trade.timestamp)}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-slate-100">
                {trade.symbol}
              </td>
              <td className="px-4 py-3">
                <Badge variant={trade.side === 'buy' ? 'success' : 'error'}>
                  {trade.side.toUpperCase()}
                </Badge>
              </td>
              {!compact && (
                <>
                  <td className="px-4 py-3 text-sm text-right font-mono text-gray-900 dark:text-slate-100">
                    {trade.quantity.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-gray-900 dark:text-slate-100">
                    {formatCurrency(trade.price)}
                  </td>
                </>
              )}
              <td className="px-4 py-3 text-sm text-right font-mono text-gray-900 dark:text-slate-100">
                {formatCurrency(trade.total_value)}
              </td>
              {!compact && trade.signal_type && (
                <td className="px-4 py-3">
                  <SignalBadge signal={trade.signal_type} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {trades.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-slate-500">
          No trades yet
        </div>
      )}
    </div>
  )
}
