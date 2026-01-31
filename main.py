"""
Trading Bot with Market Sentiment Analysis
Main entry point and scheduler.
"""
import asyncio
import signal
import sys
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from config import Config
from sentiment.analyzer import SentimentAnalyzer
from trading.strategy import TradingStrategy
from trading.executor import OrderExecutor
from trading.risk_manager import RiskManager
from data.market_data import MarketDataFetcher
from utils.logger import setup_logger, get_logger
from utils.database import Database

# Initialize logger
logger = setup_logger("tradingbot")


class TradingBot:
    """
    Main trading bot that orchestrates sentiment analysis and trading.
    """

    def __init__(self):
        """Initialize the trading bot components."""
        logger.info("Initializing Trading Bot...")

        # Validate configuration
        warnings = Config.validate()
        for warning in warnings:
            logger.warning(warning)

        # Initialize components
        self.sentiment_analyzer = SentimentAnalyzer()
        self.market_data = MarketDataFetcher()
        self.risk_manager = RiskManager()
        self.strategy = TradingStrategy(self.risk_manager)
        self.executor = OrderExecutor(self.risk_manager)
        self.db = Database(Config.DATABASE_PATH)

        # Scheduler
        self.scheduler = AsyncIOScheduler()
        self.running = False

        logger.info(
            f"Trading Bot initialized in {'PAPER' if Config.is_paper_trading() else 'LIVE'} mode"
        )

    async def analyze_and_trade(self):
        """
        Main trading loop: analyze sentiment and execute trades.
        """
        logger.info("=" * 50)
        logger.info(f"Running analysis cycle at {datetime.now()}")
        logger.info("=" * 50)

        try:
            # Get current portfolio value
            portfolio_value = await self.executor.get_portfolio_value()
            if portfolio_value <= 0:
                portfolio_value = 10000  # Default for paper trading
                logger.warning(f"Using default portfolio value: ${portfolio_value}")

            # Get current positions
            positions = await self.executor.get_positions()
            logger.info(f"Current positions: {len(positions)}")

            # Analyze sentiment for all symbols
            logger.info("Analyzing sentiment...")
            sentiments = await self.sentiment_analyzer.analyze_all_symbols()
            logger.info(f"Analyzed {len(sentiments)} symbols")

            # Get current quotes
            logger.info("Fetching market quotes...")
            quotes = await self.market_data.get_all_quotes()
            logger.info(f"Retrieved {len(quotes)} quotes")

            # Generate trading signals
            signals = self.strategy.generate_all_signals(
                sentiments=sentiments,
                quotes=quotes,
                positions=positions,
            )

            # Log sentiment and signals
            for signal in signals:
                sentiment = sentiments.get(signal.symbol)
                if sentiment:
                    self.db.log_sentiment(
                        symbol=signal.symbol,
                        combined_score=sentiment.combined_score,
                        twitter_score=sentiment.twitter_score,
                        reddit_score=sentiment.reddit_score,
                        news_score=sentiment.news_score,
                        signal=signal.signal_type.value,
                    )

            # Execute actionable signals
            actionable = [
                s
                for s in signals
                if s.recommended_action
                not in ["hold_position", "hold_no_position", "hold_low_confidence"]
            ]

            if actionable:
                logger.info(f"Executing {len(actionable)} signals...")
                for signal in actionable:
                    result = await self.executor.execute_signal(
                        signal=signal,
                        portfolio_value=portfolio_value,
                        dry_run=Config.is_paper_trading(),
                    )
                    logger.info(
                        f"Order result for {signal.symbol}: "
                        f"{result.status} - {result.message}"
                    )
            else:
                logger.info("No actionable signals this cycle")

            # Log portfolio snapshot
            import json

            positions_json = json.dumps(
                {k: {"qty": v.get("quantity", 0)} for k, v in positions.items()}
            )
            self.db.log_portfolio_snapshot(
                total_value=portfolio_value,
                cash_balance=portfolio_value - sum(
                    p.get("value", 0) for p in positions.values()
                ),
                positions_value=sum(p.get("value", 0) for p in positions.values()),
                positions_json=positions_json,
            )

            # Print summary
            self._print_summary(signals, sentiments)

        except Exception as e:
            logger.error(f"Error in analysis cycle: {e}", exc_info=True)

    def _print_summary(self, signals, sentiments):
        """Print a summary of the analysis."""
        logger.info("\n" + "=" * 50)
        logger.info("SENTIMENT SUMMARY")
        logger.info("=" * 50)

        for signal in signals[:10]:  # Top 10
            sentiment = sentiments.get(signal.symbol)
            if sentiment:
                logger.info(
                    f"{signal.symbol:12} | "
                    f"Score: {sentiment.combined_score:+.3f} | "
                    f"Signal: {signal.signal_type.value:12} | "
                    f"Action: {signal.recommended_action}"
                )

        # Fear & Greed Index
        fng = self.sentiment_analyzer.get_fear_greed_index()
        if fng:
            logger.info(f"\nFear & Greed Index: {fng['value']} ({fng['classification']})")

        logger.info("=" * 50 + "\n")

    def start(self):
        """Start the trading bot scheduler."""
        logger.info("Starting Trading Bot...")

        # Schedule the main analysis job
        self.scheduler.add_job(
            self.analyze_and_trade,
            trigger=IntervalTrigger(minutes=Config.SENTIMENT_CHECK_INTERVAL_MINUTES),
            id="main_analysis",
            name="Sentiment Analysis & Trading",
            replace_existing=True,
        )

        # Start scheduler
        self.scheduler.start()
        self.running = True

        logger.info(
            f"Scheduler started. Running every {Config.SENTIMENT_CHECK_INTERVAL_MINUTES} minutes."
        )

    def stop(self):
        """Stop the trading bot."""
        logger.info("Stopping Trading Bot...")
        self.scheduler.shutdown()
        self.running = False
        logger.info("Trading Bot stopped")


