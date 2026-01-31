'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { PortfolioChart } from '@/components/PortfolioChart'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react'

const mockPerformanceData = [
  { timestamp: '2024-01-01', value: 10000 },
  { timestamp: '2024-01-02', value: 10120 },
  { timestamp: '2024-01-03', value: 10250 },
  { timestamp: '2024-01-04', value: 10180 },
  { timestamp: '2024-01-05', value: 10350 },
  { timestamp: '2024-01-06', value: 10420 },
  { timestamp: '2024-01-07', value: 10380 },
  { timestamp: '2024-01-08', value: 10550 },
  { timestamp: '2024-01-09', value: 10650 },
  { timestamp: '2024-01-10', value: 10720 },
  { timestamp: '2024-01-11', value: 10580 },
  { timestamp: '2024-01-12', value: 10750 },
  { timestamp: '2024-01-13', value: 10890 },
  { timestamp: '2024-01-14', value: 11050 },
  { timestamp: '2024-01-15', value: 11234 },
]

interface SymbolPerformance {
  symbol: string
  trades: number
  winRate: number
  totalPnl: number
  avgReturn: number
}

const mockSymbolPerformance: SymbolPerformance[] = [
  { symbol: 'BTC/USDT', trades: 12, winRate: 75, totalPnl: 856.50, avgReturn: 2.8 },
  { symbol: 'ETH/USDT', trades: 10, winRate: 70, totalPnl: 425.20, avgReturn: 2.1 },
  { symbol: 'NVDA', trades: 8, winRate: 87.5, totalPnl: 612.80, avgReturn: 3.2 },
  { symbol: 'SOL/USDT', trades: 6, winRate: 66.7, totalPnl: 234.50, avgReturn: 1.9 },
  { symbol: 'TSLA', trades: 5, winRate: 40, totalPnl: -128.30, avgReturn: -1.2 },
  { symbol: 'AAPL', trades: 4, winRate: 75, totalPnl: 156.20, avgReturn: 1.5 },
]

type TimePeriod = '1D' | '1W' | '1M' | '3M' | 'ALL'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<TimePeriod>('1W')

  // Mock stats
  const totalReturn = 12.34
  const winRate = 68
  const avgWin = 156.50
  const avgLoss = 82.30
  const profitFactor = avgWin / avgLoss
  const sharpeRatio = 1.85
  const maxDrawdown = 4.2
  const totalTrades = 48

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm">
            Performance metrics and trading statistics
          </p>
        </div>
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
          {(['1D', '1W', '1M', '3M', 'ALL'] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                period === p
                  ? 'text-gray-900 dark:text-white bg-white dark:bg-slate-700 shadow-sm'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Total Return</p>
              <p className={cn(
                'text-2xl font-bold mt-1',
                totalReturn >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              )}>
                {formatPercent(totalReturn)}
              </p>
            </div>
            <div className={cn(
              'p-2 rounded-lg',
              totalReturn >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'
            )}>
              {totalReturn >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">
                {winRate}%
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
              <Target className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Profit Factor</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">
                {profitFactor.toFixed(2)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Sharpe Ratio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">
                {sharpeRatio.toFixed(2)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioChart data={mockPerformanceData} />
          </CardContent>
        </Card>

        {/* Win/Loss Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Win/Loss Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              {/* Donut Chart Placeholder */}
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    stroke="currentColor"
                    strokeWidth="20"
                    fill="none"
                    className="text-rose-200 dark:text-rose-900/50"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    stroke="currentColor"
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray={`${winRate * 3.77} ${100 * 3.77}`}
                    className="text-emerald-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{winRate}%</p>
                    <p className="text-sm text-gray-500">Win Rate</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-600 dark:text-slate-400">Wins (32)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="text-sm text-gray-600 dark:text-slate-400">Losses (16)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">Avg Win</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(avgWin)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">Avg Loss</span>
                <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
                  -{formatCurrency(avgLoss)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">Max Drawdown</span>
                <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
                  -{maxDrawdown}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Symbol */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Symbol</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Trades
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Win Rate
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Total P&L
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Avg Return
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {mockSymbolPerformance.map((perf) => (
                <tr key={perf.symbol} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-slate-100">
                    {perf.symbol}
                  </td>
                  <td className="px-4 py-4 text-sm text-center text-gray-600 dark:text-slate-400">
                    {perf.trades}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={cn(
                      'font-medium',
                      perf.winRate >= 60 ? 'text-emerald-600 dark:text-emerald-400' :
                      perf.winRate >= 50 ? 'text-amber-600 dark:text-amber-400' :
                      'text-rose-600 dark:text-rose-400'
                    )}>
                      {perf.winRate}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-right">
                    <span className={cn(
                      'font-mono font-medium',
                      perf.totalPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    )}>
                      {perf.totalPnl >= 0 ? '+' : ''}{formatCurrency(perf.totalPnl)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-right">
                    <span className={cn(
                      'font-mono',
                      perf.avgReturn >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    )}>
                      {formatPercent(perf.avgReturn)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            perf.totalPnl >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                          )}
                          style={{
                            width: `${Math.min(Math.abs(perf.totalPnl) / 10, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
