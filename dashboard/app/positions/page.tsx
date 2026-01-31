'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { Wallet, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'

interface Position {
  symbol: string
  type: 'crypto' | 'stock'
  quantity: number
  entryPrice: number
  currentPrice: number
  value: number
  pnl: number
  pnlPct: number
  allocation: number
}

const mockPositions: Position[] = [
  { symbol: 'BTC/USDT', type: 'crypto', quantity: 0.15, entryPrice: 42000, currentPrice: 43250, value: 6487.50, pnl: 187.50, pnlPct: 2.98, allocation: 35.2 },
  { symbol: 'ETH/USDT', type: 'crypto', quantity: 2.5, entryPrice: 2200, currentPrice: 2280, value: 5700, pnl: 200, pnlPct: 3.64, allocation: 30.9 },
  { symbol: 'NVDA', type: 'stock', quantity: 8, entryPrice: 480, currentPrice: 495.22, value: 3961.76, pnl: 121.76, pnlPct: 3.17, allocation: 21.5 },
  { symbol: 'SOL/USDT', type: 'crypto', quantity: 12, entryPrice: 92, currentPrice: 98.42, value: 1181.04, pnl: 77.04, pnlPct: 6.98, allocation: 6.4 },
  { symbol: 'AAPL', type: 'stock', quantity: 6, entryPrice: 182, currentPrice: 185.92, value: 1115.52, pnl: 23.52, pnlPct: 2.15, allocation: 6.0 },
]

export default function PositionsPage() {
  const totalValue = mockPositions.reduce((acc, p) => acc + p.value, 0)
  const totalPnl = mockPositions.reduce((acc, p) => acc + p.pnl, 0)
  const totalPnlPct = (totalPnl / (totalValue - totalPnl)) * 100

  const cryptoValue = mockPositions.filter(p => p.type === 'crypto').reduce((acc, p) => acc + p.value, 0)
  const stockValue = mockPositions.filter(p => p.type === 'stock').reduce((acc, p) => acc + p.value, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          Positions
        </h1>
        <p className="text-gray-600 dark:text-slate-400 text-sm">
          Current holdings and portfolio allocation
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-[#1a73e8]">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Unrealized P&L</p>
              <p className={cn(
                'text-2xl font-bold mt-1',
                totalPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              )}>
                {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
              </p>
              <p className={cn(
                'text-sm',
                totalPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              )}>
                {formatPercent(totalPnlPct)}
              </p>
            </div>
            <div className={cn(
              'p-2 rounded-lg',
              totalPnl >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'
            )}>
              {totalPnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Crypto Holdings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">
                {formatCurrency(cryptoValue)}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-500">
                {((cryptoValue / totalValue) * 100).toFixed(1)}% of portfolio
              </p>
            </div>
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Stock Holdings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">
                {formatCurrency(stockValue)}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-500">
                {((stockValue / totalValue) * 100).toFixed(1)}% of portfolio
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Entry Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Allocation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {mockPositions.map((position) => (
                <tr key={position.symbol} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                        position.type === 'crypto' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                      )}>
                        {position.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-slate-100">{position.symbol}</p>
                        <Badge variant={position.type === 'crypto' ? 'warning' : 'info'}>
                          {position.type}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-gray-900 dark:text-slate-100">
                    {position.quantity}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-gray-600 dark:text-slate-400">
                    {formatCurrency(position.entryPrice)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-gray-900 dark:text-slate-100">
                    {formatCurrency(position.currentPrice)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono font-medium text-gray-900 dark:text-slate-100">
                    {formatCurrency(position.value)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className={cn(
                      'font-mono',
                      position.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    )}>
                      <p>{position.pnl >= 0 ? '+' : ''}{formatCurrency(position.pnl)}</p>
                      <p className="text-xs">{formatPercent(position.pnlPct)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1a73e8] rounded-full"
                          style={{ width: `${position.allocation}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-slate-400 w-12 text-right">
                        {position.allocation.toFixed(1)}%
                      </span>
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
