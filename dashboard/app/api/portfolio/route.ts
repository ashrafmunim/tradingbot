import { NextResponse } from 'next/server'
import { getPortfolioHistory, getLatestPortfolioSnapshot } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const history = searchParams.get('history')

    if (history === 'true') {
      const limit = parseInt(searchParams.get('limit') || '100')
      const snapshots = await getPortfolioHistory(limit)
      return NextResponse.json(snapshots)
    }

    const latest = await getLatestPortfolioSnapshot()
    return NextResponse.json(latest || { total_value: 0, cash_balance: 0, positions_value: 0 })
  } catch (error: any) {
    console.error('Portfolio fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    )
  }
}
