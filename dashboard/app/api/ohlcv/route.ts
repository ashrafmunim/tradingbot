import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GECKO_API = 'https://api.geckoterminal.com/api/v2'

// GeckoTerminal max per request is 1000
const PAGE_SIZE = 1000

async function fetchPage(pool: string, timeframe: string, aggregate: number, limit: number, before?: number) {
  let url = `${GECKO_API}/networks/solana/pools/${pool}/ohlcv/${timeframe}?aggregate=${aggregate}&limit=${limit}&currency=usd`
  if (before) url += `&before_timestamp=${before}`

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  })

  if (!res.ok) throw new Error(`GeckoTerminal: ${res.status}`)

  const json = await res.json()
  return json?.data?.attributes?.ohlcv_list || []
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pool = searchParams.get('pool')
  const tf = searchParams.get('tf') || '15m'
  const limit = parseInt(searchParams.get('limit') || '1000')

  if (!pool) {
    return NextResponse.json({ error: 'pool parameter required' }, { status: 400 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const tfMap: Record<string, string> = {
      '1m': 'minute',
      '5m': 'minute',
      '15m': 'minute',
      '1h': 'hour',
      '4h': 'hour',
      '1d': 'day',
    }
    const aggregate: Record<string, number> = {
      '1m': 1,
      '5m': 5,
      '15m': 15,
      '1h': 1,
      '4h': 4,
      '1d': 1,
    }
    const agg = aggregate[tf] || 15
    const timeframe = tfMap[tf] || 'minute'

    let allCandles: number[][] = []
    let remaining = limit
    let beforeTs: number | undefined = undefined

    // Paginate to get more data
    while (remaining > 0) {
      const pageLimit = Math.min(remaining, PAGE_SIZE)
      const page = await fetchPage(pool, timeframe, agg, pageLimit, beforeTs)

      if (page.length === 0) break

      allCandles = [...allCandles, ...page]
      remaining -= page.length

      // GeckoTerminal returns newest first, so last item is oldest
      const oldestTs = page[page.length - 1][0]
      beforeTs = oldestTs

      // Stop if we got less than requested (no more data)
      if (page.length < pageLimit) break

      // Max 3 pages to avoid rate limiting
      if (allCandles.length >= PAGE_SIZE * 3) break
    }

    // Convert and reverse to oldest-first
    const candles = allCandles.map((c: number[]) => ({
      time: c[0] * 1000,
      open: c[1],
      high: c[2],
      low: c[3],
      close: c[4],
      volume: c[5],
    })).reverse()

    // Deduplicate by timestamp
    const seen = new Set<number>()
    const unique = candles.filter(c => {
      if (seen.has(c.time)) return false
      seen.add(c.time)
      return true
    })

    return NextResponse.json(unique)
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json([])
    }
    console.error('OHLCV fetch error:', error.message)
    return NextResponse.json([])
  } finally {
    clearTimeout(timeout)
  }
}
