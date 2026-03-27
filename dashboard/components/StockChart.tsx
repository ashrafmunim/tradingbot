'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { CandlestickChart as CandleIcon, LineChart, Brain, Newspaper, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface Prediction {
  direction: 'up' | 'down' | 'sideways'
  confidence: number
  targetPrice: number
  stopLoss: number
  sma20: number
  sma50: number
  ema12: number
  ema26: number
  rsi: number
  signal: string
  reasons: string[]
}

const RANGES = [
  { label: '1W', range: '5d', interval: '15m' },
  { label: '1M', range: '1mo', interval: '1d' },
  { label: '3M', range: '3mo', interval: '1d' },
  { label: '6M', range: '6mo', interval: '1wk' },
  { label: '1Y', range: '1y', interval: '1wk' },
  { label: '5Y', range: '5y', interval: '1mo' },
]

// Calculate SMA
function sma(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null
    const slice = data.slice(i - period + 1, i + 1)
    return slice.reduce((a, b) => a + b, 0) / period
  })
}

// Calculate EMA
function ema(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1)
  const result: (number | null)[] = []
  let prev: number | null = null
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(null); continue }
    if (prev === null) {
      prev = data.slice(0, period).reduce((a, b) => a + b, 0) / period
    } else {
      prev = data[i] * k + prev * (1 - k)
    }
    result.push(prev)
  }
  return result
}

// Calculate RSI
function rsi(data: number[], period = 14): number {
  if (data.length < period + 1) return 50
  let gains = 0, losses = 0
  for (let i = data.length - period; i < data.length; i++) {
    const diff = data[i] - data[i - 1]
    if (diff > 0) gains += diff
    else losses -= diff
  }
  const rs = losses === 0 ? 100 : gains / losses
  return 100 - (100 / (1 + rs))
}

// Generate prediction
function predict(candles: Candle[]): Prediction {
  const closes = candles.map(c => c.close)
  const sma20Arr = sma(closes, 20)
  const sma50Arr = sma(closes, 50)
  const ema12Arr = ema(closes, 12)
  const ema26Arr = ema(closes, 26)
  const currentRsi = rsi(closes)

  const last = closes[closes.length - 1]
  const sma20Val = sma20Arr[sma20Arr.length - 1] || last
  const sma50Val = sma50Arr[sma50Arr.length - 1] || last
  const ema12Val = ema12Arr[ema12Arr.length - 1] || last
  const ema26Val = ema26Arr[ema26Arr.length - 1] || last

  let score = 0
  const reasons: string[] = []

  // SMA crossover
  if (sma20Val > sma50Val) { score += 20; reasons.push('SMA20 above SMA50 (Golden Cross zone)') }
  else { score -= 20; reasons.push('SMA20 below SMA50 (Death Cross zone)') }

  // EMA crossover (MACD-like)
  if (ema12Val > ema26Val) { score += 15; reasons.push('EMA12 > EMA26 — bullish MACD') }
  else { score -= 15; reasons.push('EMA12 < EMA26 — bearish MACD') }

  // Price vs SMA
  if (last > sma20Val) { score += 10; reasons.push(`Price above SMA20 (RM${sma20Val.toFixed(2)})`) }
  else { score -= 10; reasons.push(`Price below SMA20 (RM${sma20Val.toFixed(2)})`) }

  // RSI
  if (currentRsi > 70) { score -= 15; reasons.push(`RSI ${currentRsi.toFixed(0)} — overbought, pullback likely`) }
  else if (currentRsi < 30) { score += 15; reasons.push(`RSI ${currentRsi.toFixed(0)} — oversold, bounce likely`) }
  else if (currentRsi > 55) { score += 5; reasons.push(`RSI ${currentRsi.toFixed(0)} — mildly bullish`) }
  else if (currentRsi < 45) { score -= 5; reasons.push(`RSI ${currentRsi.toFixed(0)} — mildly bearish`) }
  else { reasons.push(`RSI ${currentRsi.toFixed(0)} — neutral`) }

  // Recent momentum (last 5 candles)
  const recent = closes.slice(-5)
  const recentChange = ((recent[recent.length - 1] - recent[0]) / recent[0]) * 100
  if (recentChange > 2) { score += 10; reasons.push(`Recent momentum +${recentChange.toFixed(1)}%`) }
  else if (recentChange < -2) { score -= 10; reasons.push(`Recent momentum ${recentChange.toFixed(1)}%`) }

  // Volume trend
  const recentVol = candles.slice(-5).reduce((a, c) => a + c.volume, 0) / 5
  const olderVol = candles.slice(-20, -5).reduce((a, c) => a + c.volume, 0) / 15
  if (olderVol > 0 && recentVol > olderVol * 1.5) {
    if (score > 0) { score += 5; reasons.push('Volume surge supports bullish move') }
    else { score -= 5; reasons.push('Volume surge supports bearish move') }
  }

  const confidence = Math.min(95, Math.max(20, 50 + Math.abs(score)))
  let direction: 'up' | 'down' | 'sideways' = 'sideways'
  let signal = 'Hold'
  if (score >= 25) { direction = 'up'; signal = 'Buy' }
  else if (score >= 10) { direction = 'up'; signal = 'Mild Buy' }
  else if (score <= -25) { direction = 'down'; signal = 'Sell' }
  else if (score <= -10) { direction = 'down'; signal = 'Mild Sell' }

  // Project target
  const avgRange = candles.slice(-20).reduce((a, c) => a + (c.high - c.low), 0) / 20
  const targetPrice = direction === 'up' ? last + avgRange * 2 : direction === 'down' ? last - avgRange * 2 : last
  const stopLoss = direction === 'up' ? last - avgRange * 1.5 : last + avgRange * 1.5

  return {
    direction, confidence, targetPrice, stopLoss,
    sma20: sma20Val, sma50: sma50Val,
    ema12: ema12Val, ema26: ema26Val,
    rsi: currentRsi, signal, reasons,
  }
}

