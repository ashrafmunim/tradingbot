import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Keywords that map sectors/stocks to geopolitical & economic events
const SECTOR_KEYWORDS: Record<string, string[]> = {
  Banking: ['malaysia bank', 'bnm interest rate', 'bank negara', 'ringgit', 'MYR currency', 'malaysia economy'],
  Energy: ['oil price', 'brent crude', 'petronas', 'opec', 'iran oil', 'middle east oil', 'energy crisis'],
  Utilities: ['tenaga nasional', 'malaysia electricity', 'energy tariff', 'renewable energy malaysia'],
  Healthcare: ['malaysia healthcare', 'glove stocks', 'medical device', 'pandemic', 'WHO health'],
  Technology: ['malaysia tech', 'digital economy', 'AI technology', 'semiconductor'],
  Industrial: ['press metal aluminium', 'commodity price', 'manufacturing malaysia', 'trade war'],
  Construction: ['malaysia infrastructure', 'construction project', 'gamuda', 'property market malaysia'],
  Property: ['malaysia property', 'real estate malaysia', 'housing market'],
  Plantation: ['palm oil price', 'CPO price', 'plantation malaysia', 'sime darby plantation'],
  Telco: ['malaysia 5G', 'telco malaysia', 'digital nasional', 'celcomdigi'],
  Consumer: ['malaysia consumer', 'nestle malaysia', 'food price', 'inflation malaysia'],
  REIT: ['malaysia REIT', 'property trust', 'rental market malaysia'],
}

// Global macro keywords that affect all stocks
const GLOBAL_KEYWORDS = [
  'US Iran war',
  'middle east conflict',
  'US China trade war',
  'federal reserve interest rate',
  'global recession',
  'oil price surge',
  'US sanctions',
  'geopolitical tension',
  'stock market crash',
  'inflation data',
  'malaysia GDP',
  'ringgit exchange rate',
]

// Positive/negative keyword scoring
const BEARISH_WORDS = [
  'war', 'conflict', 'crash', 'recession', 'sanctions', 'crisis', 'decline', 'fall', 'drop',
  'selloff', 'sell-off', 'downturn', 'bearish', 'loss', 'negative', 'plunge', 'slump',
  'tension', 'threat', 'risk', 'fear', 'panic', 'collapse', 'warning', 'cut', 'slash',
  'layoff', 'default', 'bankruptcy', 'fraud', 'investigation', 'penalty', 'fine',
]

const BULLISH_WORDS = [
  'surge', 'rally', 'gain', 'growth', 'profit', 'bullish', 'upgrade', 'boost', 'rise',
  'recovery', 'positive', 'optimism', 'invest', 'expand', 'acquisition', 'deal',
  'dividend', 'record high', 'breakthrough', 'innovation', 'partnership', 'agreement',
  'stimulus', 'support', 'strong', 'outperform', 'beat expectations',
]

interface NewsItem {
  title: string
  description: string
  source: string
  url: string
  publishedAt: string
  sentiment: number // -1 to +1
  relevance: 'high' | 'medium' | 'low'
  impact: string
}

function scoreSentiment(text: string): number {
  const lower = text.toLowerCase()
  let score = 0
  let matches = 0

  BEARISH_WORDS.forEach(w => {
    if (lower.includes(w)) { score -= 1; matches++ }
  })
  BULLISH_WORDS.forEach(w => {
    if (lower.includes(w)) { score += 1; matches++ }
  })

  if (matches === 0) return 0
  return Math.max(-1, Math.min(1, score / matches))
}

function assessImpact(title: string, sector: string): string {
  const lower = title.toLowerCase()

  if (lower.includes('war') || lower.includes('conflict') || lower.includes('military')) {
    if (sector === 'Energy') return 'Oil supply disruption could spike energy prices — potentially bullish for energy stocks'
    if (sector === 'Industrial') return 'Supply chain disruption risk — shipping and logistics could be affected'
    return 'Geopolitical uncertainty increases market volatility — risk-off sentiment'
  }
  if (lower.includes('interest rate') || lower.includes('fed') || lower.includes('bnm')) {
    if (sector === 'Banking') return 'Interest rate changes directly impact bank net interest margins'
    if (sector === 'Property' || sector === 'REIT') return 'Rate hikes increase borrowing costs, pressure on property values'
    return 'Monetary policy shift affects market-wide valuations'
  }
  if (lower.includes('oil') || lower.includes('crude') || lower.includes('opec')) {
    if (sector === 'Energy') return 'Direct impact on revenue and margins for oil & gas companies'
    if (sector === 'Plantation') return 'Oil price correlation with palm oil — indirect impact'
    return 'Energy costs affect operational expenses across sectors'
  }
  if (lower.includes('ringgit') || lower.includes('myr') || lower.includes('currency')) {
    return 'Currency movement affects export competitiveness and foreign investor flows'
  }
  if (lower.includes('palm oil') || lower.includes('cpo')) {
    if (sector === 'Plantation') return 'Direct impact on plantation company revenues'
    return 'Commodity price movement — indirect macro effect'
  }

  return 'May affect market sentiment and sector outlook'
}

