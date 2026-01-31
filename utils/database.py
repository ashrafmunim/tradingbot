"""
Database module for trade logging and history.
"""
import sqlite3
from datetime import datetime
from typing import Optional
from contextlib import contextmanager

from .logger import get_logger

logger = get_logger("database")


class Database:
    """SQLite database for storing trade history and sentiment data."""

    def __init__(self, db_path: str = "tradingbot.db"):
        """
        Initialize database connection.

        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        self._create_tables()

    @contextmanager
    def _get_connection(self):
        """Context manager for database connections."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            conn.close()

    def _create_tables(self):
        """Create database tables if they don't exist."""
        with self._get_connection() as conn:
            cursor = conn.cursor()

            # Trades table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS trades (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    symbol TEXT NOT NULL,
                    side TEXT NOT NULL,
                    quantity REAL NOT NULL,
                    price REAL NOT NULL,
                    total_value REAL NOT NULL,
                    sentiment_score REAL,
                    signal_type TEXT,
                    status TEXT DEFAULT 'executed',
                    order_id TEXT,
                    notes TEXT
                )
            """)

            # Sentiment history table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sentiment_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    symbol TEXT NOT NULL,
                    twitter_score REAL,
                    reddit_score REAL,
                    news_score REAL,
                    combined_score REAL NOT NULL,
                    signal TEXT
                )
            """)

            # Portfolio snapshots table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS portfolio_snapshots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    total_value REAL NOT NULL,
                    cash_balance REAL NOT NULL,
                    positions_value REAL NOT NULL,
                    positions_json TEXT
                )
            """)

            logger.info("Database tables initialized")

    def log_trade(
        self,
        symbol: str,
        side: str,
        quantity: float,
        price: float,
        sentiment_score: Optional[float] = None,
        signal_type: Optional[str] = None,
        order_id: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> int:
        """
        Log a trade to the database.

        Args:
            symbol: Trading symbol
            side: buy or sell
            quantity: Amount traded
            price: Execution price
            sentiment_score: Sentiment score that triggered trade
            signal_type: Type of signal (strong_buy, buy, sell, strong_sell)
            order_id: Exchange order ID
            notes: Additional notes

        Returns:
            Trade ID
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO trades
                (timestamp, symbol, side, quantity, price, total_value,
                 sentiment_score, signal_type, order_id, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    datetime.now().isoformat(),
                    symbol,
                    side,
                    quantity,
                    price,
                    quantity * price,
                    sentiment_score,
                    signal_type,
                    order_id,
                    notes,
                ),
            )
            trade_id = cursor.lastrowid
            logger.info(f"Logged trade {trade_id}: {side} {quantity} {symbol} @ {price}")
            return trade_id

    def log_sentiment(
        self,
        symbol: str,
        combined_score: float,
        twitter_score: Optional[float] = None,
        reddit_score: Optional[float] = None,
        news_score: Optional[float] = None,
        signal: Optional[str] = None,
    ) -> int:
        """
        Log sentiment data to the database.

        Args:
            symbol: Asset symbol
            combined_score: Weighted combined sentiment score
            twitter_score: Twitter sentiment score
            reddit_score: Reddit sentiment score
            news_score: News sentiment score
            signal: Generated trading signal

        Returns:
            Sentiment record ID
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO sentiment_history
                (timestamp, symbol, twitter_score, reddit_score, news_score,
                 combined_score, signal)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    datetime.now().isoformat(),
                    symbol,
                    twitter_score,
                    reddit_score,
                    news_score,
                    combined_score,
                    signal,
                ),
            )
            return cursor.lastrowid

    def log_portfolio_snapshot(
        self,
        total_value: float,
        cash_balance: float,
        positions_value: float,
        positions_json: str,
    ) -> int:
        """
        Log a portfolio snapshot.

        Args:
            total_value: Total portfolio value
            cash_balance: Available cash
            positions_value: Value of open positions
            positions_json: JSON string of positions

        Returns:
            Snapshot ID
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO portfolio_snapshots
                (timestamp, total_value, cash_balance, positions_value, positions_json)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    datetime.now().isoformat(),
                    total_value,
                    cash_balance,
                    positions_value,
                    positions_json,
                ),
            )
            return cursor.lastrowid

    def get_recent_trades(self, limit: int = 50) -> list[dict]:
        """Get recent trades."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT * FROM trades
                ORDER BY timestamp DESC
                LIMIT ?
                """,
                (limit,),
            )
            return [dict(row) for row in cursor.fetchall()]

    def get_sentiment_history(
        self, symbol: str, limit: int = 100
    ) -> list[dict]:
        """Get sentiment history for a symbol."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT * FROM sentiment_history
                WHERE symbol = ?
                ORDER BY timestamp DESC
                LIMIT ?
                """,
                (symbol, limit),
            )
            return [dict(row) for row in cursor.fetchall()]

    def get_portfolio_history(self, limit: int = 100) -> list[dict]:
        """Get portfolio value history."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT * FROM portfolio_snapshots
                ORDER BY timestamp DESC
                LIMIT ?
                """,
                (limit,),
            )
            return [dict(row) for row in cursor.fetchall()]

    def get_trade_stats(self) -> dict:
        """Get trading statistics."""
        with self._get_connection() as conn:
            cursor = conn.cursor()

            # Total trades
            cursor.execute("SELECT COUNT(*) as count FROM trades")
            total_trades = cursor.fetchone()["count"]

            # Buy/Sell breakdown
            cursor.execute(
                "SELECT side, COUNT(*) as count FROM trades GROUP BY side"
            )
            side_counts = {row["side"]: row["count"] for row in cursor.fetchall()}

            # Total volume
            cursor.execute("SELECT SUM(total_value) as volume FROM trades")
            total_volume = cursor.fetchone()["volume"] or 0

            return {
                "total_trades": total_trades,
                "buy_trades": side_counts.get("buy", 0),
                "sell_trades": side_counts.get("sell", 0),
                "total_volume": total_volume,
            }