async def run_once():
    """Run a single analysis cycle (for testing)."""
    bot = TradingBot()
    await bot.analyze_and_trade()


async def run_continuous():
    """Run the bot continuously."""
    bot = TradingBot()

    # Handle shutdown signals
    def shutdown_handler(signum, frame):
        logger.info("Shutdown signal received")
        bot.stop()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)

    # Run initial analysis
    await bot.analyze_and_trade()

    # Start scheduler
    bot.start()

    # Keep running
    while bot.running:
        await asyncio.sleep(1)


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Trading Bot with Market Sentiment Analysis"
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run a single analysis cycle and exit",
    )
    parser.add_argument(
        "--stats",
        action="store_true",
        help="Show trading statistics and exit",
    )
    parser.add_argument(
        "--raw-stats",
        action="store_true",
        help="Show raw sentiment data statistics",
    )
    args = parser.parse_args()

    if args.raw_stats:
        db = Database(Config.DATABASE_PATH)
        stats = db.get_raw_sentiment_stats()
        print("\n=== Raw Sentiment Data Statistics ===")
        print(f"Total Records: {stats['total_records']:,}")
        print(f"\nBy Source:")
        for source, count in stats.get('by_source', {}).items():
            print(f"  {source}: {count:,}")
        print(f"\nBy Symbol:")
        for symbol, count in stats.get('by_symbol', {}).items():
            print(f"  {symbol}: {count:,}")
        if stats.get('earliest'):
            print(f"\nDate Range: {stats['earliest'][:10]} to {stats['latest'][:10]}")
        print()
        return

    if args.stats:
        db = Database(Config.DATABASE_PATH)
        stats = db.get_trade_stats()
        print("\n=== Trading Statistics ===")
        print(f"Total Trades: {stats['total_trades']}")
        print(f"Buy Orders: {stats['buy_trades']}")
        print(f"Sell Orders: {stats['sell_trades']}")
        print(f"Total Volume: ${stats['total_volume']:,.2f}")
        print()

        recent = db.get_recent_trades(10)
        if recent:
            print("=== Recent Trades ===")
            for trade in recent:
                print(
                    f"{trade['timestamp'][:19]} | "
                    f"{trade['side']:4} | "
                    f"{trade['symbol']:12} | "
                    f"Qty: {trade['quantity']:.4f} | "
                    f"Price: ${trade['price']:.2f}"
                )
        return

    if args.once:
        asyncio.run(run_once())
    else:
        asyncio.run(run_continuous())


if __name__ == "__main__":
    main()
