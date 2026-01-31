"""
Market data fetcher for crypto and stocks.
"""
from typing import Optional
from dataclasses import dataclass
from datetime import datetime
import asyncio

import pandas as pd

from config import Config
from utils.logger import get_logger

logger = get_logger("market_data")


@dataclass
class Quote:
    """Real-time quote data."""

    symbol: str
    price: float
    bid: Optional[float]
    ask: Optional[float]
    volume: float
    timestamp: datetime

    def to_dict(self) -> dict:
        return {
            "symbol": self.symbol,
            "price": self.price,
            "bid": self.bid,
            "ask": self.ask,
            "volume": self.volume,
            "timestamp": self.timestamp.isoformat(),
        }


class MarketDataFetcher:
    """Fetches market data for crypto and stocks."""

    def __init__(self):
        """Initialize market data connections."""
        self.crypto_exchange = None
        self.stock_api = None
        self._init_connections()

    def _init_connections(self):
        """Initialize exchange and broker connections."""
        # Initialize crypto exchange (ccxt)
        if Config.BINANCE_API_KEY:
            try:
                import ccxt

                self.crypto_exchange = ccxt.binance(
                    {
                        "apiKey": Config.BINANCE_API_KEY,
                        "secret": Config.BINANCE_SECRET_KEY,
                        "sandbox": Config.is_paper_trading(),
                        "enableRateLimit": True,
                    }
                )
                logger.info("Binance exchange initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Binance: {e}")

        # Initialize stock API (Alpaca)
        if Config.ALPACA_API_KEY:
            try:
                from alpaca.trading.client import TradingClient
                from alpaca.data.historical import StockHistoricalDataClient

                self.stock_api = TradingClient(
                    Config.ALPACA_API_KEY,
                    Config.ALPACA_SECRET_KEY,
                    paper=Config.is_paper_trading(),
                )
                self.stock_data_client = StockHistoricalDataClient(
                    Config.ALPACA_API_KEY, Config.ALPACA_SECRET_KEY
                )
                logger.info("Alpaca API initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Alpaca: {e}")
                self.stock_api = None

    async def get_crypto_quote(self, symbol: str) -> Optional[Quote]:
        """
        Get real-time crypto quote.

        Args:
            symbol: Trading pair (e.g., "BTC/USDT")

        Returns:
            Quote object or None
        """
        if not self.crypto_exchange:
            return None

        try:
            loop = asyncio.get_event_loop()
            ticker = await loop.run_in_executor(
                None, lambda: self.crypto_exchange.fetch_ticker(symbol)
            )

            return Quote(
                symbol=symbol,
                price=ticker["last"],
                bid=ticker.get("bid"),
                ask=ticker.get("ask"),
                volume=ticker.get("baseVolume", 0),
                timestamp=datetime.now(),
            )

        except Exception as e:
            logger.error(f"Error fetching crypto quote for {symbol}: {e}")
            return None

    async def get_stock_quote(self, symbol: str) -> Optional[Quote]:
        """
        Get real-time stock quote using yfinance as fallback.

        Args:
            symbol: Stock ticker (e.g., "AAPL")

        Returns:
            Quote object or None
        """
        try:
            import yfinance as yf

            loop = asyncio.get_event_loop()
            ticker = await loop.run_in_executor(None, lambda: yf.Ticker(symbol))
            info = await loop.run_in_executor(None, lambda: ticker.info)

            price = info.get("regularMarketPrice") or info.get("currentPrice")
            if not price:
                return None

            return Quote(
                symbol=symbol,
                price=price,
                bid=info.get("bid"),
                ask=info.get("ask"),
                volume=info.get("regularMarketVolume", 0),
                timestamp=datetime.now(),
            )

        except Exception as e:
            logger.error(f"Error fetching stock quote for {symbol}: {e}")
            return None

    async def get_quote(self, symbol: str) -> Optional[Quote]:
        """
        Get quote for any symbol (auto-detects crypto vs stock).

        Args:
            symbol: Asset symbol

        Returns:
            Quote object or None
        """
        if "/" in symbol:
            return await self.get_crypto_quote(symbol)
        else:
            return await self.get_stock_quote(symbol)

    async def get_ohlcv(
        self, symbol: str, timeframe: str = "1h", limit: int = 100
    ) -> Optional[pd.DataFrame]:
        """
        Get OHLCV (candlestick) data.

        Args:
            symbol: Asset symbol
            timeframe: Candle timeframe (1m, 5m, 15m, 1h, 4h, 1d)
            limit: Number of candles

        Returns:
            DataFrame with OHLCV data or None
        """
        if "/" in symbol:
            return await self._get_crypto_ohlcv(symbol, timeframe, limit)
        else:
            return await self._get_stock_ohlcv(symbol, timeframe, limit)

    async def _get_crypto_ohlcv(
        self, symbol: str, timeframe: str, limit: int
    ) -> Optional[pd.DataFrame]:
        """Fetch crypto OHLCV data."""
        if not self.crypto_exchange:
            return None

        try:
            loop = asyncio.get_event_loop()
            ohlcv = await loop.run_in_executor(
                None,
                lambda: self.crypto_exchange.fetch_ohlcv(
                    symbol, timeframe=timeframe, limit=limit
                ),
            )

            df = pd.DataFrame(
                ohlcv, columns=["timestamp", "open", "high", "low", "close", "volume"]
            )
            df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
            df.set_index("timestamp", inplace=True)

            return df

        except Exception as e:
            logger.error(f"Error fetching crypto OHLCV for {symbol}: {e}")
            return None

    async def _get_stock_ohlcv(
        self, symbol: str, timeframe: str, limit: int
    ) -> Optional[pd.DataFrame]:
        """Fetch stock OHLCV data using yfinance."""
        try:
            import yfinance as yf

            # Map timeframe to yfinance interval
            interval_map = {
                "1m": "1m",
                "5m": "5m",
                "15m": "15m",
                "1h": "60m",
                "4h": "60m",  # yfinance doesn't have 4h, use 1h
                "1d": "1d",
            }

            interval = interval_map.get(timeframe, "1h")

            # Period based on timeframe
            period_map = {
                "1m": "1d",
                "5m": "5d",
                "15m": "5d",
                "1h": "1mo",
                "4h": "3mo",
                "1d": "1y",
            }
            period = period_map.get(timeframe, "1mo")

            loop = asyncio.get_event_loop()
            ticker = await loop.run_in_executor(None, lambda: yf.Ticker(symbol))
            df = await loop.run_in_executor(
                None, lambda: ticker.history(period=period, interval=interval)
            )

            if df.empty:
                return None

            # Rename columns to lowercase
            df.columns = [c.lower() for c in df.columns]

            # Keep only OHLCV columns
            df = df[["open", "high", "low", "close", "volume"]].tail(limit)

            return df

        except Exception as e:
            logger.error(f"Error fetching stock OHLCV for {symbol}: {e}")
            return None

    async def get_all_quotes(self) -> dict[str, Quote]:
        """
        Get quotes for all configured symbols.

        Returns:
            Dictionary of symbol to Quote
        """
        all_symbols = Config.CRYPTO_SYMBOLS + Config.STOCK_SYMBOLS
        quotes = {}

        tasks = [self.get_quote(symbol) for symbol in all_symbols]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for symbol, result in zip(all_symbols, results):
            if isinstance(result, Exception):
                logger.error(f"Failed to get quote for {symbol}: {result}")
                continue
            if result:
                quotes[symbol] = result

        return quotes
