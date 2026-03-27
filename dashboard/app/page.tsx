'use client'

import { useState, useEffect } from 'react'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { MarketTicker } from '@/components/MarketTicker'
import { SentimentCard } from '@/components/SentimentCard'
import { TradeTable } from '@/components/TradeTable'
import { FearGreedGauge } from '@/components/FearGreedGauge'
import { PortfolioChart } from '@/components/PortfolioChart'
import { useFetch } from '@/lib/hooks'
import type { Trade } from '@/lib/types'

// Signal mapping from DB combined_score to signal string
function scoreToSignal(score: number): string {
  if (score >= 0.6) return 'strong_buy'
  if (score >= 0.3) return 'buy'
  if (score <= -0.6) return 'strong_sell'
  if (score <= -0.3) return 'sell'
  return 'hold'
}

// Calculate confidence from available sources
function calcConfidence(t: number | null, r: number | null, n: number | null): number {
  const sources = [t, r, n].filter(s => s !== null && s !== undefined)
  if (sources.length === 0) return 0
  // More sources = higher base confidence, agreement boosts it
  const base = sources.length / 3
  const scores = sources as number[]
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / scores.length
  const agreement = Math.max(0, 1 - variance * 4)
  return Math.min(1, base * 0.6 + agreement * 0.4)
}

export default function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch real data from API routes (refresh every 30s for market, 60s for others)
  const { data: marketData, refetch: refetchMarket } = useFetch<any[]>(`/api/market?_=${refreshKey}`, 30000)
  const { data: dbSentiment, refetch: refetchSentiment } = useFetch<any[]>(`/api/sentiment?_=${refreshKey}`, 60000)
  const { data: dbTrades, refetch: refetchTrades } = useFetch<any[]>(`/api/trades?_=${refreshKey}`)
  const { data: tradeStats, refetch: refetchStats } = useFetch<any>(`/api/trades?stats=true&_=${refreshKey}`)
  const { data: portfolioHistory, refetch: refetchPortfolio } = useFetch<any[]>(`/api/portfolio?history=true&_=${refreshKey}`)
  const { data: portfolioLatest } = useFetch<any>(`/api/portfolio?_=${refreshKey}`)

  useEffect(() => {
    setLastUpdate(new Date())
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setRefreshKey(k => k + 1)
    refetchMarket()
    refetchSentiment()
    refetchTrades()
    refetchStats()
    refetchPortfolio()
    setLastUpdate(new Date())
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Build market ticker items from live Binance data
  const tickerItems = Array.isArray(marketData) ? marketData : []

  // Build sentiment cards by merging DB sentiment with live prices
  const priceMap: Record<string, { price: number; change: number }> = {}
  if (Array.isArray(marketData)) {
    marketData.forEach((m: any) => {
      priceMap[m.symbol] = { price: m.price, change: m.change }
    })
  }

  const sentiments = (dbSentiment || []).map((s: any) => {
    const displaySymbol = s.symbol.replace('/USDT', '')
    const live = priceMap[displaySymbol]
    return {
      symbol: s.symbol,
      price: live?.price || 0,
      change: live?.change || 0,
      combinedScore: s.combined_score || 0,
      twitterScore: s.twitter_score,
      redditScore: s.reddit_score,
      newsScore: s.news_score,
      signal: s.signal || scoreToSignal(s.combined_score || 0),
      confidence: calcConfidence(s.twitter_score, s.reddit_score, s.news_score),
    }
  })

  // Portfolio stats
  const portfolioValue = portfolioLatest?.total_value || 10000
  const portfolioChange = portfolioValue > 0
    ? (((portfolioValue - 10000) / 10000) * 100).toFixed(1)
    : '0.0'

  // Portfolio chart data
  const chartData = (portfolioHistory || [])
    .slice()
    .reverse()
    .map((s: any) => ({
      timestamp: s.timestamp,
      value: s.total_value,
    }))

  // Trade data
  const trades: Trade[] = (dbTrades || []).map((t: any) => ({
    id: t.id,
    timestamp: t.timestamp,
    symbol: t.symbol,
    side: t.side,
    quantity: t.quantity,
    price: t.price,
    total_value: t.total_value,
    sentiment_score: t.sentiment_score,
    signal_type: t.signal_type,
    status: t.status,
  }))

  const totalTrades = tradeStats?.total_trades || 0

  return (
    <div className="min-h-screen">
      {/* Market Ticker - Live from Binance */}
      <MarketTicker items={tickerItems} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : '—'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Portfolio Value"
            value={`$${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            change={`${parseFloat(portfolioChange) >= 0 ? '+' : ''}${portfolioChange}% from start`}
            changeType={parseFloat(portfolioChange) >= 0 ? 'positive' : 'negative'}
            icon={Wallet}
          />
          <StatCard
            title="Cash Balance"
            value={`$${(portfolioLatest?.cash_balance || 10000).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            change={`Positions: $${(portfolioLatest?.positions_value || 0).toLocaleString()}`}
            changeType="neutral"
            icon={TrendingUp}
            iconColor="text-emerald-500"
          />
          <StatCard
            title="Total Trades"
            value={totalTrades.toString()}
            change={`${tradeStats?.buy_trades || 0} buys / ${tradeStats?.sell_trades || 0} sells`}
            changeType="neutral"
            icon={Activity}
          />
          <StatCard
            title="Trade Volume"
            value={`$${(tradeStats?.total_volume || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            change="Total traded"
            changeType="neutral"
            icon={BarChart3}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <PortfolioChart data={chartData} />
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-400 dark:text-slate-500 text-sm">
                  No portfolio history yet — run the bot to start tracking
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fear & Greed Index */}
          <Card>
            <CardHeader>
              <CardTitle>Fear & Greed Index</CardTitle>
            </CardHeader>
            <CardContent>
              <FearGreedGauge value={72} classification="Greed" />
            </CardContent>
          </Card>
        </div>

        {/* Sentiment Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Market Sentiment
            </h2>
            <a
              href="/sentiment"
              className="flex items-center gap-1 text-sm text-[#1a73e8] hover:text-[#1557b0]"
            >
              View all
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
          {sentiments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sentiments.slice(0, 6).map((sentiment: any) => (
                <SentimentCard key={sentiment.symbol} {...sentiment} />
              ))}
            </div>
          ) : (
            <Card className="p-8">
              <p className="text-center text-gray-400 dark:text-slate-500 text-sm">
                No sentiment data yet — run the bot to start analyzing
              </p>
            </Card>
          )}
        </div>

        {/* Recent Trades */}
        <div className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Trades</CardTitle>
              <a
                href="/history"
                className="flex items-center gap-1 text-sm text-[#1a73e8] hover:text-[#1557b0]"
              >
                View all
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </CardHeader>
            {trades.length > 0 ? (
              <TradeTable trades={trades} compact />
            ) : (
              <CardContent>
                <p className="text-center text-gray-400 dark:text-slate-500 text-sm py-4">
                  No trades yet — the bot hasn't executed any trades
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
