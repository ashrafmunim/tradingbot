'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { StockChart } from '@/components/StockChart'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Filter,
  Star,
  BarChart3,
  Activity,
  DollarSign,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Shield,
  Building2,
  Clock,
} from 'lucide-react'

interface StockQuote {
  price: number
  prevClose: number
  change: number
  currency: string
  marketState: string
  volume: number
  dayHigh: number
  dayLow: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
}

interface Stock {
  symbol: string
  name: string
  sector: string
  quote: StockQuote | null
}

function useBursa(sector: string, interval = 60000) {
  const [data, setData] = useState<{ stocks: Stock[]; sectors: string[]; total: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/bursa?sector=${sector}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
      setError(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [sector])

  useEffect(() => {
    setLoading(true)
    fetchData()
    const id = setInterval(fetchData, interval)
    return () => clearInterval(id)
  }, [fetchData, interval])

  return { data, loading, error, refetch: fetchData }
}

function PriceDisplay({ quote }: { quote: StockQuote | null }) {
  if (!quote || !quote.price) {
    return <span className="text-sm text-gray-400">--</span>
  }

  return (
    <div className="text-right">
      <p className="text-base font-bold font-mono text-gray-900 dark:text-slate-100">
        RM {quote.price.toFixed(2)}
      </p>
      <p className={cn(
        'text-sm font-mono font-medium flex items-center justify-end gap-1',
        quote.change > 0 ? 'text-emerald-500' : quote.change < 0 ? 'text-rose-500' : 'text-gray-400'
      )}>
        {quote.change > 0 ? <ArrowUp className="w-3 h-3" /> : quote.change < 0 ? <ArrowDown className="w-3 h-3" /> : null}
        {quote.change > 0 ? '+' : ''}{quote.change.toFixed(2)}%
      </p>
    </div>
  )
}

function StockRow({ stock, expanded, onToggle }: { stock: Stock; expanded: boolean; onToggle: () => void }) {
  const q = stock.quote

  return (
    <div className={cn(
      'border-b border-gray-100 dark:border-slate-700/50 transition-colors',
      expanded && 'bg-gray-50/50 dark:bg-slate-800/30'
    )}>
      <div
        onClick={onToggle}
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        {/* Shariah badge */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center" title="Shariah Compliant">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>

        {/* Stock Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-gray-900 dark:text-slate-100">{stock.name}</span>
            <span className="text-xs font-mono text-gray-400 dark:text-slate-500">{stock.symbol.replace('.KL', '')}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{stock.sector}</span>
            {q?.marketState === 'REGULAR' && (
              <span className="text-xs text-emerald-500 flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
                Live
              </span>
            )}
          </div>
        </div>

        {/* Volume */}
        <div className="hidden md:block text-right">
          <p className="text-xs text-gray-400 dark:text-slate-500">Volume</p>
          <p className="text-sm font-mono text-gray-600 dark:text-slate-300">
            {q?.volume ? (q.volume >= 1e6 ? `${(q.volume / 1e6).toFixed(1)}M` : `${(q.volume / 1e3).toFixed(0)}K`) : '--'}
          </p>
        </div>

        {/* Price */}
        <PriceDisplay quote={q} />

        {/* Expand */}
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>

      {/* Expanded Details */}
      {expanded && q && (
        <div className="px-5 pb-4 space-y-3">
          {/* Performance Chart */}
          <div className="rounded-lg bg-slate-900/30 dark:bg-slate-900/50 p-3 border border-gray-200 dark:border-slate-700">
            <StockChart symbol={stock.symbol} sector={stock.sector} stockName={stock.name} height={220} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <span className="text-xs text-gray-400 dark:text-slate-500">Day Range</span>
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-1">
                RM {q.dayLow.toFixed(2)} - {q.dayHigh.toFixed(2)}
              </p>
              {q.dayHigh > 0 && q.dayLow > 0 && (
                <div className="mt-1.5 h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden relative">
                  <div
                    className="absolute h-full bg-[#1a73e8] rounded-full"
                    style={{
                      left: `${((q.price - q.dayLow) / (q.dayHigh - q.dayLow)) * 100 - 2}%`,
                      width: '4%',
                      minWidth: '4px',
                    }}
                  />
                </div>
              )}
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <span className="text-xs text-gray-400 dark:text-slate-500">52-Week Range</span>
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-1">
                RM {q.fiftyTwoWeekLow.toFixed(2)} - {q.fiftyTwoWeekHigh.toFixed(2)}
              </p>
              {q.fiftyTwoWeekHigh > 0 && q.fiftyTwoWeekLow > 0 && (
                <div className="mt-1.5 h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden relative">
                  <div
                    className="absolute h-full bg-purple-500 rounded-full"
                    style={{
                      left: `${((q.price - q.fiftyTwoWeekLow) / (q.fiftyTwoWeekHigh - q.fiftyTwoWeekLow)) * 100 - 2}%`,
                      width: '4%',
                      minWidth: '4px',
                    }}
                  />
                </div>
              )}
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <span className="text-xs text-gray-400 dark:text-slate-500">Previous Close</span>
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-1">
                RM {q.prevClose.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <span className="text-xs text-gray-400 dark:text-slate-500">Volume</span>
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-1">
                {q.volume >= 1e6 ? `${(q.volume / 1e6).toFixed(2)}M` : `${(q.volume / 1e3).toFixed(0)}K`}
              </p>
            </div>
          </div>

          {/* Shariah Status */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Shariah Compliant — Approved by Securities Commission Malaysia
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BursaPage() {
  const [sector, setSector] = useState('all')
  const { data, loading, error, refetch } = useBursa(sector, 60000)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'change' | 'volume' | 'price' | 'dayRange'>('change')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [pricePreset, setPricePreset] = useState('all')

  const handleRefresh = () => {
    setIsRefreshing(true)
    refetch()
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const stocks = data?.stocks || []

  // Price filter
  const priceFiltered = stocks.filter(s => {
    const p = s.quote?.price || 0
    if (p === 0) return true
    const min = priceMin ? parseFloat(priceMin) : 0
    const max = priceMax ? parseFloat(priceMax) : Infinity
    return p >= min && p <= max
  })

  // Sort
  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(col)
      setSortDir(col === 'name' ? 'asc' : 'desc')
    }
  }

  const sorted = [...priceFiltered].sort((a, b) => {
    let cmp = 0
    if (sortBy === 'change') cmp = (a.quote?.change || 0) - (b.quote?.change || 0)
    else if (sortBy === 'volume') cmp = (a.quote?.volume || 0) - (b.quote?.volume || 0)
    else if (sortBy === 'price') cmp = (a.quote?.price || 0) - (b.quote?.price || 0)
    else if (sortBy === 'dayRange') {
      const aRange = a.quote ? ((a.quote.price - a.quote.dayLow) / (a.quote.dayHigh - a.quote.dayLow || 1)) : 0
      const bRange = b.quote ? ((b.quote.price - b.quote.dayLow) / (b.quote.dayHigh - b.quote.dayLow || 1)) : 0
      cmp = aRange - bRange
    }
    else cmp = a.name.localeCompare(b.name) * (sortDir === 'desc' ? -1 : 1)
    return sortDir === 'desc' ? -cmp : cmp
  })

  const handlePricePreset = (preset: string) => {
    setPricePreset(preset)
    switch (preset) {
      case 'all': setPriceMin(''); setPriceMax(''); break
      case 'penny': setPriceMin(''); setPriceMax('1'); break
      case 'low': setPriceMin('1'); setPriceMax('5'); break
      case 'mid': setPriceMin('5'); setPriceMax('20'); break
      case 'high': setPriceMin('20'); setPriceMax(''); break
    }
  }

  // Top performers
  const topPerformers = [...stocks]
    .filter(s => s.quote && s.quote.change > 0)
    .sort((a, b) => (b.quote?.change || 0) - (a.quote?.change || 0))
    .slice(0, 5)

  const worstPerformers = [...stocks]
    .filter(s => s.quote && s.quote.change < 0)
    .sort((a, b) => (a.quote?.change || 0) - (b.quote?.change || 0))
    .slice(0, 5)

  // Stats
  const gainers = stocks.filter(s => s.quote && s.quote.change > 0).length
  const losers = stocks.filter(s => s.quote && s.quote.change < 0).length
  const unchanged = stocks.filter(s => s.quote && s.quote.change === 0).length
  const avgChange = stocks.length > 0
    ? stocks.reduce((a, s) => a + (s.quote?.change || 0), 0) / stocks.length
    : 0

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#1a73e8]" />
            Bursa Malaysia
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-base mt-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            Shariah-Compliant Stocks
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="p-5">
            <div className="text-xs text-gray-400 dark:text-slate-500 mb-1">Total Stocks</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{data.total}</p>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-emerald-500 mb-1">Gainers</div>
            <p className="text-3xl font-bold text-emerald-500">{gainers}</p>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-rose-500 mb-1">Losers</div>
            <p className="text-3xl font-bold text-rose-500">{losers}</p>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-gray-400 dark:text-slate-500 mb-1">Unchanged</div>
            <p className="text-3xl font-bold text-gray-400">{unchanged}</p>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-gray-400 dark:text-slate-500 mb-1">Avg Change</div>
            <p className={cn('text-3xl font-bold', avgChange > 0 ? 'text-emerald-500' : avgChange < 0 ? 'text-rose-500' : 'text-gray-400')}>
              {avgChange > 0 ? '+' : ''}{avgChange.toFixed(2)}%
            </p>
          </Card>
        </div>
      )}

      {/* Top Performers */}
      {data && (topPerformers.length > 0 || worstPerformers.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Top Gainers */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="text-base font-bold text-gray-900 dark:text-slate-100">Top Performing Shariah Stocks</span>
            </div>
            {topPerformers.length > 0 ? (
              <div className="space-y-3">
                {topPerformers.map((s, i) => (
                  <div key={s.symbol} className="flex items-center gap-3">
                    <span className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold',
                      i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      i === 1 ? 'bg-gray-200 text-gray-600 dark:bg-slate-600 dark:text-slate-300' :
                      i === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500'
                    )}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-slate-100">{s.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{s.sector}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-gray-900 dark:text-slate-100">RM {s.quote?.price.toFixed(2)}</span>
                      <span className="text-sm font-bold font-mono text-emerald-500 ml-2">+{s.quote?.change.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No gainers today</p>
            )}
          </Card>

          {/* Worst Performers */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-rose-500" />
              <span className="text-base font-bold text-gray-900 dark:text-slate-100">Worst Performing Today</span>
            </div>
            {worstPerformers.length > 0 ? (
              <div className="space-y-3">
                {worstPerformers.map((s, i) => (
                  <div key={s.symbol} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-slate-100">{s.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{s.sector}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-gray-900 dark:text-slate-100">RM {s.quote?.price.toFixed(2)}</span>
                      <span className="text-sm font-bold font-mono text-rose-500 ml-2">{s.quote?.change.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No losers today</p>
            )}
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Row 1: Sector filter */}
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex flex-wrap gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => { setSector('all'); setExpandedIdx(null) }}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                sector === 'all'
                  ? 'text-gray-900 dark:text-white bg-white dark:bg-slate-700 shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              All
            </button>
            {(data?.sectors || []).map(s => (
              <button
                key={s}
                onClick={() => { setSector(s); setExpandedIdx(null) }}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  sector === s
                    ? 'text-gray-900 dark:text-white bg-white dark:bg-slate-700 shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Price range */}
        <div className="flex flex-wrap items-center gap-4">
          <DollarSign className="w-5 h-5 text-gray-400" />

          {/* Presets */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
            {[
              { key: 'all', label: 'All Prices' },
              { key: 'penny', label: 'Under RM1' },
              { key: 'low', label: 'RM1-5' },
              { key: 'mid', label: 'RM5-20' },
              { key: 'high', label: 'RM20+' },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => handlePricePreset(p.key)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  pricePreset === p.key
                    ? 'text-gray-900 dark:text-white bg-white dark:bg-slate-700 shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">or</span>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => { setPriceMin(e.target.value); setPricePreset('') }}
              placeholder="Min RM"
              className="w-24 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => { setPriceMax(e.target.value); setPricePreset('') }}
              placeholder="Max RM"
              className="w-24 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            />
          </div>

          <span className="text-sm text-gray-400 dark:text-slate-500">
            {priceFiltered.length} of {stocks.length} stocks
          </span>
        </div>
      </div>

      {/* Loading */}
      {loading && !data && (
        <Card className="p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-slate-400 text-sm">Loading Bursa Malaysia data...</p>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-4 mb-4 border-rose-300 dark:border-rose-700">
          <p className="text-rose-500 text-sm">Error: {error}</p>
        </Card>
      )}

      {/* Stock List */}
      {sorted.length > 0 && (
        <Card className="overflow-hidden">
          {/* Sortable Header */}
          <div className="flex items-center gap-4 px-5 py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700 text-xs font-medium uppercase tracking-wider">
            <div className="w-8" />
            <button onClick={() => toggleSort('name')} className={cn('flex-1 text-left flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-300 transition-colors', sortBy === 'name' ? 'text-gray-700 dark:text-slate-300' : 'text-gray-400 dark:text-slate-500')}>
              Stock
              {sortBy === 'name' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
            </button>
            <button onClick={() => toggleSort('volume')} className={cn('hidden md:flex w-24 items-center justify-end gap-1 hover:text-gray-700 dark:hover:text-slate-300 transition-colors', sortBy === 'volume' ? 'text-gray-700 dark:text-slate-300' : 'text-gray-400 dark:text-slate-500')}>
              Volume
              {sortBy === 'volume' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
            </button>
            <button onClick={() => toggleSort('price')} className={cn('w-20 flex items-center justify-end gap-1 hover:text-gray-700 dark:hover:text-slate-300 transition-colors', sortBy === 'price' ? 'text-gray-700 dark:text-slate-300' : 'text-gray-400 dark:text-slate-500')}>
              Price
              {sortBy === 'price' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
            </button>
            <button onClick={() => toggleSort('change')} className={cn('w-20 flex items-center justify-end gap-1 hover:text-gray-700 dark:hover:text-slate-300 transition-colors', sortBy === 'change' ? 'text-gray-700 dark:text-slate-300' : 'text-gray-400 dark:text-slate-500')}>
              Change
              {sortBy === 'change' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
            </button>
            <div className="w-4" />
          </div>

          {sorted.map((stock, i) => (
            <StockRow
              key={stock.symbol}
              stock={stock}
              expanded={expandedIdx === i}
              onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
            />
          ))}
        </Card>
      )}

      {data && sorted.length === 0 && (
        <Card className="p-8">
          <p className="text-center text-gray-400 dark:text-slate-500">No stocks match the selected filter</p>
        </Card>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-4">
        Data from Yahoo Finance. Shariah status based on Securities Commission Malaysia latest approved list.
        <br />Refreshes every 60 seconds. Not financial advice.
      </p>
    </div>
  )
}
