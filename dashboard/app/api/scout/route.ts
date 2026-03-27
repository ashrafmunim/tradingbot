import { NextResponse } from 'next/server'

const DEXSCREENER_API = 'https://api.dexscreener.com'

interface TokenCandidate {
  address: string
  chainId: string
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
  dexId: string
  url: string
  imageUrl: string | null
  createdAt: number | null
}

function scoreToken(t: TokenCandidate) {
  let score = 50 // neutral baseline

  // --- Price Momentum (weighted by recency) ---
  const momentum =
    t.priceChange5m * 0.15 +
    t.priceChange1h * 0.25 +
    t.priceChange6h * 0.30 +
    t.priceChange24h * 0.30

  score += Math.max(-30, Math.min(30, momentum * 0.6))

  // --- Buy Pressure ---
  const total5m = t.buys5m + t.sells5m
  const total1h = t.buys1h + t.sells1h
  const total24h = t.buys24h + t.sells24h

  const bp5m = total5m > 0 ? t.buys5m / total5m : 0.5
  const bp1h = total1h > 0 ? t.buys1h / total1h : 0.5
  const bp24h = total24h > 0 ? t.buys24h / total24h : 0.5
  const avgBP = bp5m * 0.3 + bp1h * 0.4 + bp24h * 0.3

  score += (avgBP - 0.5) * 40

  // --- Volume Health ---
  // High volume relative to market cap = active trading
  if (t.marketCap > 0) {
    const volMcapRatio = t.volume24h / t.marketCap
    if (volMcapRatio > 0.5) score += 5
    if (volMcapRatio > 1.0) score += 5
  }

  // --- Liquidity Safety ---
  if (t.liquidity >= 100000) score += 5
  else if (t.liquidity >= 50000) score += 2
  else if (t.liquidity < 10000) score -= 10
  else if (t.liquidity < 5000) score -= 20

  // --- Momentum Alignment ---
  const shortBull = t.priceChange5m > 0 && t.priceChange1h > 0
  const longBull = t.priceChange6h > 0 && t.priceChange24h > 0
  if (shortBull && longBull) score += 8
  if (!shortBull && !longBull) score -= 8

  // --- Acceleration Bonus ---
  if (t.priceChange5m > 0 && t.priceChange5m > t.priceChange1h / 12) score += 3
  if (t.priceChange5m < 0 && t.priceChange5m < t.priceChange1h / 12) score -= 3

  // --- Transaction Activity ---
  if (total1h > 100) score += 3
  if (total1h > 500) score += 3
  if (total1h < 10) score -= 5

  score = Math.max(0, Math.min(100, score))

  // Signal
  let signal: string
  let signalColor: string
  if (score >= 75) { signal = 'Strong Buy'; signalColor = 'emerald' }
  else if (score >= 60) { signal = 'Buy'; signalColor = 'emerald' }
  else if (score >= 45) { signal = 'Hold'; signalColor = 'amber' }
  else if (score >= 30) { signal = 'Sell'; signalColor = 'rose' }
  else { signal = 'Strong Sell'; signalColor = 'rose' }

  // Reasoning
  const reasons: string[] = []
  if (momentum > 5) reasons.push(`Strong upward momentum (${momentum.toFixed(1)}% weighted)`)
  else if (momentum > 0) reasons.push(`Positive momentum (${momentum.toFixed(1)}% weighted)`)
  else if (momentum < -5) reasons.push(`Downward momentum (${momentum.toFixed(1)}% weighted)`)

  if (avgBP > 0.6) reasons.push(`Heavy buying (${Math.round(avgBP * 100)}% buy pressure)`)
  if (avgBP < 0.4) reasons.push(`Heavy selling (${Math.round((1 - avgBP) * 100)}% sell pressure)`)

  if (shortBull && longBull) reasons.push('All timeframes aligned bullish')
  if (t.liquidity < 10000) reasons.push('Low liquidity — high risk')
  if (t.liquidity >= 100000) reasons.push('Good liquidity pool')
  if (total1h > 200) reasons.push(`High activity: ${total1h} txns/hr`)

  const liquidityRisk = t.liquidity < 5000 ? 'critical' : t.liquidity < 20000 ? 'high' : t.liquidity < 100000 ? 'moderate' : 'low'

  return {
    score,
    signal,
    signalColor,
    reasons,
    liquidityRisk,
    momentum: Math.round(momentum * 100) / 100,
    buyPressure: Math.round(avgBP * 100),
  }
}

