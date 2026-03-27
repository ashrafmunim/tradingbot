'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { cn } from '@/lib/utils'
import {
  Play,
  Pause,
  RotateCcw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Zap,
  FastForward,
  ShoppingCart,
  LogOut,
  Clock,
  BarChart3,
} from 'lucide-react'

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface Trade {
  type: 'buy' | 'sell'
  price: number
  quantity: number
  time: number
  candleIdx: number
}

const SPEEDS = [
  { label: '1x', ms: 1000 },
  { label: '2x', ms: 500 },
  { label: '5x', ms: 200 },
  { label: '10x', ms: 100 },
  { label: '25x', ms: 40 },
  { label: '50x', ms: 20 },
  { label: '100x', ms: 10 },
]

const STARTING_BALANCE = 10000

function formatPrice(p: number) {
  if (p < 0.0001) return p.toExponential(3)
  if (p < 0.01) return p.toFixed(6)
  if (p < 1) return p.toFixed(4)
  return p.toFixed(2)
}

function formatUsd(v: number) {
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function SimCanvas({
  candles,
  visibleCount,
  trades,
  peakPnl,
  height = 350,
}: {
  candles: Candle[]
  visibleCount: number
  trades: Trade[]
  peakPnl: { value: number; pct: number; candleIdx: number }
  height?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hovered, setHovered] = useState<Candle | null>(null)

  useEffect(() => {
    if (!canvasRef.current || visibleCount === 0) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const pad = { top: 20, bottom: 30, left: 60, right: 10 }
    const chartW = w - pad.left - pad.right
    const chartH = h - pad.top - pad.bottom

    ctx.clearRect(0, 0, w, h)

    // Background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)

    const visible = candles.slice(0, visibleCount)
    if (visible.length === 0) return

    const maxP = Math.max(...visible.map(c => c.high))
    const minP = Math.min(...visible.map(c => c.low))
    const range = maxP - minP || maxP * 0.01

    const yScale = (p: number) => pad.top + (1 - (p - minP) / range) * chartH
    const candleW = Math.max(3, (chartW / visible.length) * 0.7)

    // Grid lines
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(pad.left, y)
      ctx.lineTo(w - pad.right, y)
      ctx.stroke()

      const price = maxP - (range / 4) * i
      ctx.fillStyle = '#64748b'
      ctx.font = '10px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(formatPrice(price), pad.left - 5, y + 3)
    }

    // Volume bars
    const maxVol = Math.max(...visible.map(c => c.volume)) || 1
    visible.forEach((c, i) => {
      const x = pad.left + ((i + 0.5) / visible.length) * chartW
      const barH = (c.volume / maxVol) * chartH * 0.12
      const isGreen = c.close >= c.open
      ctx.fillStyle = isGreen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'
      ctx.fillRect(x - candleW / 2, h - pad.bottom - barH, candleW, barH)
    })

    // Candles
    visible.forEach((c, i) => {
      const x = pad.left + ((i + 0.5) / visible.length) * chartW
      const isGreen = c.close >= c.open
      const color = isGreen ? '#10b981' : '#ef4444'

      // Wick
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, yScale(c.high))
      ctx.lineTo(x, yScale(c.low))
      ctx.stroke()

      // Body
      const bodyTop = yScale(Math.max(c.open, c.close))
      const bodyBot = yScale(Math.min(c.open, c.close))
      ctx.fillStyle = color
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, Math.max(1, bodyBot - bodyTop))
    })

    // Trade markers
    trades.forEach(t => {
      if (t.candleIdx >= visibleCount) return
      const x = pad.left + ((t.candleIdx + 0.5) / visible.length) * chartW
      const y = yScale(t.price)

      ctx.beginPath()
      if (t.type === 'buy') {
        // Green triangle up
        ctx.fillStyle = '#10b981'
        ctx.moveTo(x, y - 10)
        ctx.lineTo(x - 6, y)
        ctx.lineTo(x + 6, y)
      } else {
        // Red triangle down
        ctx.fillStyle = '#ef4444'
        ctx.moveTo(x, y + 10)
        ctx.lineTo(x - 6, y)
        ctx.lineTo(x + 6, y)
      }
      ctx.closePath()
      ctx.fill()
    })

    // Peak P&L marker
    if (peakPnl.value > 0 && peakPnl.candleIdx < visibleCount && peakPnl.candleIdx < visible.length) {
      const peakCandle = visible[peakPnl.candleIdx]
      if (peakCandle) {
        const x = pad.left + ((peakPnl.candleIdx + 0.5) / visible.length) * chartW
        const y = yScale(peakCandle.high)

        // Vertical dashed line
        ctx.strokeStyle = '#facc15'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(x, pad.top)
        ctx.lineTo(x, h - pad.bottom)
        ctx.stroke()
        ctx.setLineDash([])

        // Star marker
        const starY = y - 16
        ctx.fillStyle = '#facc15'
        ctx.beginPath()
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
          const r = i === 0 ? 7 : 7
          const px = x + Math.cos(angle) * r
          const py = starY + Math.sin(angle) * r
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()

        // Diamond shape instead for clarity
        ctx.fillStyle = '#facc15'
        ctx.beginPath()
        ctx.moveTo(x, starY - 8)
        ctx.lineTo(x + 6, starY)
        ctx.lineTo(x, starY + 8)
        ctx.lineTo(x - 6, starY)
        ctx.closePath()
        ctx.fill()

        // Label
        ctx.fillStyle = '#facc15'
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`Peak +$${peakPnl.value.toFixed(0)}`, x, starY - 12)
        ctx.font = '9px sans-serif'
        ctx.fillText(`(+${peakPnl.pct.toFixed(1)}%)`, x, starY - 2 + 22)
      }
    }

    // Current price line
    if (visible.length > 0) {
      const lastPrice = visible[visible.length - 1].close
      const y = yScale(lastPrice)
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(pad.left, y)
      ctx.lineTo(w - pad.right, y)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(w - pad.right, y - 8, pad.right, 16)
      ctx.fillStyle = '#fff'
      ctx.font = '9px monospace'
      ctx.textAlign = 'left'
    }

    // Time labels
    ctx.fillStyle = '#64748b'
    ctx.font = '9px monospace'
    ctx.textAlign = 'center'
    const step = Math.max(1, Math.floor(visible.length / 6))
    visible.forEach((c, i) => {
      if (i % step === 0) {
        const x = pad.left + ((i + 0.5) / visible.length) * chartW
        const d = new Date(c.time)
        ctx.fillText(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), x, h - 5)
      }
    })

  }, [candles, visibleCount, trades])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || visibleCount === 0) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const padLeft = 60
    const chartW = rect.width - padLeft - 10
    const idx = Math.floor(((x - padLeft) / chartW) * visibleCount)
    if (idx >= 0 && idx < visibleCount) {
      setHovered(candles[idx])
    }
  }

  return (
    <div className="relative">
      {hovered && (
        <div className="absolute top-1 left-16 flex items-center gap-3 text-[10px] z-10 bg-slate-900/80 px-2 py-1 rounded">
          <span className="text-gray-400">{new Date(hovered.time).toLocaleTimeString()}</span>
          <span className="text-gray-400">O:<span className="text-gray-200 ml-0.5">{formatPrice(hovered.open)}</span></span>
          <span className="text-gray-400">H:<span className="text-emerald-400 ml-0.5">{formatPrice(hovered.high)}</span></span>
          <span className="text-gray-400">L:<span className="text-rose-400 ml-0.5">{formatPrice(hovered.low)}</span></span>
          <span className="text-gray-400">C:<span className={cn('ml-0.5', hovered.close >= hovered.open ? 'text-emerald-400' : 'text-rose-400')}>{formatPrice(hovered.close)}</span></span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height }}
        className="cursor-crosshair rounded-lg"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      />
    </div>
  )
}