interface NewsItem {
  title: string
  description: string
  source: string
  url: string
  publishedAt: string
  sentiment: number
  relevance: string
  impact: string
}

interface NewsSentiment {
  news: NewsItem[]
  aggregate: {
    avgSentiment: number
    bullishCount: number
    bearishCount: number
    neutralCount: number
    signal: string
    score: number
  }
}

export function StockChart({ symbol, sector, stockName, height = 220 }: { symbol: string; sector?: string; stockName?: string; height?: number }) {
  const [candles, setCandles] = useState<Candle[]>([])
  const [loading, setLoading] = useState(true)
  const [rangeIdx, setRangeIdx] = useState(1)
  const [chartMode, setChartMode] = useState<'candle' | 'line'>('candle')
  const [showPrediction, setShowPrediction] = useState(true)
  const [hovered, setHovered] = useState<Candle | null>(null)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [newsSentiment, setNewsSentiment] = useState<NewsSentiment | null>(null)
  const [newsLoading, setNewsLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Fetch news sentiment
  useEffect(() => {
    if (!sector) return
    setNewsLoading(true)
    fetch(`/api/news-sentiment?sector=${encodeURIComponent(sector)}&stock=${encodeURIComponent(stockName || '')}`)
      .then(r => r.json())
      .then(data => {
        setNewsSentiment(data)
        setNewsLoading(false)
      })
      .catch(() => setNewsLoading(false))
  }, [sector, stockName])

  // Recalculate prediction when news arrives
  useEffect(() => {
    if (candles.length >= 20) {
      const base = predict(candles)
      if (newsSentiment?.aggregate) {
        // Factor news into prediction
        const newsAdj = newsSentiment.aggregate.score
        let adjDirection = base.direction
        const adjConfidence = Math.min(95, base.confidence + Math.abs(newsAdj))

        // Shift target/stop based on news
        const avgRange = candles.slice(-20).reduce((a, c) => a + (c.high - c.low), 0) / 20
        let adjTarget = base.targetPrice + (newsAdj > 0 ? avgRange * 0.5 : newsAdj < 0 ? -avgRange * 0.5 : 0)
        let adjStopLoss = base.stopLoss + (newsAdj > 0 ? avgRange * 0.3 : newsAdj < 0 ? -avgRange * 0.3 : 0)

        // Strong news can flip direction
        if (newsAdj >= 10 && base.direction === 'sideways') adjDirection = 'up'
        if (newsAdj <= -10 && base.direction === 'sideways') adjDirection = 'down'
        if (newsAdj >= 10 && base.direction === 'down') adjDirection = 'sideways'
        if (newsAdj <= -10 && base.direction === 'up') adjDirection = 'sideways'

        let adjSignal = base.signal
        if (newsAdj >= 10) {
          if (base.signal === 'Hold') adjSignal = 'Mild Buy'
          if (base.signal === 'Mild Sell') adjSignal = 'Hold'
          base.reasons.push(`News sentiment bullish (${newsSentiment.aggregate.signal}) — adjusted signal upward`)
        } else if (newsAdj <= -10) {
          if (base.signal === 'Hold') adjSignal = 'Mild Sell'
          if (base.signal === 'Mild Buy') adjSignal = 'Hold'
          base.reasons.push(`News sentiment bearish (${newsSentiment.aggregate.signal}) — adjusted signal downward`)
        } else if (newsAdj !== 0) {
          base.reasons.push(`News sentiment: ${newsSentiment.aggregate.signal} (minor adjustment)`)
        }

        setPrediction({
          ...base,
          direction: adjDirection,
          confidence: adjConfidence,
          targetPrice: adjTarget,
          stopLoss: adjStopLoss,
          signal: adjSignal,
        })
      } else {
        setPrediction(base)
      }
    }
  }, [candles, newsSentiment])

  const fetchChart = useCallback(async () => {
    setLoading(true)
    try {
      const r = RANGES[rangeIdx]
      const res = await fetch(`/api/bursa-chart?symbol=${symbol}&range=${r.range}&interval=${r.interval}`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setCandles(data)
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [symbol, rangeIdx])

  useEffect(() => { fetchChart() }, [fetchChart])

  // Draw
  useEffect(() => {
    if (!canvasRef.current || candles.length < 2) return
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
    const pad = { top: 10, bottom: 20, left: 55, right: showPrediction ? 40 : 10 }
    const chartW = w - pad.left - pad.right
    const chartH = h - pad.top - pad.bottom

    ctx.clearRect(0, 0, w, h)

    // Extend price range for prediction
    const allHighs = candles.map(c => c.high)
    const allLows = candles.map(c => c.low)
    let maxP = Math.max(...allHighs)
    let minP = Math.min(...allLows)
    if (prediction && showPrediction) {
      maxP = Math.max(maxP, prediction.targetPrice)
      minP = Math.min(minP, prediction.stopLoss)
    }
    const priceRange = maxP - minP || maxP * 0.01

    const totalSlots = showPrediction ? candles.length + 8 : candles.length
    const xScale = (i: number) => pad.left + ((i + 0.5) / totalSlots) * chartW
    const yScale = (p: number) => pad.top + (1 - (p - minP) / priceRange) * chartH

    // Grid
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(pad.left, y)
      ctx.lineTo(w - pad.right, y)
      ctx.stroke()
      const price = maxP - (priceRange / 4) * i
      ctx.fillStyle = '#64748b'
      ctx.font = '9px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(price.toFixed(2), pad.left - 4, y + 3)
    }

    // Volume bars
    const maxVol = Math.max(...candles.map(c => c.volume)) || 1
    candles.forEach((c, i) => {
      const barH = (c.volume / maxVol) * chartH * 0.1
      const x = xScale(i)
      const barW = Math.max(1, (chartW / totalSlots) * 0.6)
      ctx.fillStyle = c.close >= c.open ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'
      ctx.fillRect(x - barW / 2, h - pad.bottom - barH, barW, barH)
    })

    const candleW = Math.max(2, (chartW / totalSlots) * 0.6)

    if (chartMode === 'candle') {
      // Candlesticks
      candles.forEach((c, i) => {
        const x = xScale(i)
        const isGreen = c.close >= c.open
        const color = isGreen ? '#10b981' : '#ef4444'

        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, yScale(c.high))
        ctx.lineTo(x, yScale(c.low))
        ctx.stroke()

        const bodyTop = yScale(Math.max(c.open, c.close))
        const bodyBot = yScale(Math.min(c.open, c.close))
        ctx.fillStyle = color
        ctx.fillRect(x - candleW / 2, bodyTop, candleW, Math.max(1, bodyBot - bodyTop))
      })
    } else {
      // Line chart with area
      const isUp = candles[candles.length - 1].close >= candles[0].close
      const lineColor = isUp ? '#10b981' : '#ef4444'

      ctx.beginPath()
      ctx.moveTo(xScale(0), yScale(candles[0].close))
      candles.forEach((c, i) => ctx.lineTo(xScale(i), yScale(c.close)))
      ctx.lineTo(xScale(candles.length - 1), h - pad.bottom)
      ctx.lineTo(xScale(0), h - pad.bottom)
      ctx.closePath()
      ctx.fillStyle = isUp ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(xScale(0), yScale(candles[0].close))
      candles.forEach((c, i) => ctx.lineTo(xScale(i), yScale(c.close)))
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // SMA lines (if enough data)
    const closes = candles.map(c => c.close)
    if (candles.length >= 20) {
      const sma20Arr = sma(closes, 20)
      ctx.beginPath()
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 1
      ctx.setLineDash([])
      let started = false
      sma20Arr.forEach((v, i) => {
        if (v === null) return
        if (!started) { ctx.moveTo(xScale(i), yScale(v)); started = true }
        else ctx.lineTo(xScale(i), yScale(v))
      })
      ctx.stroke()
    }

    if (candles.length >= 50) {
      const sma50Arr = sma(closes, 50)
      ctx.beginPath()
      ctx.strokeStyle = '#8b5cf6'
      ctx.lineWidth = 1
      let started = false
      sma50Arr.forEach((v, i) => {
        if (v === null) return
        if (!started) { ctx.moveTo(xScale(i), yScale(v)); started = true }
        else ctx.lineTo(xScale(i), yScale(v))
      })
      ctx.stroke()
    }

    // Prediction zone
    if (prediction && showPrediction) {
      const lastIdx = candles.length - 1
      const lastPrice = candles[lastIdx].close
      const futureIdx = candles.length + 7

      // Prediction cone
      const targetY = yScale(prediction.targetPrice)
      const stopY = yScale(prediction.stopLoss)
      const lastX = xScale(lastIdx)
      const futureX = xScale(futureIdx)

      // Shaded cone
      ctx.beginPath()
      ctx.moveTo(lastX, yScale(lastPrice))
      ctx.lineTo(futureX, targetY)
      ctx.lineTo(futureX, stopY)
      ctx.closePath()
      ctx.fillStyle = prediction.direction === 'up'
        ? 'rgba(16,185,129,0.08)'
        : prediction.direction === 'down'
        ? 'rgba(239,68,68,0.08)'
        : 'rgba(250,204,21,0.08)'
      ctx.fill()

      // Target line
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = prediction.direction === 'up' ? '#10b981' : prediction.direction === 'down' ? '#ef4444' : '#facc15'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(lastX, yScale(lastPrice))
      ctx.lineTo(futureX, yScale(prediction.targetPrice))
      ctx.stroke()

      // Stop loss line
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(lastX, yScale(lastPrice))
      ctx.lineTo(futureX, yScale(prediction.stopLoss))
      ctx.stroke()
      ctx.setLineDash([])

      // Labels
      ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillStyle = prediction.direction === 'up' ? '#10b981' : prediction.direction === 'down' ? '#ef4444' : '#facc15'
      ctx.fillText(`TP: RM${prediction.targetPrice.toFixed(2)}`, futureX + 2, targetY + 3)
      ctx.fillStyle = '#ef4444'
      ctx.fillText(`SL: RM${prediction.stopLoss.toFixed(2)}`, futureX + 2, stopY + 3)

      // "PREDICTION" zone label
      const midX = (lastX + futureX) / 2
      ctx.fillStyle = 'rgba(100,116,139,0.3)'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('PREDICTION', midX, pad.top + 12)
    }

    // Time labels
    ctx.fillStyle = '#64748b'
    ctx.font = '9px monospace'
    ctx.textAlign = 'center'
    const step = Math.max(1, Math.floor(candles.length / 5))
    candles.forEach((c, i) => {
      if (i % step === 0) {
        const d = new Date(c.time)
        const label = RANGES[rangeIdx].interval === '15m'
          ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : d.toLocaleDateString([], { month: 'short', day: 'numeric' })
        ctx.fillText(label, xScale(i), h - 3)
      }
    })

  }, [candles, rangeIdx, chartMode, showPrediction, prediction])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || candles.length < 2) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const padLeft = 55
    const chartW = rect.width - padLeft - (showPrediction ? 40 : 10)
    const totalSlots = showPrediction ? candles.length + 8 : candles.length
    const idx = Math.round(((x - padLeft) / chartW) * totalSlots - 0.5)
    if (idx >= 0 && idx < candles.length) setHovered(candles[idx])
    else setHovered(null)
  }

  const totalChange = candles.length >= 2
    ? ((candles[candles.length - 1].close - candles[0].close) / candles[0].close) * 100
    : 0
  const highPrice = candles.length > 0 ? Math.max(...candles.map(c => c.high)) : 0
  const lowPrice = candles.length > 0 ? Math.min(...candles.map(c => c.low)) : 0

  return (
    <div className="space-y-2">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* Range selector */}
          <div className="flex gap-0.5 p-0.5 bg-gray-100 dark:bg-slate-800 rounded-md">
            {RANGES.map((r, i) => (
              <button key={r.label} onClick={() => setRangeIdx(i)}
                className={cn('px-2 py-1 text-[11px] font-medium rounded transition-colors',
                  rangeIdx === i ? 'bg-[#1a73e8] text-white' : 'text-gray-500 dark:text-slate-400 hover:text-white'
                )}>{r.label}</button>
            ))}
          </div>

          {/* Chart mode toggle */}
          <div className="flex gap-0.5 p-0.5 bg-gray-100 dark:bg-slate-800 rounded-md">
            <button onClick={() => setChartMode('candle')}
              className={cn('p-1 rounded transition-colors', chartMode === 'candle' ? 'bg-[#1a73e8] text-white' : 'text-gray-500 dark:text-slate-400')}
              title="Candlestick">
              <CandleIcon className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setChartMode('line')}
              className={cn('p-1 rounded transition-colors', chartMode === 'line' ? 'bg-[#1a73e8] text-white' : 'text-gray-500 dark:text-slate-400')}
              title="Line chart">
              <LineChart className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Prediction toggle */}
          <button onClick={() => setShowPrediction(!showPrediction)}
            className={cn('flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-colors',
              showPrediction ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-600'
            )}>
            <Brain className="w-3 h-3" />
            Predict
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs">
          {candles.length > 0 && (
            <>
              <span className="text-gray-400">H: <span className="text-gray-200 font-mono">{highPrice.toFixed(2)}</span></span>
              <span className="text-gray-400">L: <span className="text-gray-200 font-mono">{lowPrice.toFixed(2)}</span></span>
              <span className={cn('font-bold font-mono', totalChange >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
              </span>
            </>
          )}
          {/* MA legend */}
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500 inline-block" />SMA20</span>
          {candles.length >= 50 && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-500 inline-block" />SMA50</span>}
        </div>
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <div className="flex items-center gap-3 text-[10px] px-1">
          <span className="text-gray-400">{new Date(hovered.time).toLocaleDateString()}</span>
          <span className="text-gray-400">O:<span className="text-gray-200 ml-0.5">{hovered.open.toFixed(2)}</span></span>
          <span className="text-gray-400">H:<span className="text-emerald-400 ml-0.5">{hovered.high.toFixed(2)}</span></span>
          <span className="text-gray-400">L:<span className="text-rose-400 ml-0.5">{hovered.low.toFixed(2)}</span></span>
          <span className="text-gray-400">C:<span className={cn('ml-0.5', hovered.close >= hovered.open ? 'text-emerald-400' : 'text-rose-400')}>{hovered.close.toFixed(2)}</span></span>
          <span className="text-gray-400">Vol:<span className="text-gray-200 ml-0.5">{(hovered.volume / 1e6).toFixed(1)}M</span></span>
        </div>
      )}

      {/* Canvas */}
      {loading ? (
        <div style={{ height }} className="flex items-center justify-center rounded-lg bg-slate-900/30">
          <div className="w-4 h-4 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : candles.length < 2 ? (
        <div style={{ height }} className="flex items-center justify-center rounded-lg bg-slate-900/30 text-xs text-gray-500">
          No chart data available
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height }}
          className="cursor-crosshair rounded-lg"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}
        />
      )}

      {/* Prediction Panel */}
      {prediction && showPrediction && (
        <div className={cn(
          'rounded-lg border p-3 space-y-2',
          prediction.direction === 'up' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' :
          prediction.direction === 'down' ? 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800' :
          'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300">AI Prediction</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-bold',
                prediction.signal.includes('Buy') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                prediction.signal.includes('Sell') ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              )}>
                {prediction.signal}
              </span>
            </div>
            <span className="text-[10px] text-gray-400">Confidence: {prediction.confidence.toFixed(0)}%</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-gray-400 dark:text-slate-500">Target</span>
              <p className="font-bold font-mono text-emerald-500">RM {prediction.targetPrice.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-400 dark:text-slate-500">Stop Loss</span>
              <p className="font-bold font-mono text-rose-500">RM {prediction.stopLoss.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-400 dark:text-slate-500">RSI</span>
              <p className={cn('font-bold font-mono', prediction.rsi > 70 ? 'text-rose-500' : prediction.rsi < 30 ? 'text-emerald-500' : 'text-gray-300')}>{prediction.rsi.toFixed(0)}</p>
            </div>
            <div>
              <span className="text-gray-400 dark:text-slate-500">MACD</span>
              <p className={cn('font-bold font-mono', prediction.ema12 > prediction.ema26 ? 'text-emerald-500' : 'text-rose-500')}>
                {prediction.ema12 > prediction.ema26 ? 'Bullish' : 'Bearish'}
              </p>
            </div>
          </div>

          <div className="space-y-0.5">
            {prediction.reasons.map((r, i) => (
              <p key={i} className="text-[10px] text-gray-500 dark:text-slate-400 flex items-start gap-1">
                <span className="text-gray-400 mt-0.5">•</span>{r}
              </p>
            ))}
          </div>
          <p className="text-[9px] text-gray-400 dark:text-slate-600 italic">
            Based on SMA/EMA crossover, RSI, momentum, volume & news sentiment. Not financial advice.
          </p>
        </div>
      )}

      {/* News Sentiment Panel */}
      {showPrediction && newsSentiment && newsSentiment.news.length > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#1a73e8]" />
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300">News Sentiment</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-bold',
                newsSentiment.aggregate.signal.includes('Bullish') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                newsSentiment.aggregate.signal.includes('Bearish') ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400'
              )}>
                {newsSentiment.aggregate.signal}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-emerald-500">{newsSentiment.aggregate.bullishCount} bullish</span>
              <span className="text-gray-400">|</span>
              <span className="text-rose-500">{newsSentiment.aggregate.bearishCount} bearish</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-400">{newsSentiment.aggregate.neutralCount} neutral</span>
            </div>
          </div>

          {/* Sentiment bar */}
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700">
            {newsSentiment.aggregate.bullishCount > 0 && (
              <div className="bg-emerald-500" style={{ width: `${(newsSentiment.aggregate.bullishCount / newsSentiment.news.length) * 100}%` }} />
            )}
            {newsSentiment.aggregate.neutralCount > 0 && (
              <div className="bg-gray-400" style={{ width: `${(newsSentiment.aggregate.neutralCount / newsSentiment.news.length) * 100}%` }} />
            )}
            {newsSentiment.aggregate.bearishCount > 0 && (
              <div className="bg-rose-500" style={{ width: `${(newsSentiment.aggregate.bearishCount / newsSentiment.news.length) * 100}%` }} />
            )}
          </div>

          {/* News items */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {newsSentiment.news.map((n, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px]">
                <div className="flex-shrink-0 mt-0.5">
                  {n.sentiment > 0 ? <TrendingUp className="w-3 h-3 text-emerald-500" /> :
                   n.sentiment < 0 ? <TrendingDown className="w-3 h-3 text-rose-500" /> :
                   <Minus className="w-3 h-3 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <a href={n.url} target="_blank" rel="noopener noreferrer"
                    className="text-gray-700 dark:text-slate-300 hover:text-[#1a73e8] line-clamp-1">
                    {n.title}
                  </a>
                  {n.impact && (
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{n.impact}</p>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 flex-shrink-0">{n.source}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {newsLoading && showPrediction && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-3 h-3 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
          Loading news sentiment...
        </div>
      )}
    </div>
  )
}
