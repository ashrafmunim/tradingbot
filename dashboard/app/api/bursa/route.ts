import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Shariah-compliant stocks on Bursa Malaysia (Securities Commission approved)
// Organized by sector
const SHARIAH_STOCKS = [
  // Banking & Finance (Islamic)
  { symbol: '1155.KL', name: 'Maybank', sector: 'Banking' },
  { symbol: '1023.KL', name: 'CIMB Group', sector: 'Banking' },
  { symbol: '5819.KL', name: 'Hong Leong Bank', sector: 'Banking' },
  { symbol: '1066.KL', name: 'RHB Bank', sector: 'Banking' },

  // Technology
  { symbol: '0138.KL', name: 'MyEG Services', sector: 'Technology' },
  { symbol: '0041.KL', name: 'CTOS Digital', sector: 'Technology' },
  { symbol: '5765.KL', name: 'UEM Edgenta', sector: 'Technology' },

  // Healthcare
  { symbol: '5225.KL', name: 'IHH Healthcare', sector: 'Healthcare' },
  { symbol: '7113.KL', name: 'Top Glove', sector: 'Healthcare' },
  { symbol: '5078.KL', name: 'Hartalega', sector: 'Healthcare' },

  // Energy & Utilities
  { symbol: '5347.KL', name: 'Tenaga Nasional', sector: 'Utilities' },
  { symbol: '5183.KL', name: 'Petronas Chemicals', sector: 'Energy' },
  { symbol: '5681.KL', name: 'Petronas Dagangan', sector: 'Energy' },
  { symbol: '6033.KL', name: 'Petronas Gas', sector: 'Energy' },

  // Industrial & Manufacturing
  { symbol: '8869.KL', name: 'Press Metal', sector: 'Industrial' },
  { symbol: '3816.KL', name: 'MISC Berhad', sector: 'Industrial' },
  { symbol: '4707.KL', name: 'Nestle Malaysia', sector: 'Consumer' },
  { symbol: '4065.KL', name: 'PPB Group', sector: 'Consumer' },

  // Property & Construction
  { symbol: '5398.KL', name: 'Gamuda', sector: 'Construction' },
  { symbol: '1724.KL', name: 'PKNS Holdings', sector: 'Property' },
  { symbol: '5202.KL', name: 'Eco World', sector: 'Property' },

  // Plantation
  { symbol: '2445.KL', name: 'KLK', sector: 'Plantation' },
  { symbol: '4863.KL', name: 'TDM Berhad', sector: 'Plantation' },
  { symbol: '5285.KL', name: 'Sime Darby Plantation', sector: 'Plantation' },

  // Telecommunications
  { symbol: '6947.KL', name: 'Digi.Com (CelcomDigi)', sector: 'Telco' },
  { symbol: '6012.KL', name: 'Maxis', sector: 'Telco' },
  { symbol: '4818.KL', name: 'TM (Telekom Malaysia)', sector: 'Telco' },

  // REITs (Shariah)
  { symbol: '5180.KL', name: 'Sunway REIT', sector: 'REIT' },
  { symbol: '5227.KL', name: 'KLCCP Stapled', sector: 'REIT' },
]

// Yahoo Finance v8 API
const YF_API = 'https://query1.finance.yahoo.com/v8/finance/chart'

async function fetchQuote(symbol: string) {
  try {
    const res = await fetch(
      `${YF_API}/${symbol}?interval=1d&range=5d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    )
    if (!res.ok) return null

    const data = await res.json()
    const result = data?.chart?.result?.[0]
    if (!result) return null

    const meta = result.meta
    const closes = result.indicators?.quote?.[0]?.close || []
    const prevClose = closes.length >= 2 ? closes[closes.length - 2] : meta.chartPreviousClose
    const currentPrice = meta.regularMarketPrice
    const change = currentPrice && prevClose ? ((currentPrice - prevClose) / prevClose) * 100 : 0

    return {
      price: currentPrice || 0,
      prevClose: prevClose || 0,
      change: Math.round(change * 100) / 100,
      currency: meta.currency || 'MYR',
      marketState: meta.marketState || 'CLOSED',
      volume: meta.regularMarketVolume || 0,
      dayHigh: meta.regularMarketDayHigh || 0,
      dayLow: meta.regularMarketDayLow || 0,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0,
    }
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sector = searchParams.get('sector')
  const symbol = searchParams.get('symbol')

  // Single stock detail
  if (symbol) {
    const stock = SHARIAH_STOCKS.find(s => s.symbol === symbol)
    if (!stock) return NextResponse.json({ error: 'Stock not found' }, { status: 404 })

    const quote = await fetchQuote(symbol)
    return NextResponse.json({ ...stock, quote })
  }

  // Filter by sector
  let stocks = SHARIAH_STOCKS
  if (sector && sector !== 'all') {
    stocks = stocks.filter(s => s.sector.toLowerCase() === sector.toLowerCase())
  }

  // Fetch all quotes in parallel (batch of 10 to avoid rate limiting)
  const results = []
  for (let i = 0; i < stocks.length; i += 10) {
    const batch = stocks.slice(i, i + 10)
    const quotes = await Promise.all(
      batch.map(async (s) => {
        const quote = await fetchQuote(s.symbol)
        return { ...s, quote }
      })
    )
    results.push(...quotes)
  }

  // Sort by market cap (price * volume as proxy)
  results.sort((a, b) => {
    const aVal = (a.quote?.price || 0) * (a.quote?.volume || 0)
    const bVal = (b.quote?.price || 0) * (b.quote?.volume || 0)
    return bVal - aVal
  })

  const sectors = [...new Set(SHARIAH_STOCKS.map(s => s.sector))].sort()

  return NextResponse.json({
    stocks: results,
    sectors,
    total: results.length,
    updatedAt: new Date().toISOString(),
  })
}
