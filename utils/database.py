"""
Database module for trade logging and history.
Uses Turso (libsql) for shared cloud database with local SQLite fallback.
"""
import libsql_experimental as libsql
from datetime import datetime
from typing import Optional
from contextlib import contextmanager

from .logger import get_logger

logger = get_logger("database")


class Database:
    """Database for storing trade history and sentiment data."""

    def __init__(self, db_path: str = "tradingbot.db", turso_url: str = "", turso_token: str = ""):
        """
        Initialize database connection.

        Args:
            db_path: Path to local SQLite database file (used as fallback)
            turso_url: Turso database URL (libsql://...)
            turso_token: Turso auth token
        """
        self.turso_url = turso_url
        self.turso_token = turso_token
        self.db_path = db_path
        self._create_tables()

    @contextmanager
    def _get_connection(self):
        """Context manager for database connections."""
        if self.turso_url:
            conn = libsql.connect(
                database=self.turso_url,
                auth_token=self.turso_token,
            )
        else:
            conn = libsql.connect(database=self.db_path)
        conn.row_factory = libsql.Row if hasattr(libsql, 'Row') else None
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

            # Raw sentiment data table for backtesting
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS raw_sentiment_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    source TEXT NOT NULL,
                    symbol TEXT NOT NULL,
                    external_id TEXT,
                    content TEXT NOT NULL,
                    sentiment_score REAL NOT NULL,
                    author TEXT,
                    engagement_score REAL DEFAULT 0,
                    metadata_json TEXT,
                    created_at TEXT
                )
            """)

            # Create indexes for efficient backtesting queries
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_raw_sentiment_timestamp
                ON raw_sentiment_data(timestamp)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_raw_sentiment_symbol
                ON raw_sentiment_data(symbol, timestamp)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_raw_sentiment_source
                ON raw_sentiment_data(source, symbol)
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

    def log_raw_sentiment(
        self,
        source: str,
        symbol: str,
        content: str,
        sentiment_score: float,
        external_id: Optional[str] = None,
        author: Optional[str] = None,
        engagement_score: float = 0,
        metadata: Optional[dict] = None,
        created_at: Optional[str] = None,
    ) -> int:
        """
        Log raw sentiment data for backtesting.

        Returns:
            Record ID
        """
        import json

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO raw_sentiment_data
                (timestamp, source, symbol, external_id, content, sentiment_score,
                 author, engagement_score, metadata_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    datetime.now().isoformat(),
                    source,
                    symbol,
                    external_id,
                    content[:2000],  # Limit content length
                    sentiment_score,
                    author,
                    engagement_score,
                    json.dumps(metadata) if metadata else None,
                    created_at,
                ),
            )
            return cursor.lastrowid

    def log_raw_sentiment_batch(self, records: list[dict]) -> int:
        """
        Log multiple raw sentiment records efficiently.

        Returns:
            Number of records inserted
        """
        import json

        if not records:
            return 0

        with self._get_connection() as conn:
            cursor = conn.cursor()
            timestamp = datetime.now().isoformat()

            data = [
                (
                    timestamp,
                    r.get("source"),
                    r.get("symbol"),
                    r.get("external_id"),
                    r.get("content", "")[:2000],
                    r.get("sentiment_score", 0),
                    r.get("author"),
                    r.get("engagement_score", 0),
                    json.dumps(r.get("metadata")) if r.get("metadata") else None,
                    r.get("created_at"),
                )
                for r in records
            ]

            cursor.executemany(
                """
                INSERT INTO raw_sentiment_data
                (timestamp, source, symbol, external_id, content, sentiment_score,
                 author, engagement_score, metadata_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                data,
            )

            logger.info(f"Logged {len(records)} raw sentiment records")
            return len(records)

    def get_raw_sentiment_data(
        self,
        symbol: Optional[str] = None,
        source: Optional[str] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        limit: int = 1000,
    ) -> list[dict]:
        """
        Retrieve raw sentiment data for backtesting.

        Returns:
            List of raw sentiment records
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()

            query = "SELECT * FROM raw_sentiment_data WHERE 1=1"
            params = []

            if symbol:
                query += " AND symbol = ?"
                params.append(symbol)
            if source:
                query += " AND source = ?"
                params.append(source)
            if start_time:
                query += " AND timestamp >= ?"
                params.append(start_time)
            if end_time:
                query += " AND timestamp <= ?"
                params.append(end_time)

            query += " ORDER BY timestamp DESC LIMIT ?"
            params.append(limit)

            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]

    def get_raw_sentiment_stats(self) -> dict:
        """Get statistics about collected raw sentiment data."""
        with self._get_connection() as conn:
            cursor = conn.cursor()

            # Total records
            cursor.execute("SELECT COUNT(*) as count FROM raw_sentiment_data")
            total = cursor.fetchone()["count"]

            # By source
            cursor.execute(
                "SELECT source, COUNT(*) as count FROM raw_sentiment_data GROUP BY source"
            )
            by_source = {row["source"]: row["count"] for row in cursor.fetchall()}

            # By symbol
            cursor.execute(
                "SELECT symbol, COUNT(*) as count FROM raw_sentiment_data GROUP BY symbol"
            )
            by_symbol = {row["symbol"]: row["count"] for row in cursor.fetchall()}

            # Date range
            cursor.execute(
                "SELECT MIN(timestamp) as earliest, MAX(timestamp) as latest FROM raw_sentiment_data"
            )
            row = cursor.fetchone()

            return {
                "total_records": total,
                "by_source": by_source,
                "by_symbol": by_symbol,
                "earliest": row["earliest"],
                "latest": row["latest"],
            }
