'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { cn } from '@/lib/utils'
import {
  RefreshCw,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Droplets,
  BarChart3,
  ExternalLink,
  Activity,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Rocket,
  Skull,
  Trash2,
} from 'lucide-react'
import { getTrackedTokens, removeTrackedToken } from '@/lib/tracked-tokens'

const DIRECTION_ICONS: Record<string, any> = {
  'rocket': Rocket,
  'trending-up': TrendingUp,
  'minus': Minus,
  'trending-down': TrendingDown,
  'skull': Skull,
}

const SIGNAL_ICONS: Record<string, any> = {
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'alert-triangle': AlertTriangle,
}


interface PricePoint { time: string; price: number }
interface VolPoint { time: string; buys: number; sells: number }
interface TokenState {
  data: any | null
  priceHistory: PricePoint[]
  volumeHistory: VolPoint[]
  priceDirection: 'up' | 'down' | 'same'
  prevPrice: number | null
}

const emptyState: TokenState = { data: null, priceHistory: [], volumeHistory: [], priceDirection: 'same', prevPrice: null }

function useMultiLiveData(addresses: string[], interval = 15000) {
  const [tokens, setTokens] = useState<Record<string, TokenState>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sync state when addresses change
  useEffect(() => {
    setTokens(prev => {
      const next: Record<string, TokenState> = {}
      addresses.forEach(a => {
        next[a] = prev[a] || { ...emptyState }
      })
      return next
    })
  }, [addresses.join(',')])

  const fetchAll = useCallback(async () => {
    if (addresses.length === 0) { setLoading(false); return }
    try {
      const results = await Promise.all(
        addresses.map(async (addr) => {
          const res = await fetch(`/api/memecoin?address=${addr}`)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        })
      )

      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

      setTokens(prev => {
        const next = { ...prev }
        addresses.forEach((addr, i) => {
          const d = results[i]
          if (d.error) return

          const price = d.token.priceUsd
          const prevState = prev[addr] || { ...emptyState }
          let direction: 'up' | 'down' | 'same' = 'same'
          if (prevState.prevPrice !== null) {
            if (price > prevState.prevPrice) direction = 'up'
            else if (price < prevState.prevPrice) direction = 'down'
          }

          next[addr] = {
            data: d,
            priceHistory: [...prevState.priceHistory, { time: timeStr, price }].slice(-120),
            volumeHistory: [...prevState.volumeHistory, {
              time: timeStr,
              buys: d.transactions.m5.buys,
              sells: d.transactions.m5.sells,
            }].slice(-40),
            priceDirection: direction,
            prevPrice: price,
          }
        })
        return next
      })
      setError(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [addresses])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, interval)
    return () => clearInterval(id)
  }, [fetchAll, interval])

  return { tokens, loading, error, refetch: fetchAll }
}

// --- Sub-components ---

function SignalBadge({ signal }: { signal: any }) {
  if (!signal) return null

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700',
    amber: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700',
    rose: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-700',
  }

  const SIcon = SIGNAL_ICONS[signal.icon] || AlertTriangle

  return (
    <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-lg font-bold', colorMap[signal.color] || colorMap.amber)}>
      <SIcon className="w-5 h-5" />
      <span>{signal.action}</span>
      <span className="text-sm font-normal opacity-70">({signal.score}/100)</span>
    </div>
  )
}

