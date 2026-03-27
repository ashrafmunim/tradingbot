import { NextResponse } from 'next/server'
import { getLatestSentimentPerSymbol, getSentimentHistory } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')

    if (symbol) {
      const history = getSentimentHistory(symbol, 100)
      return NextResponse.json(history)
    }

    const latest = getLatestSentimentPerSymbol()
    return NextResponse.json(latest)
  } catch (error: any) {
    console.error('Sentiment fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sentiment data' },
      { status: 500 }
    )
  }
}
