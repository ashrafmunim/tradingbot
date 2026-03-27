'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { CandlestickChart } from '@/components/CandlestickChart'
import { AIAdvisor } from '@/components/AIAdvisor'
import { cn } from '@/lib/utils'
import { addTrackedToken, removeTrackedToken, isTokenTracked } from '@/lib/tracked-tokens'
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Droplets,
  ExternalLink,
  Activity,
  ShieldAlert,
  Search,
  Zap,
  Crown,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react'

interface ScoredToken {
  address: string
  symbol: string
  name: string
  priceUsd: number
  marketCap: number
  liquidity: number
  volume24h: number
  priceChange5m: number
  priceChange1h: number
  priceChange6h: number
  priceChange24h: number
  buys5m: number
  sells5m: number
  buys1h: number
  sells1h: number
  buys24h: number
  sells24h: number
  pairAddress: string
  url: string
  imageUrl: string | null
  createdAt: number | null
  analysis: {
    score: number
    signal: string
    signalColor: string
    reasons: string[]
    liquidityRisk: string
    momentum: number
    buyPressure: number
  }
}

function useScout(maxMarketCap = 100000, interval = 30000) {
  const [data, setData] = useState<{ tokens: ScoredToken[]; meta: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/scout?maxMarketCap=${maxMarketCap}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
      setError(null)
      setLastFetch(new Date())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, interval)
    return () => clearInterval(id)
  }, [fetchData, interval])

  return { data, loading, error, lastFetch, refetch: fetchData }
}

function SignalPill({ signal, color, score }: { signal: string; color: string; score: number }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold', colors[color] || colors.amber)}>
      {signal}
      <span className="font-normal opacity-70">({score})</span>
    </span>
  )
}

function RiskBadge({ risk }: { risk: string }) {
  if (risk === 'low') return <span className="text-[10px] text-emerald-500 font-medium">Safe</span>
  if (risk === 'moderate') return <span className="text-[10px] text-amber-500 font-medium">Moderate</span>
  if (risk === 'high') return <span className="text-[10px] text-orange-500 font-medium">Risky</span>
  return <span className="text-[10px] text-rose-500 font-bold">Danger</span>
}

function PriceChange({ value }: { value: number }) {
  return (
    <span className={cn(
      'text-xs font-mono',
      value > 0 ? 'text-emerald-500' : value < 0 ? 'text-rose-500' : 'text-gray-400'
    )}>
      {value > 0 ? '+' : ''}{value.toFixed(1)}%
    </span>
  )
}

function BuyPressureBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            pct >= 60 ? 'bg-emerald-500' : pct <= 40 ? 'bg-rose-500' : 'bg-amber-400'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn(
        'text-[10px] font-mono',
        pct >= 60 ? 'text-emerald-500' : pct <= 40 ? 'text-rose-500' : 'text-amber-500'
      )}>{pct}%</span>
    </div>
  )
}

function TrackActions({ token }: { token: ScoredToken }) {
  const [tracked, setTracked] = useState(() => isTokenTracked(token.address))

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (tracked) {
      removeTrackedToken(token.address)
      setTracked(false)
    } else {
      addTrackedToken(token.address)
      setTracked(true)
    }
  }

  return (
    <div className="flex gap-2 pt-1">
      {token.url && (
        <a
          href={token.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 dark:text-slate-400 hover:text-[#1a73e8] border border-gray-200 dark:border-slate-700 rounded-lg"
        >
          DexScreener <ExternalLink className="w-3 h-3" />
        </a>
      )}
      <button
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors',
          tracked
            ? 'text-rose-500 border border-rose-300 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20'
            : 'text-[#1a73e8] border border-[#1a73e8]/30 hover:bg-[#1a73e8]/10'
        )}
      >
        {tracked ? 'Untrack' : 'Track'}
        <Activity className="w-3 h-3" />
      </button>
      {tracked && (
        <a
          href="/memecoin"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-emerald-600 border border-emerald-300 dark:border-emerald-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        >
          View Tracker
        </a>
      )}
      <a
        href={`/simulate?pool=${token.pairAddress}&symbol=${encodeURIComponent(token.symbol)}`}
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1 px-3 py-1.5 text-xs text-purple-600 border border-purple-300 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
      >
        <Zap className="w-3 h-3" />
        Simulate
      </a>
    </div>
  )
}

