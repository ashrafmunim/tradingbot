# Trading Bot with Market Sentiment Analysis

An automated trading system that uses sentiment analysis from multiple social and news sources to generate trading signals for cryptocurrencies and stocks.

## Features

### Sentiment Analysis
- **Multi-source aggregation**: Combines sentiment from Twitter/X, Reddit, and news articles
- **Weighted scoring**: Configurable weights (News 40%, Twitter 35%, Reddit 25%)
- **Dual NLP engines**: Uses both VADER and TextBlob for improved accuracy
- **Fear & Greed Index**: Fetches crypto market sentiment from Alternative.me API
- **Asset-specific keywords**: Custom keyword mappings for each tracked asset (e.g., "bitcoin", "#btc", "ethereum")

### Trading Strategy
- **Signal types**: Strong Buy, Buy, Hold, Sell, Strong Sell based on configurable thresholds
- **Confidence scoring**: Factors in source coverage and score agreement
- **Position management**: Tracks existing positions to avoid duplicates
- **Automated exits**: Triggers based on stop-loss, take-profit, or sentiment reversal

### Risk Management
- **Position sizing**: Max 5% of portfolio per trade (configurable)
- **Stop-loss**: Automatic 3% stop-loss on all positions
- **Take-profit**: Automatic 6% take-profit targets
- **Exposure limits**: Max 80% portfolio invested, max 10 concurrent positions
- **Volatility adjustment**: Position sizing scales with market volatility

### Order Execution
- **Crypto trading**: Binance integration via CCXT library
- **Stock trading**: Alpaca API for US equities
- **Paper trading mode**: Full simulation without real orders
- **Order logging**: All trades recorded to SQLite database

### Data Collection (for Backtesting)
- **Raw sentiment logging**: Stores every tweet, Reddit post, and news article with full metadata
- **Timestamped records**: All data includes collection time and original creation time
- **Engagement metrics**: Stores likes, retweets, upvotes for weighting analysis
- **Batch storage**: Efficient bulk inserts to SQLite with indexes for fast querying
- **CLI stats**: View collection statistics with `python main.py --raw-stats`

### Dashboard (Next.js)
- **Real-time overview**: Portfolio value, P&L, win rate statistics
- **Portfolio chart**: Historical performance visualization
- **Market ticker**: Live price updates for tracked assets
- **Sentiment cards**: Visual display of sentiment scores per asset
- **Trade history**: Filterable log of all executed trades
- **Fear & Greed gauge**: Visual market sentiment indicator

## Tracked Assets

**Cryptocurrencies:**
- BTC/USDT (Bitcoin)
- ETH/USDT (Ethereum)
- SOL/USDT (Solana)

**Stocks:**
- AAPL (Apple)
- GOOGL (Alphabet)
- MSFT (Microsoft)
- TSLA (Tesla)
- NVDA (NVIDIA)

## How It Works

1. **Scheduled analysis** runs every 15 minutes (configurable)
2. **Sentiment collection** gathers posts/articles for each asset's keywords
3. **Score aggregation** combines weighted scores from all sources
4. **Signal generation** converts scores to trading signals using thresholds
5. **Risk validation** checks position limits and exposure
6. **Order execution** places market orders via exchange APIs (or simulates in paper mode)
7. **Logging** records sentiment, signals, and trades to database

## Limitations

### Data Sources
- **API rate limits**: Twitter, Reddit, and News APIs have request limits
- **Historical data**: No backtesting capability; only analyzes real-time sentiment
- **Language**: Sentiment analysis optimized for English content only
- **Coverage gaps**: May miss sentiment from platforms not integrated (Discord, Telegram, etc.)

### Trading
- **Long-only**: Does not support short selling (exits positions instead)
- **Market orders only**: No limit orders, OCO, or advanced order types
- **Single exchange**: One crypto exchange (Binance) and one broker (Alpaca) at a time
- **US markets only**: Stock trading limited to Alpaca-supported US equities
- **No fractional shares**: Stock orders rounded to whole shares

### Analysis
- **Sentiment lag**: Social media sentiment may lag actual market moves
- **No technical analysis**: Purely sentiment-driven; ignores price patterns, volume, indicators
- **No fundamental analysis**: Does not consider earnings, financials, or valuations
- **Noise susceptibility**: Social sentiment can be manipulated or driven by bots

### Infrastructure
- **No high availability**: Single instance; no failover or redundancy
- **Manual startup**: Requires manual restart after crashes
- **Dashboard uses mock data**: Not yet connected to live backend API

## What's Next

### Short Term
- [x] Log raw sentiment data for future backtesting
- [ ] Connect dashboard to live backend API endpoints
- [ ] Add WebSocket support for real-time updates
- [ ] Implement authentication for dashboard access
- [ ] Add email/SMS alerts for significant signals and trades

### Medium Term
- [ ] Backtesting engine to validate strategy on historical data
- [ ] Technical indicators integration (RSI, MACD, moving averages)
- [ ] Limit orders and stop-limit order support
- [ ] Multi-exchange support (Coinbase, Kraken, etc.)
- [ ] Discord and Telegram sentiment sources

### Long Term
- [ ] Machine learning model for sentiment classification
- [ ] Portfolio optimization (Modern Portfolio Theory)
- [ ] Options trading support
- [ ] Mobile app for monitoring and manual overrides
- [ ] Cloud deployment with auto-scaling and high availability

### Infrastructure
- [ ] Docker containerization
- [ ] CI/CD pipeline for automated testing and deployment
- [ ] Monitoring and alerting (Prometheus, Grafana)
- [ ] Database migration to PostgreSQL for production