const TIMEFRAMES = [
  { label: '5m', value: '5m', desc: '~3 days' },
  { label: '15m', value: '15m', desc: '~10 days' },
  { label: '1H', value: '1h', desc: '~4 months' },
  { label: '4H', value: '4h', desc: '~1 year' },
  { label: '1D', value: '1d', desc: '~8 years' },
]

export default function SimulatePage() {
  const [poolAddress, setPoolAddress] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [allCandles, setAllCandles] = useState<Candle[]>([])
  const [visibleCount, setVisibleCount] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(2) // default 5x
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTf, setSelectedTf] = useState('1h')

  // Paper trading state
  const [balance, setBalance] = useState(STARTING_BALANCE)
  const [holdings, setHoldings] = useState(0) // quantity of token held
  const [trades, setTrades] = useState<Trade[]>([])
  const [buyAmount, setBuyAmount] = useState('1000')
  const [peakPnl, setPeakPnl] = useState({ value: 0, pct: 0, candleIdx: 0 })
  const [pnlHistory, setPnlHistory] = useState<{ idx: number; pnl: number }[]>([])

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentPrice = visibleCount > 0 && allCandles[visibleCount - 1]
    ? allCandles[visibleCount - 1].close
    : 0

  const holdingsValue = holdings * currentPrice
  const totalValue = balance + holdingsValue
  const pnl = totalValue - STARTING_BALANCE
  const pnlPct = (pnl / STARTING_BALANCE) * 100

  // Track peak P&L
  useEffect(() => {
    if (visibleCount <= 0 || trades.length === 0) return
    const entry = { idx: visibleCount - 1, pnl }
    setPnlHistory(prev => [...prev, entry])
    if (pnl > peakPnl.value) {
      setPeakPnl({ value: pnl, pct: pnlPct, candleIdx: visibleCount - 1 })
    }
  }, [visibleCount])

  // Load token from scout (check URL params)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pool = params.get('pool')
    const sym = params.get('symbol')
    if (pool) setPoolAddress(pool)
    if (sym) setTokenSymbol(sym)
    if (pool) {
      loadCandles(pool)
    }
  }, [])

  const loadCandles = async (pool: string, tf?: string) => {
    const timeframe = tf || selectedTf
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/ohlcv?pool=${pool}&tf=${timeframe}&limit=3000`)
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No candle data available for this token')
      }
      setAllCandles(data)
      setVisibleCount(1)
      // Reset trading state
      setBalance(STARTING_BALANCE)
      setHoldings(0)
      setTrades([])
      setPeakPnl({ value: 0, pct: 0, candleIdx: 0 })
      setPnlHistory([])
      setIsPlaying(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLoad = () => {
    if (!poolAddress.trim()) return
    loadCandles(poolAddress.trim())
  }

  // Play/pause
  useEffect(() => {
    if (isPlaying && visibleCount < allCandles.length) {
      intervalRef.current = setInterval(() => {
        setVisibleCount(prev => {
          if (prev >= allCandles.length) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, SPEEDS[speedIdx].ms)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, speedIdx, allCandles.length])

  // Stop at end
  useEffect(() => {
    if (visibleCount >= allCandles.length && allCandles.length > 0) {
      setIsPlaying(false)
    }
  }, [visibleCount, allCandles.length])

  const handleBuy = () => {
    const amount = parseFloat(buyAmount)
    if (isNaN(amount) || amount <= 0 || amount > balance || currentPrice <= 0) return
    const qty = amount / currentPrice
    setBalance(b => b - amount)
    setHoldings(h => h + qty)
    setTrades(t => [...t, { type: 'buy', price: currentPrice, quantity: qty, time: Date.now(), candleIdx: visibleCount - 1 }])
  }

  const handleSell = () => {
    if (holdings <= 0 || currentPrice <= 0) return
    const value = holdings * currentPrice
    setBalance(b => b + value)
    setTrades(t => [...t, { type: 'sell', price: currentPrice, quantity: holdings, time: Date.now(), candleIdx: visibleCount - 1 }])
    setHoldings(0)
  }

  const handleSellHalf = () => {
    if (holdings <= 0 || currentPrice <= 0) return
    const half = holdings / 2
    const value = half * currentPrice
    setBalance(b => b + value)
    setHoldings(h => h - half)
    setTrades(t => [...t, { type: 'sell', price: currentPrice, quantity: half, time: Date.now(), candleIdx: visibleCount - 1 }])
  }

  const handleReset = () => {
    setIsPlaying(false)
    setVisibleCount(1)
    setBalance(STARTING_BALANCE)
    setHoldings(0)
    setTrades([])
    setPeakPnl({ value: 0, pct: 0, candleIdx: 0 })
    setPnlHistory([])
  }

  const progress = allCandles.length > 0 ? (visibleCount / allCandles.length) * 100 : 0
  const elapsedMs = visibleCount > 0 && allCandles[0] && allCandles[visibleCount - 1]
    ? allCandles[visibleCount - 1].time - allCandles[0].time
    : 0
  const elapsedHours = Math.round(elapsedMs / (1000 * 60 * 60))
  const elapsedDays = (elapsedMs / (1000 * 60 * 60 * 24)).toFixed(1)
  const elapsed = elapsedHours >= 48 ? `${elapsedDays}d` : `${elapsedHours}h`

  const handleTfChange = (tf: string) => {
    setSelectedTf(tf)
    if (poolAddress) {
      loadCandles(poolAddress, tf)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <Zap className="w-6 h-6 text-[#1a73e8]" />
          Paper Trading Simulator
        </h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm">
          Practice trading with $10,000 dummy balance. Watch candles replay at accelerated speed.
        </p>
      </div>

      {/* Token Input */}
      {allCandles.length === 0 && !loading && (
        <Card className="p-6 mb-6">
          <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">
            Enter a pool address or go to <a href="/scout" className="text-[#1a73e8] hover:underline">Scout</a> and click "Simulate" on any token.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={poolAddress}
              onChange={(e) => setPoolAddress(e.target.value)}
              placeholder="Pool address (e.g. from DexScreener)"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm"
            />
            <button
              onClick={handleLoad}
              disabled={!poolAddress.trim()}
              className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-sm disabled:opacity-50"
            >
              Load
            </button>
          </div>
        </Card>
      )}

      {loading && (
        <Card className="p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-slate-400 text-sm">Loading candle data...</p>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-4 mb-6 border-rose-300 dark:border-rose-700">
          <p className="text-rose-500 text-sm">{error}</p>
        </Card>
      )}

      {allCandles.length > 0 && (
        <>
          {/* Portfolio Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <Card className="p-3">
              <div className="text-[10px] text-gray-400 dark:text-slate-500 flex items-center gap-1"><DollarSign className="w-3 h-3" />Balance</div>
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100 font-mono">${formatUsd(balance)}</p>
            </Card>
            <Card className="p-3">
              <div className="text-[10px] text-gray-400 dark:text-slate-500 flex items-center gap-1"><BarChart3 className="w-3 h-3" />Holdings</div>
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100 font-mono">${formatUsd(holdingsValue)}</p>
              {holdings > 0 && <p className="text-[10px] text-gray-400 font-mono">{holdings.toFixed(4)} tokens</p>}
            </Card>
            <Card className="p-3">
              <div className="text-[10px] text-gray-400 dark:text-slate-500">Total Value</div>
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100 font-mono">${formatUsd(totalValue)}</p>
            </Card>
            <Card className="p-3">
              <div className="text-[10px] text-gray-400 dark:text-slate-500">P&L</div>
              <p className={cn('text-lg font-bold font-mono', pnl >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                {pnl >= 0 ? '+' : ''}{formatUsd(pnl)}
              </p>
              <p className={cn('text-[10px] font-mono', pnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
              </p>
            </Card>
            <Card className={cn('p-3', peakPnl.value > 0 && 'border-amber-300 dark:border-amber-700')}>
              <div className="text-[10px] text-amber-500 flex items-center gap-1">Peak P&L</div>
              <p className={cn('text-lg font-bold font-mono', peakPnl.value > 0 ? 'text-amber-500' : 'text-gray-400')}>
                {peakPnl.value > 0 ? `+${formatUsd(peakPnl.value)}` : '--'}
              </p>
              {peakPnl.value > 0 && (
                <p className="text-[10px] font-mono text-amber-400">
                  +{peakPnl.pct.toFixed(2)}% @ candle #{peakPnl.candleIdx + 1}
                </p>
              )}
            </Card>
            <Card className="p-3">
              <div className="text-[10px] text-gray-400 dark:text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />Elapsed</div>
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{elapsed}</p>
              <p className="text-[10px] text-gray-400">{visibleCount}/{allCandles.length} candles ({selectedTf})</p>
            </Card>
          </div>

          {/* Chart */}
          <Card className="mb-4 overflow-hidden">
            <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-slate-100 text-sm">
                  {tokenSymbol || 'Token'} / USD
                </span>
                {/* Timeframe selector */}
                <div className="flex gap-0.5 p-0.5 bg-gray-100 dark:bg-slate-800 rounded-md">
                  {TIMEFRAMES.map(tf => (
                    <button
                      key={tf.value}
                      onClick={() => handleTfChange(tf.value)}
                      className={cn(
                        'px-2 py-0.5 text-[10px] font-medium rounded transition-colors',
                        selectedTf === tf.value
                          ? 'bg-[#1a73e8] text-white'
                          : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                      )}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
                {currentPrice > 0 && (
                  <span className="text-sm font-mono font-bold text-gray-900 dark:text-slate-100">
                    ${formatPrice(currentPrice)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <span className="w-3 h-3 inline-block" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '8px solid #10b981' }} />
                Buy
                <span className="ml-2 w-3 h-3 inline-block" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #ef4444' }} />
                Sell
              </div>
            </div>
            <SimCanvas candles={allCandles} visibleCount={visibleCount} trades={trades} peakPnl={peakPnl} height={350} />

            {/* Progress bar */}
            <div className="px-4 py-1 bg-slate-950">
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#1a73e8] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </Card>

          {/* Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Playback Controls */}
            <Card className="p-4">
              <p className="text-xs font-semibold text-gray-600 dark:text-slate-300 mb-3">Playback</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={visibleCount >= allCandles.length}
                  className="flex items-center gap-1 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <div className="ml-auto flex items-center gap-1">
                  <FastForward className="w-3.5 h-3.5 text-gray-400" />
                  {SPEEDS.map((s, i) => (
                    <button
                      key={s.label}
                      onClick={() => setSpeedIdx(i)}
                      className={cn(
                        'px-2 py-1 text-xs rounded-md transition-colors',
                        speedIdx === i
                          ? 'bg-[#1a73e8] text-white'
                          : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Trading Controls */}
            <Card className="p-4">
              <p className="text-xs font-semibold text-gray-600 dark:text-slate-300 mb-3">Trade</p>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm"
                    min="1"
                    max={balance}
                  />
                </div>
                <button
                  onClick={handleBuy}
                  disabled={!currentPrice || parseFloat(buyAmount) > balance || parseFloat(buyAmount) <= 0}
                  className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy
                </button>
                <button
                  onClick={handleSellHalf}
                  disabled={holdings <= 0}
                  className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  50%
                </button>
                <button
                  onClick={handleSell}
                  disabled={holdings <= 0}
                  className="flex items-center gap-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sell All
                </button>
              </div>
            </Card>
          </div>

          {/* Trade History */}
          {trades.length > 0 && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Trade History</CardTitle>
              </CardHeader>
              <div className="px-4 pb-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-slate-700">
                      <th className="text-left py-1.5 font-medium">#</th>
                      <th className="text-left py-1.5 font-medium">Type</th>
                      <th className="text-right py-1.5 font-medium">Price</th>
                      <th className="text-right py-1.5 font-medium">Qty</th>
                      <th className="text-right py-1.5 font-medium">Value</th>
                      <th className="text-right py-1.5 font-medium">Candle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((t, i) => (
                      <tr key={i} className="border-b border-gray-50 dark:border-slate-800">
                        <td className="py-1.5 text-gray-400">{i + 1}</td>
                        <td className={cn('py-1.5 font-medium', t.type === 'buy' ? 'text-emerald-500' : 'text-rose-500')}>
                          {t.type.toUpperCase()}
                        </td>
                        <td className="py-1.5 text-right font-mono text-gray-700 dark:text-slate-300">${formatPrice(t.price)}</td>
                        <td className="py-1.5 text-right font-mono text-gray-500 dark:text-slate-400">{t.quantity.toFixed(4)}</td>
                        <td className="py-1.5 text-right font-mono text-gray-700 dark:text-slate-300">${formatUsd(t.price * t.quantity)}</td>
                        <td className="py-1.5 text-right text-gray-400">#{t.candleIdx + 1}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-4">
            Replaying {allCandles.length} candles ({selectedTf}) at {SPEEDS[speedIdx].label} speed. Paper trading only — no real money involved.
          </p>
        </>
      )}
    </div>
  )
}
