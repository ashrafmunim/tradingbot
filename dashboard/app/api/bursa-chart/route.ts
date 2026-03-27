import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const YF_API = 'https://query1.finance.yahoo.com/v8/finance/chart'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const range = searchParams.get('range') || '1mo' // 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y
  const interval = searchParams.get('interval') || '1d'

  if (!symbol) {
    return NextResponse.json({ error: 'symbol required' }, { status: 400 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(
      `${YF_API}/${symbol}?range=${range}&interval=${interval}`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }
    )

    if (!res.ok) throw new Error(`Yahoo Finance: ${res.status}`)

    const data = await res.json()
    const result = data?.chart?.result?.[0]
    if (!result) return NextResponse.json([])

    const timestamps = result.timestamp || []
    const quotes = result.indicators?.quote?.[0] || {}
    const opens = quotes.open || []
    const highs = quotes.high || []
    const lows = quotes.low || []
    const closes = quotes.close || []
    const volumes = quotes.volume || []

    const candles = timestamps.map((ts: number, i: number) => ({
      time: ts * 1000,
      open: opens[i] || 0,
      high: highs[i] || 0,
      low: lows[i] || 0,
      close: closes[i] || 0,
      volume: volumes[i] || 0,
    })).filter((c: any) => c.close > 0)

    return NextResponse.json(candles)
  } catch (error: any) {
    if (error.name === 'AbortError') return NextResponse.json([])
    console.error('Bursa chart error:', error.message)
    return NextResponse.json([])
  } finally {
    clearTimeout(timeout)
  }
}
