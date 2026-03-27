import { createClient } from '@libsql/client'

function getDb() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (url) {
    return createClient({ url, authToken })
  }

  // Local fallback
  return createClient({ url: 'file:../tradingbot.db' })
}

export async function getSentimentHistory(symbol?: string, limit = 100) {
  const db = getDb()
  if (symbol) {
    const result = await db.execute({
      sql: 'SELECT * FROM sentiment_history WHERE symbol = ? ORDER BY timestamp DESC LIMIT ?',
      args: [symbol, limit],
    })
    return result.rows
  }
  const result = await db.execute({
    sql: 'SELECT * FROM sentiment_history ORDER BY timestamp DESC LIMIT ?',
    args: [limit],
  })
  return result.rows
}

export async function getLatestSentimentPerSymbol() {
  const db = getDb()
  const result = await db.execute(`
    SELECT sh.* FROM sentiment_history sh
    INNER JOIN (
      SELECT symbol, MAX(timestamp) as max_ts
      FROM sentiment_history GROUP BY symbol
    ) latest ON sh.symbol = latest.symbol AND sh.timestamp = latest.max_ts
  `)
  return result.rows
}

export async function getRecentTrades(limit = 50) {
  const db = getDb()
  const result = await db.execute({
    sql: 'SELECT * FROM trades ORDER BY timestamp DESC LIMIT ?',
    args: [limit],
  })
  return result.rows
}

export async function getTradeStats() {
  const db = getDb()
  const total = await db.execute('SELECT COUNT(*) as count FROM trades')
  const sides = await db.execute('SELECT side, COUNT(*) as count FROM trades GROUP BY side')
  const volume = await db.execute('SELECT COALESCE(SUM(total_value), 0) as volume FROM trades')

  const sideMap: Record<string, number> = {}
  sides.rows.forEach((r: any) => { sideMap[r.side] = r.count })

  return {
    total_trades: (total.rows[0] as any).count,
    buy_trades: sideMap.buy || 0,
    sell_trades: sideMap.sell || 0,
    total_volume: (volume.rows[0] as any).volume,
  }
}

export async function getPortfolioHistory(limit = 100) {
  const db = getDb()
  const result = await db.execute({
    sql: 'SELECT * FROM portfolio_snapshots ORDER BY timestamp DESC LIMIT ?',
    args: [limit],
  })
  return result.rows
}

export async function getLatestPortfolioSnapshot() {
  const db = getDb()
  const result = await db.execute(
    'SELECT * FROM portfolio_snapshots ORDER BY timestamp DESC LIMIT 1'
  )
  return result.rows[0] || null
}
