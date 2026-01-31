'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card'
import { SentimentCard } from '@/components/SentimentCard'
import { Badge } from '@/components/Badge'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Filter,
  RefreshCw,
  Twitter,
  MessageCircle,
  Newspaper,
} from 'lucide-react'

const mockSentiments = [
  { symbol: 'BTC/USDT', price: 43250.50, change: 2.34, combinedScore: 0.65, twitterScore: 0.72, redditScore: 0.58, newsScore: 0.61, signal: 'strong_buy', confidence: 0.82 },
  { symbol: 'ETH/USDT', price: 2280.75, change: -1.15, combinedScore: 0.28, twitterScore: 0.35, redditScore: 0.22, newsScore: 0.25, signal: 'hold', confidence: 0.65 },
  { symbol: 'SOL/USDT', price: 98.42, change: 5.67, combinedScore: 0.52, twitterScore: 0.61, redditScore: 0.48, newsScore: 0.45, signal: 'buy', confidence: 0.71 },
  { symbol: 'AAPL', price: 185.92, change: 0.45, combinedScore: 0.41, twitterScore: 0.38, redditScore: null, newsScore: 0.44, signal: 'buy', confidence: 0.58 },
  { symbol: 'GOOGL', price: 141.80, change: 1.23, combinedScore: 0.15, twitterScore: 0.12, redditScore: 0.18, newsScore: 0.15, signal: 'hold', confidence: 0.52 },
  { symbol: 'MSFT', price: 378.91, change: -0.32, combinedScore: 0.33, twitterScore: 0.28, redditScore: 0.35, newsScore: 0.38, signal: 'buy', confidence: 0.61 },
  { symbol: 'TSLA', price: 248.50, change: 3.21, combinedScore: -0.35, twitterScore: -0.28, redditScore: -0.45, newsScore: -0.32, signal: 'sell', confidence: 0.73 },
  { symbol: 'NVDA', price: 495.22, change: 2.89, combinedScore: 0.78, twitterScore: 0.85, redditScore: 0.72, newsScore: 0.74, signal: 'strong_buy', confidence: 0.88 },
]

const mockSentimentHistory = [
  { time: '10:00', btc: 0.58, eth: 0.32 },
  { time: '10:15', btc: 0.62, eth: 0.28 },
  { time: '10:30', btc: 0.65, eth: 0.25 },
  { time: '10:45', btc: 0.61, eth: 0.30 },
  { time: '11:00', btc: 0.68, eth: 0.28 },
  { time: '11:15', btc: 0.65, eth: 0.26 },
]

type FilterType = 'all' | 'crypto' | 'stocks'
type SignalFilter = 'all' | 'buy' | 'sell' | 'hold'

export default function SentimentPage() {
  const [assetFilter, setAssetFilter] = useState<FilterType>('all')
  const [signalFilter, setSignalFilter] = useState<SignalFilter>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredSentiments = mockSentiments.filter(s => {
    const isCrypto = s.symbol.includes('/')
    if (assetFilter === 'crypto' && !isCrypto) return false
    if (assetFilter === 'stocks' && isCrypto) return false

    if (signalFilter === 'buy' && !['buy', 'strong_buy'].includes(s.signal)) return false
    if (signalFilter === 'sell' && !['sell', 'strong_sell'].includes(s.signal)) return false
    if (signalFilter === 'hold' && s.signal !== 'hold') return false

    return true
  })

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Calculate aggregate stats
  const avgSentiment = mockSentiments.reduce((acc, s) => acc + s.combinedScore, 0) / mockSentiments.length
  const bullishCount = mockSentiments.filter(s => s.combinedScore > 0.3).length
  const bearishCount = mockSentiments.filter(s => s.combinedScore < -0.3).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Market Sentiment
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm">
            AI-powered sentiment analysis from Twitter, Reddit, and News
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Analyze Now
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Overall Sentiment</p>
              <p className={cn(
                'text-2xl font-bold mt-1',
                avgSentiment > 0.3 ? 'text-emerald-600 dark:text-emerald-400' :
                avgSentiment < -0.3 ? 'text-rose-600 dark:text-rose-400' :
                'text-amber-600 dark:text-amber-400'
              )}>
                {avgSentiment > 0 ? '+' : ''}{avgSentiment.toFixed(2)}
              </p>
            </div>
            {avgSentiment >= 0 ? (
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            ) : (
              <TrendingDown className="w-8 h-8 text-rose-500" />
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Bullish Assets</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {bullishCount}
              </p>
            </div>
            <div className="text-emerald-500">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Bearish Assets</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {bearishCount}
              </p>
            </div>
            <div className="text-rose-500">
              <TrendingDown className="w-8 h-8" />
            </div>
          </div>
        </Card>
      </div>

      {/* Source Status */}
      <Card className="mb-6">
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Twitter className="w-4 h-4 text-[#1DA1F2]" />
              <span className="text-sm text-gray-700 dark:text-slate-300">Twitter</span>
              <Badge variant="success">Connected</Badge>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#FF4500]" />
              <span className="text-sm text-gray-700 dark:text-slate-300">Reddit</span>
              <Badge variant="success">Connected</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-slate-300">NewsAPI</span>
              <Badge variant="success">Connected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-slate-400">Filter:</span>
        </div>

        {/* Asset Type Filter */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
          {(['all', 'crypto', 'stocks'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setAssetFilter(filter)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                assetFilter === filter
                  ? 'text-gray-900 dark:text-white bg-white dark:bg-slate-700 shadow-sm'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Signal Filter */}
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg">
          {(['all', 'buy', 'sell', 'hold'] as SignalFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setSignalFilter(filter)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                signalFilter === filter
                  ? 'text-gray-900 dark:text-white bg-white dark:bg-slate-700 shadow-sm'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sentiment Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSentiments.map((sentiment) => (
          <SentimentCard key={sentiment.symbol} {...sentiment} />
        ))}
      </div>

      {filteredSentiments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-slate-500">
            No assets match the selected filters
          </p>
        </div>
      )}
    </div>
  )
}
