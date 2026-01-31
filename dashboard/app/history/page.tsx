'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Badge, SignalBadge } from '@/components/Badge'
import { cn, formatCurrency } from '@/lib/utils'
import {
  Search,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
} from 'lucide-react'
import type { Trade } from '@/lib/types'

const mockTrades: Trade[] = [
  { id: 1, timestamp: '2024-01-15T10:30:00', symbol: 'BTC/USDT', side: 'buy', quantity: 0.05, price: 42850, total_value: 2142.50, sentiment_score: 0.65, signal_type: 'strong_buy', status: 'executed' },
  { id: 2, timestamp: '2024-01-15T09:15:00', symbol: 'NVDA', side: 'buy', quantity: 10, price: 492.50, total_value: 4925.00, sentiment_score: 0.72, signal_type: 'buy', status: 'executed' },
  { id: 3, timestamp: '2024-01-14T16:45:00', symbol: 'TSLA', side: 'sell', quantity: 5, price: 245.80, total_value: 1229.00, sentiment_score: -0.38, signal_type: 'sell', status: 'executed' },
  { id: 4, timestamp: '2024-01-14T14:20:00', symbol: 'ETH/USDT', side: 'buy', quantity: 1.2, price: 2250, total_value: 2700.00, sentiment_score: 0.45, signal_type: 'buy', status: 'executed' },
  { id: 5, timestamp: '2024-01-14T11:00:00', symbol: 'SOL/USDT', side: 'buy', quantity: 25, price: 95.50, total_value: 2387.50, sentiment_score: 0.52, signal_type: 'buy', status: 'executed' },
  { id: 6, timestamp: '2024-01-13T15:30:00', symbol: 'AAPL', side: 'buy', quantity: 8, price: 183.20, total_value: 1465.60, sentiment_score: 0.41, signal_type: 'buy', status: 'executed' },
  { id: 7, timestamp: '2024-01-13T10:00:00', symbol: 'BTC/USDT', side: 'sell', quantity: 0.03, price: 43100, total_value: 1293.00, sentiment_score: -0.15, signal_type: 'hold', status: 'executed' },
  { id: 8, timestamp: '2024-01-12T14:45:00', symbol: 'GOOGL', side: 'buy', quantity: 12, price: 139.50, total_value: 1674.00, sentiment_score: 0.35, signal_type: 'buy', status: 'executed' },
  { id: 9, timestamp: '2024-01-12T09:30:00', symbol: 'ETH/USDT', side: 'sell', quantity: 0.8, price: 2320, total_value: 1856.00, sentiment_score: -0.28, signal_type: 'sell', status: 'executed' },
  { id: 10, timestamp: '2024-01-11T16:00:00', symbol: 'MSFT', side: 'buy', quantity: 5, price: 375.40, total_value: 1877.00, sentiment_score: 0.48, signal_type: 'buy', status: 'executed' },
]

type SideFilter = 'all' | 'buy' | 'sell'

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sideFilter, setSideFilter] = useState<SideFilter>('all')

  const filteredTrades = mockTrades.filter(trade => {
    if (searchQuery && !trade.symbol.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (sideFilter !== 'all' && trade.side !== sideFilter) {
      return false
    }
    return true
  })

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
  }

  // Stats
  const totalTrades = mockTrades.length
  const buyTrades = mockTrades.filter(t => t.side === 'buy').length
  const sellTrades = mockTrades.filter(t => t.side === 'sell').length
  const totalVolume = mockTrades.reduce((acc, t) => acc + t.total_value, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Trade History
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm">
            Complete record of all executed trades
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-[#1a73e8]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Total Trades</p>
              <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{totalTrades}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Buy Orders</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{buyTrades}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Sell Orders</p>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{sellTrades}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Total Volume</p>
              <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{formatCurrency(totalVolume)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent text-sm"
          />
        </div>

        {/* Side Filter */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
          {(['all', 'buy', 'sell'] as SideFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setSideFilter(filter)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                sideFilter === filter
                  ? 'text-gray-900 dark:text-white bg-white dark:bg-slate-700 shadow-sm'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Trades Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Side
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Sentiment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Signal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredTrades.map((trade) => {
                const { date, time } = formatTime(trade.timestamp)
                return (
                  <tr
                    key={trade.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{date}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500">{time}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-slate-100">
                      {trade.symbol}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={trade.side === 'buy' ? 'success' : 'error'}>
                        {trade.side.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-mono text-gray-900 dark:text-slate-100">
                      {trade.quantity}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-mono text-gray-900 dark:text-slate-100">
                      {formatCurrency(trade.price)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-mono font-medium text-gray-900 dark:text-slate-100">
                      {formatCurrency(trade.total_value)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {trade.sentiment_score !== null && (
                        <span className={cn(
                          'font-mono text-sm',
                          trade.sentiment_score > 0.3 ? 'text-emerald-600 dark:text-emerald-400' :
                          trade.sentiment_score < -0.3 ? 'text-rose-600 dark:text-rose-400' :
                          'text-amber-600 dark:text-amber-400'
                        )}>
                          {trade.sentiment_score > 0 ? '+' : ''}{trade.sentiment_score.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {trade.signal_type && <SignalBadge signal={trade.signal_type} />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredTrades.length}</span> of{" "}
            <span className="font-medium">{mockTrades.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
