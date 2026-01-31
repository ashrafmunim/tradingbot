export interface SentimentData {
  symbol: string
  combined_score: number
  twitter_score: number | null
  reddit_score: number | null
  news_score: number | null
  signal: string
  confidence: number
  timestamp: string
}

export interface Trade {
  id: number
  timestamp: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  total_value: number
  sentiment_score: number | null
  signal_type: string | null
  status: string
}

export interface PortfolioSnapshot {
  id: number
  timestamp: string
  total_value: number
  cash_balance: number
  positions_value: number
}

export interface Position {
  symbol: string
  quantity: number
  entry_price: number
  current_price: number
  value: number
  unrealized_pnl: number
  unrealized_pnl_pct: number
}

export interface MarketQuote {
  symbol: string
  price: number
  change_24h: number
  change_pct: number
  volume: number
}

export interface FearGreedIndex {
  value: number
  classification: string
  timestamp: string
}
