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
import type { Trade } from '@/lib/types'

// Mock data - in production, this would come from your API
const mockMarketData = [
  { symbol: 'BTC', price: 43250.50, change: 2.34 },
  { symbol: 'ETH', price: 2280.75, change: -1.15 },
  { symbol: 'SOL', price: 98.42, change: 5.67 },
  { symbol: 'AAPL', price: 185.92, change: 0.45 },
  { symbol: 'GOOGL', price: 141.80, change: 1.23 },
  { symbol: 'MSFT', price: 378.91, change: -0.32 },
  { symbol: 'TSLA', price: 248.50, change: 3.21 },
  { symbol: 'NVDA', price: 495.22, change: 2.89 },
]

const mockSentiments = [
  { symbol: 'BTC/USDT', price: 43250.50, change: 2.34, combinedScore: 0.65, twitterScore: 0.72, redditScore: 0.58, newsScore: 0.61, signal: 'strong_buy', confidence: 0.82 },
  { symbol: 'ETH/USDT', price: 2280.75, change: -1.15, combinedScore: 0.28, twitterScore: 0.35, redditScore: 0.22, newsScore: 0.25, signal: 'hold', confidence: 0.65 },
  { symbol: 'SOL/USDT', price: 98.42, change: 5.67, combinedScore: 0.52, twitterScore: 0.61, redditScore: 0.48, newsScore: 0.45, signal: 'buy', confidence: 0.71 },
  { symbol: 'AAPL', price: 185.92, change: 0.45, combinedScore: 0.41, twitterScore: 0.38, redditScore: null, newsScore: 0.44, signal: 'buy', confidence: 0.58 },
  { symbol: 'TSLA', price: 248.50, change: 3.21, combinedScore: -0.35, twitterScore: -0.28, redditScore: -0.45, newsScore: -0.32, signal: 'sell', confidence: 0.73 },
  { symbol: 'NVDA', price: 495.22, change: 2.89, combinedScore: 0.78, twitterScore: 0.85, redditScore: 0.72, newsScore: 0.74, signal: 'strong_buy', confidence: 0.88 },
]

const mockTrades: Trade[] = [
  { id: 1, timestamp: '2024-01-15T10:30:00', symbol: 'BTC/USDT', side: 'buy', quantity: 0.05, price: 42850, total_value: 2142.50, sentiment_score: 0.65, signal_type: 'strong_buy', status: 'executed' },
  { id: 2, timestamp: '2024-01-15T09:15:00', symbol: 'NVDA', side: 'buy', quantity: 10, price: 492.50, total_value: 4925.00, sentiment_score: 0.72, signal_type: 'buy', status: 'executed' },
  { id: 3, timestamp: '2024-01-14T16:45:00', symbol: 'TSLA', side: 'sell', quantity: 5, price: 245.80, total_value: 1229.00, sentiment_score: -0.38, signal_type: 'sell', status: 'executed' },
  { id: 4, timestamp: '2024-01-14T14:20:00', symbol: 'ETH/USDT', side: 'buy', quantity: 1.2, price: 2250, total_value: 2700.00, sentiment_score: 0.45, signal_type: 'buy', status: 'executed' },
  { id: 5, timestamp: '2024-01-14T11:00:00', symbol: 'SOL/USDT', side: 'buy', quantity: 25, price: 95.50, total_value: 2387.50, sentiment_score: 0.52, signal_type: 'buy', status: 'executed' },
]

const mockPortfolioHistory = [
  { timestamp: '2024-01-01', value: 10000 },
  { timestamp: '2024-01-03', value: 10250 },
  { timestamp: '2024-01-05', value: 10180 },
  { timestamp: '2024-01-07', value: 10420 },
  { timestamp: '2024-01-09', value: 10650 },
  { timestamp: '2024-01-11', value: 10580 },
  { timestamp: '2024-01-13', value: 10890 },
  { timestamp: '2024-01-15', value: 11234 },
]

export default function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastUpdate(new Date())
    }, 1000)
  }

  return (
    <div className="min-h-screen">
      {/* Market Ticker */}
      <MarketTicker items={mockMarketData} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              Last updated: {lastUpdate.toLocaleTimeString()}
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
            value="$11,234.50"
            change="+12.3% from start"
            changeType="positive"
            icon={Wallet}
          />
          <StatCard
            title="Today's P&L"
            value="+$156.80"
            change="+1.42%"
            changeType="positive"
            icon={TrendingUp}
            iconColor="text-emerald-500"
          />
          <StatCard
            title="Total Trades"
            value="48"
            change="5 today"
            changeType="neutral"
            icon={Activity}
          />
          <StatCard
            title="Win Rate"
            value="68%"
            change="32 wins / 16 losses"
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
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm text-gray-600 dark:text-slate-400 hover:text-[#1a73e8] dark:hover:text-blue-400">
                  1D
                </button>
                <button className="px-3 py-1 text-sm font-medium text-[#1a73e8] bg-[#e8f0fe] dark:bg-blue-900/30 rounded">
                  1W
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 dark:text-slate-400 hover:text-[#1a73e8] dark:hover:text-blue-400">
                  1M
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 dark:text-slate-400 hover:text-[#1a73e8] dark:hover:text-blue-400">
                  ALL
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <PortfolioChart data={mockPortfolioHistory} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockSentiments.slice(0, 6).map((sentiment) => (
              <SentimentCard key={sentiment.symbol} {...sentiment} />
            ))}
          </div>
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
            <TradeTable trades={mockTrades} compact />
          </Card>
        </div>
      </div>
    </div>
  )
}
