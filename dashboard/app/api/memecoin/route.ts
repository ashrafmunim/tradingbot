import { NextResponse } from 'next/server'

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/tokens'

const ALLOWED_TOKENS = [
  'ByeKZWmkmJB3Yqayx5sRdHawiZAZQcnqQmceMCRVpump',
  'ASwb21az441NXoGP524CHnjnSKYdCpzpqsHoaDi5pump',
]

function analyzeToken(pair: any, address: string) {
  const priceUsd = parseFloat(pair.priceUsd || '0')
  const priceChange5m = pair.priceChange?.m5 || 0
  const priceChange1h = pair.priceChange?.h1 || 0
  const priceChange6h = pair.priceChange?.h6 || 0
  const priceChange24h = pair.priceChange?.h24 || 0

  const volume5m = pair.volume?.m5 || 0
  const volume1h = pair.volume?.h1 || 0
  const volume6h = pair.volume?.h6 || 0
  const volume24h = pair.volume?.h24 || 0

  const buys5m = pair.txns?.m5?.buys || 0
  const sells5m = pair.txns?.m5?.sells || 0
  const buys1h = pair.txns?.h1?.buys || 0
  const sells1h = pair.txns?.h1?.sells || 0
  const buys6h = pair.txns?.h6?.buys || 0
  const sells6h = pair.txns?.h6?.sells || 0
  const buys24h = pair.txns?.h24?.buys || 0
  const sells24h = pair.txns?.h24?.sells || 0

  // --- Trend Analysis ---
  const changes = [
    { tf: '5m', change: priceChange5m, weight: 0.15 },
    { tf: '1h', change: priceChange1h, weight: 0.25 },
    { tf: '6h', change: priceChange6h, weight: 0.30 },
    { tf: '24h', change: priceChange24h, weight: 0.30 },
  ]
  const weightedMomentum = changes.reduce((acc, c) => acc + c.change * c.weight, 0)

  const buyPressure5m = buys5m + sells5m > 0 ? buys5m / (buys5m + sells5m) : 0.5
  const buyPressure1h = buys1h + sells1h > 0 ? buys1h / (buys1h + sells1h) : 0.5
  const buyPressure6h = buys6h + sells6h > 0 ? buys6h / (buys6h + sells6h) : 0.5
  const buyPressure24h = buys24h + sells24h > 0 ? buys24h / (buys24h + sells24h) : 0.5

  const avgBuyPressure = buyPressure5m * 0.2 + buyPressure1h * 0.3 + buyPressure6h * 0.25 + buyPressure24h * 0.25

  const hourlyVol24h = volume24h / 24
  const volumeTrend = hourlyVol24h > 0 ? (volume1h / hourlyVol24h) : 1

  const momentumScore = Math.max(-50, Math.min(50, weightedMomentum))
  const pressureScore = (avgBuyPressure - 0.5) * 60
  const volumeBoost = Math.min(20, Math.max(-10, (volumeTrend - 1) * 10))
  const volumeScore = momentumScore >= 0 ? volumeBoost : -volumeBoost

  const trendScore = Math.max(-100, Math.min(100, momentumScore + pressureScore + volumeScore))

  // Direction label
  let direction: string
  let directionIcon: string
  if (trendScore >= 40) { direction = 'Strong Uptrend'; directionIcon = 'rocket' }
  else if (trendScore >= 15) { direction = 'Uptrend'; directionIcon = 'trending-up' }
  else if (trendScore >= -15) { direction = 'Sideways'; directionIcon = 'minus' }
  else if (trendScore >= -40) { direction = 'Downtrend'; directionIcon = 'trending-down' }
  else { direction = 'Strong Downtrend'; directionIcon = 'skull' }

  // --- Buy/Sell Signal ---
  // Factors: trend score, buy pressure, volume, liquidity, momentum alignment
  const liquidity = pair.liquidity?.usd || 0
  const marketCap = pair.marketCap || pair.fdv || 0

  // Liquidity risk: low liquidity = dangerous
  const liquidityRisk = liquidity < 5000 ? 'critical' : liquidity < 20000 ? 'high' : liquidity < 100000 ? 'moderate' : 'low'

  // Short-term vs long-term alignment
  const shortTermBullish = priceChange5m > 0 && priceChange1h > 0
  const longTermBullish = priceChange6h > 0 && priceChange24h > 0
  const aligned = (shortTermBullish && longTermBullish) || (!shortTermBullish && !longTermBullish)

  // Momentum acceleration: is short-term stronger than long-term?
  const momentumAccelerating = Math.abs(priceChange1h) > Math.abs(priceChange6h / 6)

  // Signal scoring (0-100 for buy strength, where 50 = neutral)
  let signalScore = 50

  // Trend score contribution (biggest factor)
  signalScore += trendScore * 0.3

  // Buy pressure contribution
  signalScore += (avgBuyPressure - 0.5) * 30

  // Alignment bonus
  if (aligned && shortTermBullish) signalScore += 8
  if (aligned && !shortTermBullish) signalScore -= 8

  // Momentum acceleration
  if (momentumAccelerating && shortTermBullish) signalScore += 5
  if (momentumAccelerating && !shortTermBullish) signalScore -= 5

  // Volume surge bonus (high volume + bullish = stronger signal)
  if (volumeTrend > 2 && trendScore > 0) signalScore += 5
  if (volumeTrend > 2 && trendScore < 0) signalScore -= 5

  // Liquidity penalty
  if (liquidityRisk === 'critical') signalScore = Math.min(signalScore, 55) // cap buy signal if no liquidity
  if (liquidityRisk === 'high') signalScore = Math.min(signalScore, 65)

  signalScore = Math.max(0, Math.min(100, signalScore))

  // Generate signal
  let signal: string
  let signalColor: string
  let signalReasoning: string[] = []

  if (signalScore >= 75) {
    signal = 'Strong Buy'
    signalColor = 'emerald'
  } else if (signalScore >= 60) {
    signal = 'Buy'
    signalColor = 'emerald'
  } else if (signalScore >= 45) {
    signal = 'Hold'
    signalColor = 'amber'
  } else if (signalScore >= 30) {
    signal = 'Sell'
    signalColor = 'rose'
  } else {
    signal = 'Strong Sell'
    signalColor = 'rose'
  }

  // Build reasoning
  if (trendScore >= 15) signalReasoning.push('Price trending upward across timeframes')
  if (trendScore <= -15) signalReasoning.push('Price trending downward across timeframes')
  if (avgBuyPressure > 0.6) signalReasoning.push(`Strong buy pressure (${Math.round(avgBuyPressure * 100)}% buys)`)
  if (avgBuyPressure < 0.4) signalReasoning.push(`Heavy sell pressure (${Math.round((1 - avgBuyPressure) * 100)}% sells)`)
  if (volumeTrend > 2) signalReasoning.push(`Volume surge: ${volumeTrend.toFixed(1)}x above average`)
  if (volumeTrend < 0.3) signalReasoning.push('Volume drying up — low interest')
  if (aligned && shortTermBullish) signalReasoning.push('Short & long term momentum aligned bullish')
  if (aligned && !shortTermBullish) signalReasoning.push('Short & long term momentum aligned bearish')
  if (!aligned && shortTermBullish) signalReasoning.push('Short-term bounce but long-term still bearish')
  if (!aligned && !shortTermBullish) signalReasoning.push('Short-term dip but long-term still bullish')
  if (liquidityRisk === 'critical') signalReasoning.push('DANGER: Extremely low liquidity — high slippage risk')
  if (liquidityRisk === 'high') signalReasoning.push('Warning: Low liquidity — be cautious with size')
  if (momentumAccelerating && shortTermBullish) signalReasoning.push('Momentum accelerating upward')
  if (momentumAccelerating && !shortTermBullish) signalReasoning.push('Momentum accelerating downward')

  if (signalReasoning.length === 0) signalReasoning.push('No strong signals detected — market is indecisive')

  return {
    token: {
      name: pair.baseToken?.name || 'Unknown',
      symbol: pair.baseToken?.symbol || '???',
      address,
      priceUsd,
      marketCap,
      liquidity,
      pairAddress: pair.pairAddress,
      dexId: pair.dexId,
      url: pair.url,
      imageUrl: pair.info?.imageUrl || null,
    },
    priceChanges: {
      m5: priceChange5m,
      h1: priceChange1h,
      h6: priceChange6h,
      h24: priceChange24h,
    },
    volume: {
      m5: volume5m,
      h1: volume1h,
      h6: volume6h,
      h24: volume24h,
    },
    transactions: {
      m5: { buys: buys5m, sells: sells5m },
      h1: { buys: buys1h, sells: sells1h },
      h6: { buys: buys6h, sells: sells6h },
      h24: { buys: buys24h, sells: sells24h },
    },
    analysis: {
      trendScore: Math.round(trendScore),
      direction,
      directionIcon,
      weightedMomentum: Math.round(weightedMomentum * 100) / 100,
      buyPressure: {
        m5: Math.round(buyPressure5m * 100),
        h1: Math.round(buyPressure1h * 100),
        h6: Math.round(buyPressure6h * 100),
        h24: Math.round(buyPressure24h * 100),
      },
      volumeTrend: Math.round(volumeTrend * 100) / 100,
    },
    signal: {
      action: signal,
      icon: signalColor === 'emerald' ? 'check-circle' : signalColor === 'rose' ? 'x-circle' : 'alert-triangle',
      color: signalColor,
      score: Math.round(signalScore),
      reasoning: signalReasoning,
      liquidityRisk,
    },
    updatedAt: new Date().toISOString(),
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    // If specific address requested
    if (address) {
      const res = await fetch(`${DEXSCREENER_API}/${address}`, { next: { revalidate: 15 } })
      if (!res.ok) throw new Error(`DexScreener API error: ${res.status}`)

      const data = await res.json()
      const pairs = data.pairs || []
      if (pairs.length === 0) {
        return NextResponse.json({ error: 'Token not found on DexScreener' }, { status: 404 })
      }

      const pair = pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0]
      return NextResponse.json(analyzeToken(pair, address))
    }

    // Fetch all tracked tokens
    const results = await Promise.all(
      ALLOWED_TOKENS.map(async (addr) => {
        try {
          const res = await fetch(`${DEXSCREENER_API}/${addr}`, { next: { revalidate: 15 } })
          if (!res.ok) return null

          const data = await res.json()
          const pairs = data.pairs || []
          if (pairs.length === 0) return null

          const pair = pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0]
          return analyzeToken(pair, addr)
        } catch {
          return null
        }
      })
    )

    return NextResponse.json(results.filter(Boolean))
  } catch (error: any) {
    console.error('Memecoin fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token data' },
      { status: 500 }
    )
  }
}
