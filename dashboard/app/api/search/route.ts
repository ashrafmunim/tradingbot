import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/search'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q || q.trim().length < 2) {
    return NextResponse.json([])
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const res = await fetch(`${DEXSCREENER_API}?q=${encodeURIComponent(q.trim())}`, {
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`DexScreener: ${res.status}`)

    const data = await res.json()
    const pairs = (data.pairs || [])
      .filter((p: any) => p.chainId === 'solana')
      .slice(0, 20)

    const results = pairs.map((p: any) => ({
      symbol: p.baseToken?.symbol || '???',
      name: p.baseToken?.name || 'Unknown',
      address: p.baseToken?.address || '',
      pairAddress: p.pairAddress || '',
      priceUsd: parseFloat(p.priceUsd || '0'),
      priceChange24h: p.priceChange?.h24 || 0,
      volume24h: p.volume?.h24 || 0,
      marketCap: p.marketCap || p.fdv || 0,
      liquidity: p.liquidity?.usd || 0,
      dexId: p.dexId || '',
      url: p.url || '',
    }))

    return NextResponse.json(results)
  } catch (error: any) {
    if (error.name === 'AbortError') return NextResponse.json([])
    return NextResponse.json([])
  } finally {
    clearTimeout(timeout)
  }
}
