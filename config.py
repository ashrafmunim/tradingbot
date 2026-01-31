"""
Configuration settings for the trading bot.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Central configuration for the trading bot."""

    # Trading Mode
    TRADING_MODE = os.getenv("TRADING_MODE", "paper")  # paper or live

    # Alpaca (Stock Trading)
    ALPACA_API_KEY = os.getenv("ALPACA_API_KEY", "")
    ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY", "")
    ALPACA_BASE_URL = os.getenv(
        "ALPACA_BASE_URL", "https://paper-api.alpaca.markets"
    )

    # Binance (Crypto Trading)
    BINANCE_API_KEY = os.getenv("BINANCE_API_KEY", "")
    BINANCE_SECRET_KEY = os.getenv("BINANCE_SECRET_KEY", "")

    # Twitter/X API
    TWITTER_API_KEY = os.getenv("TWITTER_API_KEY", "")
    TWITTER_API_SECRET = os.getenv("TWITTER_API_SECRET", "")
    TWITTER_ACCESS_TOKEN = os.getenv("TWITTER_ACCESS_TOKEN", "")
    TWITTER_ACCESS_TOKEN_SECRET = os.getenv("TWITTER_ACCESS_TOKEN_SECRET", "")
    TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN", "")

    # Reddit API
    REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID", "")
    REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET", "")
    REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT", "TradingBot/1.0")

    # News API
    NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")

    # Redis
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_DB = int(os.getenv("REDIS_DB", 0))

    # Sentiment Source Weights
    SENTIMENT_WEIGHTS = {
        "news": 0.40,
        "twitter": 0.35,
        "reddit": 0.25,
    }

    # Trading Thresholds
    STRONG_BUY_THRESHOLD = 0.6
    BUY_THRESHOLD = 0.3
    SELL_THRESHOLD = -0.3
    STRONG_SELL_THRESHOLD = -0.6

    # Risk Management
    MAX_POSITION_SIZE_PCT = 0.05  # 5% of portfolio per trade
    STOP_LOSS_PCT = 0.03  # 3% stop loss
    TAKE_PROFIT_PCT = 0.06  # 6% take profit

    # Scheduling
    SENTIMENT_CHECK_INTERVAL_MINUTES = 15

    # Assets to Track
    CRYPTO_SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT"]
    STOCK_SYMBOLS = ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA"]

    # Keyword mappings for sentiment analysis
    ASSET_KEYWORDS = {
        "BTC/USDT": ["bitcoin", "btc", "#bitcoin", "#btc"],
        "ETH/USDT": ["ethereum", "eth", "#ethereum", "#eth"],
        "SOL/USDT": ["solana", "sol", "#solana", "#sol"],
        "AAPL": ["apple", "aapl", "#aapl", "iphone", "tim cook"],
        "GOOGL": ["google", "googl", "alphabet", "#googl", "sundar pichai"],
        "MSFT": ["microsoft", "msft", "#msft", "satya nadella", "azure"],
        "TSLA": ["tesla", "tsla", "#tsla", "elon musk", "cybertruck"],
        "NVDA": ["nvidia", "nvda", "#nvda", "jensen huang", "gpu"],
    }

    # Reddit subreddits to monitor
    CRYPTO_SUBREDDITS = ["cryptocurrency", "bitcoin", "ethereum", "CryptoMarkets"]
    STOCK_SUBREDDITS = ["wallstreetbets", "stocks", "investing", "StockMarket"]

    # Database
    DATABASE_PATH = "tradingbot.db"

    @classmethod
    def is_paper_trading(cls) -> bool:
        """Check if running in paper trading mode."""
        return cls.TRADING_MODE.lower() == "paper"

    @classmethod
    def validate(cls) -> list[str]:
        """Validate configuration and return list of warnings."""
        warnings = []

        if not cls.ALPACA_API_KEY:
            warnings.append("ALPACA_API_KEY not set - stock trading disabled")
        if not cls.BINANCE_API_KEY:
            warnings.append("BINANCE_API_KEY not set - crypto trading disabled")
        if not cls.TWITTER_BEARER_TOKEN:
            warnings.append("TWITTER_BEARER_TOKEN not set - Twitter sentiment disabled")
        if not cls.REDDIT_CLIENT_ID:
            warnings.append("REDDIT_CLIENT_ID not set - Reddit sentiment disabled")
        if not cls.NEWS_API_KEY:
            warnings.append("NEWS_API_KEY not set - News sentiment disabled")

        return warnings
