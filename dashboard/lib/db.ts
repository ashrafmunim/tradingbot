import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(process.cwd(), '..', 'tradingbot.db')

export function getDb() {
  return new Database(DB_PATH, { readonly: true })
}

export function getSentimentHistory(symbol?: string, limit = 100) {
  const db = getDb()
  try {
    if (symbol) {
      return db.prepare(
        'SELECT * FROM sentiment_history WHERE symbol = ? ORDER BY timestamp DESC LIMIT ?'
      ).all(symbol, limit)
    }
    return db.prepare(
      'SELECT * FROM sentiment_history ORDER BY timestamp DESC LIMIT ?'
    ).all(limit)
  } finally {
    db.close()
  }
}

export function getLatestSentimentPerSymbol() {
  const db = getDb()
  try {
    return db.prepare(`
      SELECT sh.* FROM sentiment_history sh
      INNER JOIN (
        SELECT symbol, MAX(timestamp) as max_ts
        FROM sentiment_history GROUP BY symbol
      ) latest ON sh.symbol = latest.symbol AND sh.timestamp = latest.max_ts
    `).all()
  } finally {
    db.close()
  }
}

export function getRecentTrades(limit = 50) {
  const db = getDb()
  try {
    return db.prepare(
      'SELECT * FROM trades ORDER BY timestamp DESC LIMIT ?'
    ).all(limit)
  } finally {
    db.close()
  }
}

export function getTradeStats() {
  const db = getDb()
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM trades').get() as any
    const sides = db.prepare('SELECT side, COUNT(*) as count FROM trades GROUP BY side').all() as any[]
    const volume = db.prepare('SELECT COALESCE(SUM(total_value), 0) as volume FROM trades').get() as any
    const sideMap: Record<string, number> = {}
    sides.forEach((r: any) => { sideMap[r.side] = r.count })

    return {
      total_trades: total.count,
      buy_trades: sideMap.buy || 0,
      sell_trades: sideMap.sell || 0,
      total_volume: volume.volume,
    }
  } finally {
    db.close()
  }
}

export function getPortfolioHistory(limit = 100) {
  const db = getDb()
  try {
    return db.prepare(
      'SELECT * FROM portfolio_snapshots ORDER BY timestamp DESC LIMIT ?'
    ).all(limit)
  } finally {
    db.close()
  }
}

export function getLatestPortfolioSnapshot() {
  const db = getDb()
  try {
    return db.prepare(
      'SELECT * FROM portfolio_snapshots ORDER BY timestamp DESC LIMIT 1'
    ).get()
  } finally {
    db.close()
  }
}