function SignalCard({ signal }: { signal: any }) {
  if (!signal) return null

  const IconComp = SIGNAL_ICONS[signal.icon] || AlertTriangle

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IconComp className={cn(
            'w-5 h-5',
            signal.color === 'emerald' ? 'text-emerald-500' :
            signal.color === 'rose' ? 'text-rose-500' : 'text-amber-500'
          )} />
          <span className="font-semibold text-gray-900 dark:text-slate-100">Signal</span>
        </div>
        <SignalBadge signal={signal} />
      </div>

      {/* Signal strength bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
          <span>Strong Sell</span>
          <span>Strong Buy</span>
        </div>
        <div className="h-3 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 relative overflow-hidden">
          <div
            className="absolute top-0 bottom-0 w-1 bg-white dark:bg-slate-900 shadow-lg rounded-full transition-all"
            style={{ left: `calc(${signal.score}% - 2px)` }}
          />
        </div>
      </div>

      {/* Liquidity risk */}
      {signal.liquidityRisk !== 'low' && (
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg mb-3 text-sm',
          signal.liquidityRisk === 'critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400' :
          signal.liquidityRisk === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
          'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
        )}>
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>
            {signal.liquidityRisk === 'critical' ? 'Extremely low liquidity — high slippage risk' :
             signal.liquidityRisk === 'high' ? 'Low liquidity — be cautious with position size' :
             'Moderate liquidity — watch for slippage'}
          </span>
        </div>
      )}

      {/* Reasoning */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Why:</p>
        {signal.reasoning.map((r: string, i: number) => (
          <div key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-slate-300">
            <span className="mt-0.5 text-gray-400">•</span>
            <span>{r}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function LivePriceDisplay({ price, direction }: { price: number; direction: 'up' | 'down' | 'same' }) {
  const [flash, setFlash] = useState(false)
  useEffect(() => { setFlash(true); const t = setTimeout(() => setFlash(false), 600); return () => clearTimeout(t) }, [price])

  const formatted = price < 0.01 ? price.toExponential(4) : price.toFixed(6)

  return (
    <div className={cn(
      'flex items-center gap-3 transition-colors duration-300 rounded-xl px-4 py-3',
      flash && direction === 'up' && 'bg-emerald-500/10',
      flash && direction === 'down' && 'bg-rose-500/10',
    )}>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className={cn(
          'text-3xl font-bold font-mono transition-colors',
          direction === 'up' ? 'text-emerald-500' :
          direction === 'down' ? 'text-rose-500' :
          'text-gray-900 dark:text-slate-100'
        )}>
          ${formatted}
        </span>
        {direction === 'up' && <ArrowUp className="w-5 h-5 text-emerald-500 animate-bounce" />}
        {direction === 'down' && <ArrowDown className="w-5 h-5 text-rose-500 animate-bounce" />}
      </div>
    </div>
  )
}

function LivePriceChart({ data }: { data: PricePoint[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted || data.length < 2) {
    return <div className="flex items-center justify-center h-[200px] text-gray-400 dark:text-slate-500 text-sm">
      {data.length < 2 ? 'Collecting data points...' : 'Loading...'}
    </div>
  }

  const isUp = data[data.length - 1].price >= data[0].price
  const color = isUp ? '#10b981' : '#ef4444'
  const prices = data.map(d => d.price)
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  const pad = (maxP - minP) * 0.1 || minP * 0.001

  const fmt = (v: number) => v < 0.001 ? v.toExponential(2) : v < 1 ? v.toFixed(6) : v.toFixed(4)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={60} />
        <YAxis domain={[minP - pad, maxP + pad]} tickFormatter={fmt} tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} width={65} />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} labelStyle={{ color: '#94a3b8' }} formatter={(v: number) => [`$${fmt(v)}`, 'Price']} />
        <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#grad-${color})`} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function LiveVolumeChart({ data }: { data: VolPoint[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted || data.length < 2) return null

  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 8 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={80} />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} labelStyle={{ color: '#94a3b8' }} />
        <Bar dataKey="buys" stackId="a" fill="#10b981" isAnimationActive={false} />
        <Bar dataKey="sells" stackId="a" fill="#ef4444" isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function TrendGauge({ score }: { score: number }) {
  const needleRotation = (score / 100) * 90
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-24 overflow-hidden">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" /><stop offset="25%" stopColor="#f97316" /><stop offset="50%" stopColor="#eab308" /><stop offset="75%" stopColor="#22c55e" /><stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="16" className="dark:stroke-slate-700" />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="16" strokeLinecap="round" />
          <g transform={`rotate(${needleRotation}, 100, 100)`}>
            <line x1="100" y1="100" x2="100" y2="30" stroke="currentColor" strokeWidth="3" className="text-gray-800 dark:text-slate-200" />
            <circle cx="100" cy="100" r="5" fill="currentColor" className="text-gray-800 dark:text-slate-200" />
          </g>
          <text x="10" y="108" fontSize="10" fill="#94a3b8" textAnchor="start">Bearish</text>
          <text x="190" y="108" fontSize="10" fill="#94a3b8" textAnchor="end">Bullish</text>
        </svg>
      </div>
      <div className="text-2xl font-bold">
        <span className={cn(score >= 15 ? 'text-emerald-500' : score <= -15 ? 'text-rose-500' : 'text-amber-500')}>
          {score > 0 ? '+' : ''}{score}
        </span>
      </div>
    </div>
  )
}

function ChangeTag({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50 dark:bg-slate-800/50">
      <span className="text-[10px] text-gray-500 dark:text-slate-400 mb-0.5">{label}</span>
      <span className={cn(
        'text-xs font-semibold',
        value > 0 ? 'text-emerald-600 dark:text-emerald-400' :
        value < 0 ? 'text-rose-600 dark:text-rose-400' :
        'text-gray-600 dark:text-slate-400'
      )}>
        {value > 0 ? '+' : ''}{value.toFixed(2)}%
      </span>
    </div>
  )
}

function BuySellBar({ buys, sells, label }: { buys: number; sells: number; label: string }) {
  const total = buys + sells
  const buyPct = total > 0 ? (buys / total) * 100 : 50
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-gray-500 dark:text-slate-400">{label}</span>
        <span className="text-gray-500 dark:text-slate-400">{total} txns</span>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700">
        <div className="bg-emerald-500 transition-all" style={{ width: `${buyPct}%` }} />
        <div className="bg-rose-500 transition-all" style={{ width: `${100 - buyPct}%` }} />
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-emerald-600 dark:text-emerald-400">{buys} buys ({buyPct.toFixed(0)}%)</span>
        <span className="text-rose-600 dark:text-rose-400">{sells} sells ({(100 - buyPct).toFixed(0)}%)</span>
      </div>
    </div>
  )
}

// --- Token Card (one per tracked token) ---

function TokenTracker({ state, address }: { state: TokenState | undefined; address: string }) {
  if (!state || !state.data) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-4" />
        <div className="h-40 bg-gray-200 dark:bg-slate-700 rounded" />
      </Card>
    )
  }

  const { token, priceChanges, volume, transactions, analysis, signal } = state.data

  return (
    <div className="space-y-4">
      {/* Header + Live Price */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{token.symbol}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Solana</span>
            </div>
            <p className="text-gray-500 dark:text-slate-400 text-xs">{token.name}</p>
            <p className="text-gray-400 dark:text-slate-500 text-[10px] font-mono">{address.slice(0, 6)}...{address.slice(-6)}</p>
          </div>
          <div className="flex items-center gap-2">
            {token.url && (
              <a href={token.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-[#1a73e8]">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
        <LivePriceDisplay price={token.priceUsd} direction={state.priceDirection} />
      </Card>

      {/* Buy/Sell Signal */}
      <SignalCard signal={signal} />

      {/* Live Chart */}
      <Card>
        <CardHeader className="py-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            Live Price
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </CardTitle>
          <span className="text-[10px] text-gray-400 dark:text-slate-500">{state.priceHistory.length} pts</span>
        </CardHeader>
        <CardContent>
          <LivePriceChart data={state.priceHistory} />
        </CardContent>
      </Card>

      {/* Volume Chart */}
      {state.volumeHistory.length >= 2 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Buy/Sell Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <LiveVolumeChart data={state.volumeHistory} />
            <div className="flex items-center justify-center gap-4 mt-1 text-[10px]">
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-emerald-500" /><span className="text-gray-400">Buys</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-rose-500" /><span className="text-gray-400">Sells</span></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <div className="text-[10px] text-gray-500 dark:text-slate-400 mb-0.5 flex items-center gap-1"><DollarSign className="w-3 h-3" />MCap</div>
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
            ${token.marketCap >= 1e6 ? `${(token.marketCap / 1e6).toFixed(2)}M` : `${(token.marketCap / 1e3).toFixed(1)}K`}
          </p>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] text-gray-500 dark:text-slate-400 mb-0.5 flex items-center gap-1"><Droplets className="w-3 h-3" />Liquidity</div>
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
            ${token.liquidity >= 1e6 ? `${(token.liquidity / 1e6).toFixed(2)}M` : `${(token.liquidity / 1e3).toFixed(1)}K`}
          </p>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] text-gray-500 dark:text-slate-400 mb-0.5 flex items-center gap-1"><Activity className="w-3 h-3" />24h Vol</div>
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
            ${volume.h24 >= 1e6 ? `${(volume.h24 / 1e6).toFixed(2)}M` : `${(volume.h24 / 1e3).toFixed(1)}K`}
          </p>
        </Card>
        <Card className="p-3">
          <div className="text-[10px] text-gray-500 dark:text-slate-400 mb-0.5 flex items-center gap-1"><BarChart3 className="w-3 h-3" />Vol/MCap</div>
          <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
            {token.marketCap > 0 ? `${((volume.h24 / token.marketCap) * 100).toFixed(1)}%` : '—'}
          </p>
        </Card>
      </div>

      {/* Trend + Price Changes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-2 flex items-center gap-2">
            Trend
            {(() => { const DIcon = DIRECTION_ICONS[analysis.directionIcon]; return DIcon ? <DIcon className={cn('w-5 h-5', analysis.trendScore >= 15 ? 'text-emerald-500' : analysis.trendScore <= -15 ? 'text-rose-500' : 'text-amber-500')} /> : null })()}
          </p>
          <TrendGauge score={analysis.trendScore} />
          <p className={cn(
            'text-center text-sm font-semibold mt-1',
            analysis.trendScore >= 15 ? 'text-emerald-500' : analysis.trendScore <= -15 ? 'text-rose-500' : 'text-amber-500'
          )}>
            {analysis.direction}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-2">Price Changes</p>
          <div className="grid grid-cols-4 gap-1.5">
            <ChangeTag value={priceChanges.m5} label="5m" />
            <ChangeTag value={priceChanges.h1} label="1h" />
            <ChangeTag value={priceChanges.h6} label="6h" />
            <ChangeTag value={priceChanges.h24} label="24h" />
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-slate-400">Momentum</span>
              <span className={cn('font-semibold', analysis.weightedMomentum > 0 ? 'text-emerald-500' : analysis.weightedMomentum < 0 ? 'text-rose-500' : 'text-gray-500')}>
                {analysis.weightedMomentum > 0 ? '+' : ''}{analysis.weightedMomentum}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-slate-400">Vol vs Avg</span>
              <span className={cn('font-semibold', analysis.volumeTrend > 1.5 ? 'text-emerald-500' : analysis.volumeTrend < 0.5 ? 'text-rose-500' : 'text-gray-500 dark:text-slate-400')}>
                {analysis.volumeTrend}x
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Buy/Sell Pressure */}
      <Card className="p-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3">Buy/Sell Pressure</p>
        <div className="space-y-3">
          <BuySellBar buys={transactions.m5.buys} sells={transactions.m5.sells} label="5 min" />
          <BuySellBar buys={transactions.h1.buys} sells={transactions.h1.sells} label="1 hour" />
          <BuySellBar buys={transactions.h6.buys} sells={transactions.h6.sells} label="6 hours" />
          <BuySellBar buys={transactions.h24.buys} sells={transactions.h24.sells} label="24 hours" />
        </div>
      </Card>
    </div>
  )
}

// --- Main Page ---

export default function MemecoinPage() {
  const [trackedAddresses, setTrackedAddresses] = useState<string[]>([])
  const { tokens, loading, error, refetch } = useMultiLiveData(trackedAddresses, 15000)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load tracked tokens from localStorage
  useEffect(() => {
    setTrackedAddresses(getTrackedTokens())

    const handleChange = () => setTrackedAddresses(getTrackedTokens())
    window.addEventListener('tracked-tokens-changed', handleChange)
    window.addEventListener('storage', handleChange)
    return () => {
      window.removeEventListener('tracked-tokens-changed', handleChange)
      window.removeEventListener('storage', handleChange)
    }
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    refetch()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleRemove = (address: string) => {
    removeTrackedToken(address)
    setTrackedAddresses(getTrackedTokens())
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Memecoin Tracker</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Tracking {trackedAddresses.length} token{trackedAddresses.length !== 1 ? 's' : ''} with live buy/sell signals
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <Card className="p-4 mb-6 border-rose-300 dark:border-rose-700">
          <p className="text-rose-500 text-sm">Error fetching data: {error}</p>
        </Card>
      )}

      {trackedAddresses.length === 0 && (
        <Card className="p-8">
          <p className="text-center text-gray-400 dark:text-slate-500 text-sm">
            No tokens tracked yet. Go to <a href="/scout" className="text-[#1a73e8] hover:underline">Scout</a> to find and track tokens.
          </p>
        </Card>
      )}

      {/* Token grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trackedAddresses.map((addr) => (
          <div key={addr} className="relative group">
            <button
              onClick={() => handleRemove(addr)}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-400 hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 opacity-0 group-hover:opacity-100 transition-all"
              title="Stop tracking"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <TokenTracker address={addr} state={tokens[addr]} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-6 mb-4">
        Auto-refreshes every 15 seconds. This is not financial advice. Memecoins are extremely volatile and you can lose your entire investment.
      </p>
    </div>
  )
}
