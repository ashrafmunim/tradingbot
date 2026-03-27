import { NextResponse } from 'next/server'
import { getRecentTrades, getTradeStats } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const stats = searchParams.get('stats')

    if (stats === 'true') {
      return NextResponse.json(await getTradeStats())
    }

    const limit = parseInt(searchParams.get('limit') || '50')
    const trades = await getRecentTrades(limit)
    return NextResponse.json(trades)
  } catch (error: any) {
    console.error('Trades fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    )
  }
}