async function fetchGoogleNews(query: string): Promise<NewsItem[]> {
  try {
    // Use Google News RSS feed (free, no API key needed)
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en&gl=MY&ceid=MY:en`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    if (!res.ok) return []

    const xml = await res.text()

    // Simple XML parsing for RSS items
    const items: NewsItem[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
      const itemXml = match[1]
      const title = itemXml.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '') || ''
      const desc = itemXml.match(/<description>(.*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '') || ''
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      const source = itemXml.match(/<source.*?>(.*?)<\/source>/)?.[1] || 'Google News'

      if (title) {
        const sentiment = scoreSentiment(title + ' ' + desc)
        items.push({
          title,
          description: desc.slice(0, 200),
          source,
          url: link,
          publishedAt: pubDate,
          sentiment,
          relevance: Math.abs(sentiment) > 0.3 ? 'high' : Math.abs(sentiment) > 0 ? 'medium' : 'low',
          impact: '',
        })
      }
    }

    return items
  } catch {
    return []
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sector = searchParams.get('sector') || 'Banking'
  const stockName = searchParams.get('stock') || ''

  try {
    // Fetch sector-specific news
    const sectorKeywords = SECTOR_KEYWORDS[sector] || [sector + ' malaysia']
    const sectorQuery = sectorKeywords.slice(0, 2).join(' OR ')
    const sectorNews = await fetchGoogleNews(sectorQuery)

    // Fetch global macro news
    const globalQuery = GLOBAL_KEYWORDS.slice(0, 3).join(' OR ')
    const globalNews = await fetchGoogleNews(globalQuery)

    // Fetch stock-specific news if name provided
    let stockNews: NewsItem[] = []
    if (stockName) {
      stockNews = await fetchGoogleNews(`${stockName} stock malaysia`)
    }

    // Add impact assessment
    const allNews = [...stockNews, ...sectorNews, ...globalNews]
    allNews.forEach(n => {
      n.impact = assessImpact(n.title, sector)
    })

    // Deduplicate by title
    const seen = new Set<string>()
    const unique = allNews.filter(n => {
      const key = n.title.slice(0, 50)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 10)

    // Calculate aggregate sentiment
    const sentiments = unique.filter(n => n.sentiment !== 0).map(n => n.sentiment)
    const avgSentiment = sentiments.length > 0
      ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length
      : 0

    const bullishCount = unique.filter(n => n.sentiment > 0).length
    const bearishCount = unique.filter(n => n.sentiment < 0).length
    const neutralCount = unique.filter(n => n.sentiment === 0).length

    let newsSignal = 'Neutral'
    let newsScore = 0
    if (avgSentiment > 0.2) { newsSignal = 'Bullish'; newsScore = 15 }
    else if (avgSentiment > 0.05) { newsSignal = 'Mildly Bullish'; newsScore = 8 }
    else if (avgSentiment < -0.2) { newsSignal = 'Bearish'; newsScore = -15 }
    else if (avgSentiment < -0.05) { newsSignal = 'Mildly Bearish'; newsScore = -8 }

    return NextResponse.json({
      news: unique,
      aggregate: {
        avgSentiment: Math.round(avgSentiment * 100) / 100,
        bullishCount,
        bearishCount,
        neutralCount,
        signal: newsSignal,
        score: newsScore,
      },
      updatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('News sentiment error:', error.message)
    return NextResponse.json({
      news: [],
      aggregate: { avgSentiment: 0, bullishCount: 0, bearishCount: 0, neutralCount: 0, signal: 'Neutral', score: 0 },
      updatedAt: new Date().toISOString(),
    })
  }
}
