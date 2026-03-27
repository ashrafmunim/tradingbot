'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface CandlestickChartProps {
  pool: string
  height?: number
  tf?: string
}

export function CandlestickChart({ pool, height = 180, tf = '15m' }: CandlestickChartProps) {
  const [candles, setCandles] = useState<Candle[]>([])
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState<Candle | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const fetchCandles = useCallback(async () => {
    try {
      const res = await fetch(`/api/ohlcv?pool=${pool}&tf=${tf}&limit=48`)
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setCandles(data)
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [pool, tf])

  useEffect(() => {
    fetchCandles()
    const id = setInterval(fetchCandles, 30000)
    return () => clearInterval(id)
  }, [fetchCandles])

  useEffect(() => {
    if (!canvasRef.current || candles.length === 0) return

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
    const padding = { top: 8, bottom: 8, left: 4, right: 4 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom

    // Clear
    ctx.clearRect(0, 0, w, h)

    // Find price range
    const highs = candles.map(c => c.high)
    const lows = candles.map(c => c.low)
    const maxPrice = Math.max(...highs)
    const minPrice = Math.min(...lows)
    const priceRange = maxPrice - minPrice || maxPrice * 0.01

    // Scale helpers
    const xScale = (i: number) => padding.left + (i / (candles.length - 1 || 1)) * chartW
    const yScale = (price: number) => padding.top + (1 - (price - minPrice) / priceRange) * chartH

    const candleWidth = Math.max(2, (chartW / candles.length) * 0.6)
    const wickWidth = 1

    candles.forEach((candle, i) => {
      const x = padding.left + ((i + 0.5) / candles.length) * chartW
      const isGreen = candle.close >= candle.open
      const color = isGreen ? '#10b981' : '#ef4444'

      // Wick (high to low)
      ctx.strokeStyle = color
      ctx.lineWidth = wickWidth
      ctx.beginPath()
      ctx.moveTo(x, yScale(candle.high))
      ctx.lineTo(x, yScale(candle.low))
      ctx.stroke()

      // Body (open to close)
      const bodyTop = yScale(Math.max(candle.open, candle.close))
      const bodyBottom = yScale(Math.min(candle.open, candle.close))
      const bodyHeight = Math.max(1, bodyBottom - bodyTop)

      ctx.fillStyle = color
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight)
    })

    // Volume bars at bottom (subtle)
    const maxVol = Math.max(...candles.map(c => c.volume)) || 1
    const volHeight = chartH * 0.15

    candles.forEach((candle, i) => {
      const x = padding.left + ((i + 0.5) / candles.length) * chartW
      const isGreen = candle.close >= candle.open
      const barH = (candle.volume / maxVol) * volHeight

      ctx.fillStyle = isGreen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
      ctx.fillRect(x - candleWidth / 2, h - padding.bottom - barH, candleWidth, barH)
    })
  }, [candles])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || candles.length === 0) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const idx = Math.floor((x / rect.width) * candles.length)
    if (idx >= 0 && idx < candles.length) {
      setHovered(candles[idx])
    }
  }

  const formatPrice = (p: number) => {
    if (p < 0.0001) return p.toExponential(3)
    if (p < 0.01) return p.toFixed(6)
    if (p < 1) return p.toFixed(4)
    return p.toFixed(2)
  }

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (candles.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-gray-400 dark:text-slate-500">
        No chart data available
      </div>
    )
  }

  const last = candles[candles.length - 1]
  const first = candles[0]
  const totalChange = first.open > 0 ? ((last.close - first.open) / first.open) * 100 : 0

  return (
    <div className="relative">
      {/* OHLCV tooltip */}
      {hovered && (
        <div className="absolute top-0 left-0 right-0 flex items-center gap-3 text-[10px] z-10 px-1">
          <span className="text-gray-400">{formatTime(hovered.time)}</span>
          <span className="text-gray-400">O:<span className="text-gray-200 ml-0.5">{formatPrice(hovered.open)}</span></span>
          <span className="text-gray-400">H:<span className="text-emerald-400 ml-0.5">{formatPrice(hovered.high)}</span></span>
          <span className="text-gray-400">L:<span className="text-rose-400 ml-0.5">{formatPrice(hovered.low)}</span></span>
          <span className="text-gray-400">C:<span className={cn('ml-0.5', hovered.close >= hovered.open ? 'text-emerald-400' : 'text-rose-400')}>{formatPrice(hovered.close)}</span></span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{ width: '100%', height }}
        className="cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      />

      {/* Summary bar */}
      <div className="flex items-center justify-between text-[10px] px-1 -mt-1">
        <span className="text-gray-400 dark:text-slate-500">{tf} candles</span>
        <span className={cn(
          'font-medium',
          totalChange >= 0 ? 'text-emerald-500' : 'text-rose-500'
        )}>
          {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}
