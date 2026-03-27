import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BINANCE_API = 'https://api.binance.com/api/v3'
const COINGECKO_API = 'https://api.coingecko.com/api/v3'

const CRYPTO_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']
const SYMBOL_DISPLAY: Record<string, string> = {
  BTCUSDT: 'BTC',
  ETHUSDT: 'ETH',
  SOLUSDT: 'SOL',
}

// CoinGecko IDs as fallback
const CG_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
}

async function fetchBinance(signal: AbortSignal) {
  const symbols = JSON.stringify(CRYPTO_SYMBOLS)
  const res = await fetch(
    `${BINANCE_API}/ticker/24hr?symbols=${encodeURIComponent(symbols)}`,
    { signal, cache: 'no-store' }
  )
  if (!res.ok) throw new Error(`Binance: ${res.status}`)
  const data = await res.json()
  return data.map((t: any) => ({
    symbol: SYMBOL_DISPLAY[t.symbol] || t.symbol,
    price: parseFloat(t.lastPrice),
    change: parseFloat(t.priceChangePercent),
    volume: parseFloat(t.volume),
    high: parseFloat(t.highPrice),
    low: parseFloat(t.lowPrice),
  }))
}

async function fetchCoinGecko(signal: AbortSignal) {
  const ids = Object.values(CG_IDS).join(',')
  const res = await fetch(
    `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
    { signal, cache: 'no-store' }
  )
  if (!res.ok) throw new Error(`CoinGecko: ${res.status}`)
  const data = await res.json()

  return Object.entries(CG_IDS).map(([symbol, id]) => ({
    symbol,
    price: data[id]?.usd || 0,
    change: data[id]?.usd_24h_change || 0,
    volume: data[id]?.usd_24h_vol || 0,
    high: 0,
    low: 0,
  }))
}

export async function GET() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000) // 5s timeout

  try {
    let tickers
    try {
      tickers = await fetchBinance(controller.signal)
    } catch {
      // Fallback to CoinGecko if Binance times out
      tickers = await fetchCoinGecko(controller.signal)
    }
    return NextResponse.json(tickers)
  } catch (error: any) {
    // Return empty array instead of 500 — don't block the dashboard
    return NextResponse.json([])
  } finally {
    clearTimeout(timeout)
  }
}