function TokenRow({ token, rank, expanded, onToggle }: { token: ScoredToken; rank: number; expanded: boolean; onToggle: () => void }) {
  const { analysis } = token
  const age = token.createdAt ? Math.floor((Date.now() - token.createdAt) / (1000 * 60 * 60)) : null

  return (
    <div className={cn(
      'border-b border-gray-100 dark:border-slate-700/50 transition-colors',
      expanded && 'bg-gray-50/50 dark:bg-slate-800/30'
    )}>
      <div
        onClick={onToggle}
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        {/* Rank */}
        <div className={cn(
          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
          rank === 1 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
          rank === 2 ? 'bg-gray-200 text-gray-600 dark:bg-slate-600 dark:text-slate-300' :
          rank === 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
          'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
        )}>
          {rank <= 3 ? <Crown className="w-3.5 h-3.5" /> : rank}
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={token.url || `https://dexscreener.com/solana/${token.pairAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-gray-900 dark:text-slate-100 text-sm hover:text-[#1a73e8] dark:hover:text-blue-400 transition-colors"
            >
              {token.symbol}
            </a>
            <span className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{token.name}</span>
            <a
              href={token.url || `https://dexscreener.com/solana/${token.pairAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-gray-300 dark:text-slate-600 hover:text-[#1a73e8] dark:hover:text-blue-400 transition-colors"
              title="View on DexScreener"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-mono text-gray-600 dark:text-slate-300">
              ${token.priceUsd < 0.01 ? token.priceUsd.toExponential(3) : token.priceUsd.toFixed(4)}
            </span>
            <RiskBadge risk={analysis.liquidityRisk} />
            {age !== null && age < 24 && (
              <span className="text-[10px] text-blue-500 flex items-center gap-0.5">
                <Clock className="w-3 h-3" />{age}h old
              </span>
            )}
          </div>
        </div>

        {/* Price Changes */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-center">
            <div className="text-[9px] text-gray-400">5m</div>
            <PriceChange value={token.priceChange5m} />
          </div>
          <div className="text-center">
            <div className="text-[9px] text-gray-400">1h</div>
            <PriceChange value={token.priceChange1h} />
          </div>
          <div className="text-center">
            <div className="text-[9px] text-gray-400">24h</div>
            <PriceChange value={token.priceChange24h} />
          </div>
        </div>

        {/* Buy Pressure */}
        <div className="hidden md:block">
          <BuyPressureBar pct={analysis.buyPressure} />
        </div>

        {/* Signal */}
        <SignalPill signal={analysis.signal} color={analysis.signalColor} score={analysis.score} />

        {/* Expand */}
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Split layout: DexScreener embed left, analytics right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* DexScreener Embed */}
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 bg-black" style={{ minHeight: 400 }}>
              <iframe
                src={`https://dexscreener.com/solana/${token.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
                className="w-full h-full border-0"
                style={{ minHeight: 400 }}
                title={`${token.symbol} DexScreener Chart`}
                allow="clipboard-write"
                loading="lazy"
              />
            </div>

            {/* Analytics Panel */}
            <div className="space-y-3">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">Market Cap</span>
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    ${token.marketCap >= 1e6 ? `${(token.marketCap / 1e6).toFixed(2)}M` : `${(token.marketCap / 1e3).toFixed(1)}K`}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">Liquidity</span>
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    ${token.liquidity >= 1e6 ? `${(token.liquidity / 1e6).toFixed(2)}M` : `${(token.liquidity / 1e3).toFixed(1)}K`}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">24h Volume</span>
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
                    ${token.volume24h >= 1e6 ? `${(token.volume24h / 1e6).toFixed(2)}M` : `${(token.volume24h / 1e3).toFixed(1)}K`}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">Momentum</span>
                  <p className={cn(
                    'text-sm font-bold',
                    analysis.momentum > 0 ? 'text-emerald-500' : analysis.momentum < 0 ? 'text-rose-500' : 'text-gray-500'
                  )}>
                    {analysis.momentum > 0 ? '+' : ''}{analysis.momentum}%
                  </p>
                </div>
              </div>

              {/* Price Changes */}
              <div className="flex gap-2">
                <div className="flex-1 text-center p-2 rounded bg-gray-50 dark:bg-slate-800/50">
                  <div className="text-[9px] text-gray-400">5m</div>
                  <PriceChange value={token.priceChange5m} />
                </div>
                <div className="flex-1 text-center p-2 rounded bg-gray-50 dark:bg-slate-800/50">
                  <div className="text-[9px] text-gray-400">1h</div>
                  <PriceChange value={token.priceChange1h} />
                </div>
                <div className="flex-1 text-center p-2 rounded bg-gray-50 dark:bg-slate-800/50">
                  <div className="text-[9px] text-gray-400">6h</div>
                  <PriceChange value={token.priceChange6h} />
                </div>
                <div className="flex-1 text-center p-2 rounded bg-gray-50 dark:bg-slate-800/50">
                  <div className="text-[9px] text-gray-400">24h</div>
                  <PriceChange value={token.priceChange24h} />
                </div>
              </div>

              {/* Buy/Sell bars */}
              <div>
                <span className="text-[10px] text-gray-400 dark:text-slate-500">Buy/Sell (1h)</span>
                <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 mt-1">
                  {(() => {
                    const total = token.buys1h + token.sells1h
                    const pct = total > 0 ? (token.buys1h / total) * 100 : 50
                    return <>
                      <div className="bg-emerald-500" style={{ width: `${pct}%` }} />
                      <div className="bg-rose-500" style={{ width: `${100 - pct}%` }} />
                    </>
                  })()}
                </div>
                <div className="flex justify-between text-[10px] mt-0.5">
                  <span className="text-emerald-500">{token.buys1h} buys</span>
                  <span className="text-rose-500">{token.sells1h} sells</span>
                </div>
              </div>

              {/* Liquidity Warning */}
              {analysis.liquidityRisk !== 'low' && (
                <div className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
                  analysis.liquidityRisk === 'critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400' :
                  analysis.liquidityRisk === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                  'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                )}>
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                  {analysis.liquidityRisk === 'critical' ? 'Extremely low liquidity' :
                   analysis.liquidityRisk === 'high' ? 'Low liquidity — caution' : 'Moderate liquidity'}
                </div>
              )}

              {/* Reasoning */}
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500">Why this signal:</span>
                {analysis.reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-slate-300">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{r}</span>
                  </div>
            ))}
              </div>

              {/* AI Assistant */}
              <AIAdvisor token={token} />

              {/* Actions */}
              <TrackActions token={token} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const MCAP_OPTIONS = [
  { label: '<100K', value: 100000 },
  { label: '<500K', value: 500000 },
  { label: '<1M', value: 1000000 },
  { label: 'All', value: 0 },
]

export default function ScoutPage() {
  const [maxMcap, setMaxMcap] = useState(100000)
  const { data, loading, error, lastFetch, refetch } = useScout(maxMcap, 30000) // refresh every 30s
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [filterSignal, setFilterSignal] = useState<string>('all')
  const [filterAge, setFilterAge] = useState<string>('all')
  const [countdown, setCountdown] = useState(30)

  // Countdown timer
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(prev => prev <= 1 ? 30 : prev - 1)
    }, 1000)
    return () => clearInterval(id)
  }, [lastFetch])

  useEffect(() => {
    setCountdown(30)
  }, [lastFetch])

  const handleRefresh = () => {
    setIsRefreshing(true)
    refetch()
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  const AGE_FILTERS: Record<string, number> = {
    'all': 0,
    '1d': 24,
    '3d': 72,
    '1w': 168,
    '2w': 336,
    '1m': 720,
    '3m': 2160,
    '6m': 4320,
    '1y': 8760,
    'old': -1, // older than 1 year
  }

  const filteredTokens = data?.tokens.filter(t => {
    // Signal filter
    if (filterSignal === 'buy' && !t.analysis.signal.includes('Buy')) return false
    if (filterSignal === 'sell' && !t.analysis.signal.includes('Sell')) return false
    if (filterSignal === 'hold' && t.analysis.signal !== 'Hold') return false

    // Age filter
    if (filterAge !== 'all' && t.createdAt) {
      const ageHours = (Date.now() - t.createdAt) / (1000 * 60 * 60)
      const maxAge = AGE_FILTERS[filterAge]
      if (maxAge === -1) {
        // "old" = older than 1 year
        if (ageHours < 8760) return false
      } else if (maxAge > 0) {
        if (ageHours > maxAge) return false
      }
    } else if (filterAge !== 'all' && !t.createdAt) {
      // No creation date — hide if filtering by age
      return false
    }

    return true
  }) || []

  const buyCount = data?.tokens.filter(t => t.analysis.signal.includes('Buy')).length || 0
  const sellCount = data?.tokens.filter(t => t.analysis.signal.includes('Sell')).length || 0
  const holdCount = data?.tokens.filter(t => t.analysis.signal === 'Hold').length || 0

  // Top movers
  const topGainers = [...(data?.tokens || [])].sort((a, b) => b.priceChange1h - a.priceChange1h).slice(0, 3)
  const topLosers = [...(data?.tokens || [])].sort((a, b) => a.priceChange1h - b.priceChange1h).slice(0, 3)
  const highestVolume = [...(data?.tokens || [])].sort((a, b) => b.volume24h - a.volume24h).slice(0, 3)

  // Avg score
  const avgScore = data?.tokens.length ? Math.round(data.tokens.reduce((a, t) => a + t.analysis.score, 0) / data.tokens.length) : 0
  const avgMomentum = data?.tokens.length ? (data.tokens.reduce((a, t) => a + t.analysis.momentum, 0) / data.tokens.length).toFixed(1) : '0'

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
            <Search className="w-8 h-8 text-[#1a73e8]" />
            Scout
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-base mt-1">
            Live scouting Solana tokens under {maxMcap > 0 ? `$${(maxMcap/1000)}K` : 'any'} market cap
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400 dark:text-slate-500 flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" />
            {countdown}s
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Scan Now
          </button>
        </div>
      </div>

      {/* Stats + Market Overview Row */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
          <Card className="p-5">
            <div className="text-xs text-gray-400 dark:text-slate-500 mb-1">Scanned</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{data.meta.totalScanned}</p>
            <p className="text-sm text-gray-400 mt-1">{data.meta.afterFilter} passed filter</p>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-emerald-500 mb-1">Buy Signals</div>
            <p className="text-3xl font-bold text-emerald-500">{buyCount}</p>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-amber-500 mb-1">Hold</div>
            <p className="text-3xl font-bold text-amber-500">{holdCount}</p>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-rose-500 mb-1">Sell Signals</div>
            <p className="text-3xl font-bold text-rose-500">{sellCount}</p>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-gray-400 dark:text-slate-500 mb-1">Avg Score</div>
            <p className={cn('text-3xl font-bold', avgScore >= 55 ? 'text-emerald-500' : avgScore <= 45 ? 'text-rose-500' : 'text-amber-500')}>{avgScore}<span className="text-lg text-gray-400">/100</span></p>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-gray-400 dark:text-slate-500 mb-1">Avg Momentum</div>
            <p className={cn('text-3xl font-bold', parseFloat(avgMomentum) > 0 ? 'text-emerald-500' : parseFloat(avgMomentum) < 0 ? 'text-rose-500' : 'text-amber-500')}>{parseFloat(avgMomentum) > 0 ? '+' : ''}{avgMomentum}%</p>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-gray-400 dark:text-slate-500 mb-1">Market Mood</div>
            <p className={cn('text-2xl font-bold', buyCount > sellCount ? 'text-emerald-500' : sellCount > buyCount ? 'text-rose-500' : 'text-amber-500')}>
              {buyCount > sellCount * 2 ? 'Bullish' : sellCount > buyCount * 2 ? 'Bearish' : buyCount > sellCount ? 'Mildly Bullish' : sellCount > buyCount ? 'Mildly Bearish' : 'Neutral'}
            </p>
          </Card>
        </div>
      )}

      {/* Top Movers Row */}
      {data && data.tokens.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Top Gainers */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Top Gainers (1h)</span>
            </div>
            <div className="space-y-3">
              {topGainers.map((t, i) => (
                <div key={t.address} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn('text-sm font-bold w-5 h-5 rounded-full flex items-center justify-center', i === 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-gray-400')}>{i + 1}</span>
                    <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-900 dark:text-slate-100 hover:text-[#1a73e8]">{t.symbol}</a>
                  </div>
                  <span className="text-sm font-bold font-mono text-emerald-500">+{t.priceChange1h.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Losers */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Top Losers (1h)</span>
            </div>
            <div className="space-y-3">
              {topLosers.map((t, i) => (
                <div key={t.address} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn('text-sm font-bold w-5 h-5 rounded-full flex items-center justify-center', i === 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'text-gray-400')}>{i + 1}</span>
                    <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-900 dark:text-slate-100 hover:text-[#1a73e8]">{t.symbol}</a>
                  </div>
                  <span className="text-sm font-bold font-mono text-rose-500">{t.priceChange1h.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Highest Volume */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-[#1a73e8]" />
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Most Active (24h Vol)</span>
            </div>
            <div className="space-y-3">
              {highestVolume.map((t, i) => (
                <div key={t.address} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={cn('text-sm font-bold w-5 h-5 rounded-full flex items-center justify-center', i === 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-400')}>{i + 1}</span>
                    <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-900 dark:text-slate-100 hover:text-[#1a73e8]">{t.symbol}</a>
                  </div>
                  <span className="text-sm font-bold font-mono text-gray-500 dark:text-slate-400">
                    ${t.volume24h >= 1e6 ? `${(t.volume24h / 1e6).toFixed(1)}M` : `${(t.volume24h / 1e3).toFixed(1)}K`}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Signal Distribution Bar */}
      {data && data.tokens.length > 0 && (
        <Card className="p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600 dark:text-slate-300">Signal Distribution</span>
            <span className="text-sm text-gray-400">{data.tokens.length} tokens</span>
          </div>
          <div className="flex h-5 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700">
            {buyCount > 0 && <div className="bg-emerald-500 transition-all flex items-center justify-center" style={{ width: `${(buyCount / data.tokens.length) * 100}%` }}><span className="text-[10px] font-bold text-white">{Math.round((buyCount / data.tokens.length) * 100)}%</span></div>}
            {holdCount > 0 && <div className="bg-amber-400 transition-all flex items-center justify-center" style={{ width: `${(holdCount / data.tokens.length) * 100}%` }}><span className="text-[10px] font-bold text-white">{Math.round((holdCount / data.tokens.length) * 100)}%</span></div>}
            {sellCount > 0 && <div className="bg-rose-500 transition-all flex items-center justify-center" style={{ width: `${(sellCount / data.tokens.length) * 100}%` }}><span className="text-[10px] font-bold text-white">{Math.round((sellCount / data.tokens.length) * 100)}%</span></div>}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /><span className="font-medium">Buy {buyCount}</span></span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400" /><span className="font-medium">Hold {holdCount}</span></span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500" /><span className="font-medium">Sell {sellCount}</span></span>
            </div>
            <span className="text-gray-400">{lastFetch ? `Updated ${lastFetch.toLocaleTimeString()}` : ''}</span>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Filter className="w-5 h-5 text-gray-400" />

        {/* Signal filter */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
          {[
            { key: 'all', label: 'All' },
            { key: 'buy', label: 'Buy' },
            { key: 'hold', label: 'Hold' },
            { key: 'sell', label: 'Sell' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterSignal(f.key)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                filterSignal === f.key
                  ? 'text-gray-900 dark:text-white bg-white dark:bg-slate-700 shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Market cap filter */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
          <span className="px-2 py-1.5 text-[10px] text-gray-400 dark:text-slate-500 font-medium">MCap:</span>
          {MCAP_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setMaxMcap(opt.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                maxMcap === opt.value
                  ? 'text-gray-900 dark:text-white bg-white dark:bg-slate-700 shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Age filter */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
          <span className="px-2 py-1.5 text-[10px] text-gray-400 dark:text-slate-500 font-medium">Age:</span>
          {[
            { key: 'all', label: 'All' },
            { key: '1d', label: '<1 Day' },
            { key: '3d', label: '<3 Days' },
            { key: '1w', label: '<1 Week' },
            { key: '2w', label: '<2 Weeks' },
            { key: '1m', label: '<1 Month' },
            { key: '3m', label: '<3 Months' },
            { key: '1y', label: '<1 Year' },
            { key: 'old', label: '1Y+' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterAge(f.key)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                filterAge === f.key
                  ? 'text-gray-900 dark:text-white bg-white dark:bg-slate-700 shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && !data && (
        <Card className="p-12">
          <div className="flex flex-col items-center gap-3">
            <Zap className="w-8 h-8 text-[#1a73e8] animate-pulse" />
            <p className="text-gray-500 dark:text-slate-400 text-sm">Scanning DexScreener for trending tokens...</p>
          </div>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="p-4 mb-4 border-rose-300 dark:border-rose-700">
          <p className="text-rose-500 text-sm">Error: {error}</p>
        </Card>
      )}

      {/* Token List */}
      {filteredTokens.length > 0 && (
        <Card className="overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700 text-[10px] text-gray-400 dark:text-slate-500 font-medium uppercase tracking-wider">
            <div className="w-7">#</div>
            <div className="flex-1">Token</div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-10 text-center">5m</div>
              <div className="w-10 text-center">1h</div>
              <div className="w-10 text-center">24h</div>
            </div>
            <div className="hidden md:block w-20">Buy %</div>
            <div className="w-24 text-center">Signal</div>
            <div className="w-4" />
          </div>

          {filteredTokens.map((token, i) => (
            <TokenRow
              key={token.address}
              token={token}
              rank={i + 1}
              expanded={expandedIdx === i}
              onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
            />
          ))}
        </Card>
      )}

      {data && filteredTokens.length === 0 && (
        <Card className="p-8">
          <p className="text-center text-gray-400 dark:text-slate-500 text-sm">
            No tokens match the selected filter
          </p>
        </Card>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-4 mb-4">
        Scans DexScreener every 30 seconds for trending Solana tokens. Ranked by momentum, buy pressure, volume & liquidity.
        <br />This is not financial advice. Always DYOR.
      </p>
    </div>
  )
}