async function fetchTrendingTokens(): Promise<TokenCandidate[]> {
  const candidates: TokenCandidate[] = []
  const seen = new Set<string>()

  // 1. Fetch boosted tokens (promoted/trending)
  try {
    const boostRes = await fetch(`${DEXSCREENER_API}/token-boosts/top/v1`, { next: { revalidate: 30 } })
    if (boostRes.ok) {
      const boostData = await boostRes.json()
      const solTokens = (boostData || [])
        .filter((t: any) => t.chainId === 'solana')
        .slice(0, 15)

      // Fetch full pair data for each
      const addresses = solTokens.map((t: any) => t.tokenAddress).filter((a: string) => !seen.has(a))
      for (const addr of addresses) {
        seen.add(addr)
      }

      if (addresses.length > 0) {
        // DexScreener supports comma-separated token lookup
        const batchRes = await fetch(
          `${DEXSCREENER_API}/latest/dex/tokens/${addresses.join(',')}`,
          { next: { revalidate: 30 } }
        )
        if (batchRes.ok) {
          const batchData = await batchRes.json()
          const pairs = batchData.pairs || []
          // Group by base token and pick best pair per token
          const tokenPairs = new Map<string, any>()
          for (const p of pairs) {
            if (p.chainId !== 'solana') continue
            const addr = p.baseToken?.address
            if (!addr) continue
            const existing = tokenPairs.get(addr)
            if (!existing || (p.liquidity?.usd || 0) > (existing.liquidity?.usd || 0)) {
              tokenPairs.set(addr, p)
            }
          }
          for (const [addr, p] of tokenPairs) {
            candidates.push(pairToCandidate(p, addr))
          }
        }
      }
    }
  } catch (e) {
    console.error('Boost fetch error:', e)
  }

  // 2. Fetch latest token profiles (newly listed)
  try {
    const profileRes = await fetch(`${DEXSCREENER_API}/token-profiles/latest/v1`, { next: { revalidate: 30 } })
    if (profileRes.ok) {
      const profileData = await profileRes.json()
      const solTokens = (profileData || [])
        .filter((t: any) => t.chainId === 'solana' && !seen.has(t.tokenAddress))
        .slice(0, 10)

      const addresses = solTokens.map((t: any) => t.tokenAddress)
      for (const addr of addresses) seen.add(addr)

      if (addresses.length > 0) {
        const batchRes = await fetch(
          `${DEXSCREENER_API}/latest/dex/tokens/${addresses.join(',')}`,
          { next: { revalidate: 30 } }
        )
        if (batchRes.ok) {
          const batchData = await batchRes.json()
          const pairs = batchData.pairs || []
          const tokenPairs = new Map<string, any>()
          for (const p of pairs) {
            if (p.chainId !== 'solana') continue
            const addr = p.baseToken?.address
            if (!addr) continue
            const existing = tokenPairs.get(addr)
            if (!existing || (p.liquidity?.usd || 0) > (existing.liquidity?.usd || 0)) {
              tokenPairs.set(addr, p)
            }
          }
          for (const [addr, p] of tokenPairs) {
            if (!candidates.find(c => c.address === addr)) {
              candidates.push(pairToCandidate(p, addr))
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Profile fetch error:', e)
  }

  // 3. Search for popular Solana memecoins
  const searchTerms = ['solana meme', 'pump sol']
  for (const q of searchTerms) {
    try {
      const searchRes = await fetch(
        `${DEXSCREENER_API}/latest/dex/search?q=${encodeURIComponent(q)}`,
        { next: { revalidate: 60 } }
      )
      if (searchRes.ok) {
        const searchData = await searchRes.json()
        const pairs = (searchData.pairs || [])
          .filter((p: any) => p.chainId === 'solana' && !seen.has(p.baseToken?.address))
          .slice(0, 10)

        for (const p of pairs) {
          const addr = p.baseToken?.address
          if (addr && !seen.has(addr)) {
            seen.add(addr)
            candidates.push(pairToCandidate(p, addr))
          }
        }
      }
    } catch (e) {
      console.error(`Search fetch error for "${q}":`, e)
    }
  }

  return candidates
}

function pairToCandidate(p: any, address: string): TokenCandidate {
  return {
    address,
    chainId: p.chainId || 'solana',
    symbol: p.baseToken?.symbol || '???',
    name: p.baseToken?.name || 'Unknown',
    priceUsd: parseFloat(p.priceUsd || '0'),
    marketCap: p.marketCap || p.fdv || 0,
    liquidity: p.liquidity?.usd || 0,
    volume24h: p.volume?.h24 || 0,
    priceChange5m: p.priceChange?.m5 || 0,
    priceChange1h: p.priceChange?.h1 || 0,
    priceChange6h: p.priceChange?.h6 || 0,
    priceChange24h: p.priceChange?.h24 || 0,
    buys5m: p.txns?.m5?.buys || 0,
    sells5m: p.txns?.m5?.sells || 0,
    buys1h: p.txns?.h1?.buys || 0,
    sells1h: p.txns?.h1?.sells || 0,
    buys24h: p.txns?.h24?.buys || 0,
    sells24h: p.txns?.h24?.sells || 0,
    pairAddress: p.pairAddress || '',
    dexId: p.dexId || '',
    url: p.url || '',
    imageUrl: p.info?.imageUrl || null,
    createdAt: p.pairCreatedAt || null,
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const minLiquidity = parseInt(searchParams.get('minLiquidity') || '1000')
    const minVolume = parseInt(searchParams.get('minVolume') || '500')
    const maxMarketCap = parseInt(searchParams.get('maxMarketCap') || '100000')
    const limit = parseInt(searchParams.get('limit') || '20')

    const allCandidates = await fetchTrendingTokens()

    // Filter: minimum liquidity & volume, max market cap
    const filtered = allCandidates.filter(t =>
      t.liquidity >= minLiquidity &&
      t.volume24h >= minVolume &&
      t.priceUsd > 0 &&
      (maxMarketCap === 0 || (t.marketCap > 0 && t.marketCap <= maxMarketCap))
    )

    // Score and rank
    const scored = filtered.map(t => ({
      ...t,
      analysis: scoreToken(t),
    }))

    // Sort by score descending
    scored.sort((a, b) => b.analysis.score - a.analysis.score)

    const topPicks = scored.slice(0, limit)

    return NextResponse.json({
      tokens: topPicks,
      meta: {
        totalScanned: allCandidates.length,
        afterFilter: filtered.length,
        returned: topPicks.length,
        filters: { minLiquidity, minVolume, maxMarketCap },
      },
      updatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Scout error:', error)
    return NextResponse.json({ error: 'Failed to scout tokens' }, { status: 500 })
  }
}
