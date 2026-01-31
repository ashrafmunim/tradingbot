# Changelog

## Committed

### v0.1.0 - Initial Commit (2026-01-31)
**Commit:** `6f4e661`

Core trading bot with sentiment analysis and dashboard.

**Files:**
- `main.py` - Entry point and scheduler
- `config.py` - Configuration settings
- `requirements.txt` - Python dependencies
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules

**Modules:**
- `data/` - Market data fetching (yfinance)
- `sentiment/` - Twitter, Reddit, News sentiment feeds
- `trading/` - Strategy, executor, risk manager
- `utils/` - Database, logger

**Dashboard (Next.js):**
- `dashboard/app/` - Pages (home, analytics, history, positions, sentiment, settings, status)
- `dashboard/components/` - UI components (cards, charts, tables, gauges)
- `dashboard/lib/` - Types and utilities

---

## Pending Commit

### Raw Sentiment Data Logging
**Status:** Ready to commit

Stores every tweet, Reddit post, and news article for future backtesting.

**Modified Files:**
| File | Changes |
|------|---------|
| `utils/database.py` | Added `raw_sentiment_data` table, `log_raw_sentiment()`, `log_raw_sentiment_batch()`, `get_raw_sentiment_data()`, `get_raw_sentiment_stats()` |
| `sentiment/twitter_feed.py` | Added `RawTweet` dataclass, `get_sentiment_with_raw()` method |
| `sentiment/reddit_feed.py` | Added `RawRedditPost` dataclass, `get_sentiment_with_raw()` method |
| `sentiment/news_feed.py` | Added `RawNewsArticle` dataclass, `get_sentiment_with_raw()` method |
| `sentiment/analyzer.py` | Updated to collect and batch-log raw data from all sources |
| `main.py` | Added `--raw-stats` CLI command |

**New Files:**
| File | Purpose |
|------|---------|
| `docs/product.md` | Product documentation (features, limitations, roadmap) |
| `docs/CHANGELOG.md` | This file |

**Generated Files (not committed):**
- `tradingbot.db` - SQLite database (gitignored)
- `logs/` - Log files (gitignored)

**To commit:**
```bash
git add main.py sentiment/ utils/database.py docs/
git commit -m "Add raw sentiment data logging for backtesting"
```

---

## Next Up

### Priority 1: API Setup
- [ ] Create `.env` file with API credentials
- [ ] Test with at least one sentiment source (News API is easiest)

### Priority 2: Connect Dashboard to Backend
- [ ] Add FastAPI server with endpoints for live data
- [ ] Replace mock data in dashboard with API calls
- [ ] Add WebSocket for real-time updates

### Priority 3: Signal Accuracy Tracking
- [ ] Log price at signal time
- [ ] Track price 1h, 4h, 24h after signal
- [ ] Calculate hit rate for each signal type

### Priority 4: Technical Confirmation
- [ ] Add RSI indicator
- [ ] Add volume confirmation
- [ ] Add moving average trend filter

---

## API Credentials Needed

| Service | Purpose | URL | Tier |
|---------|---------|-----|------|
| News API | News sentiment | https://newsapi.org | Free: 100 req/day |
| Reddit | Reddit sentiment | https://reddit.com/prefs/apps | Free |
| Twitter/X | Tweet sentiment | https://developer.twitter.com | Limited free |
| Alpaca | Stock trading | https://alpaca.markets | Free paper trading |
| Binance | Crypto trading | https://binance.com | Free |
