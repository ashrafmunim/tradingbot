"""
Order execution for crypto and stock trades.
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime
import asyncio

from config import Config
from trading.strategy import TradeSignal
from trading.risk_manager import RiskManager
from utils.logger import get_logger
from utils.database import Database

logger = get_logger("executor")


@dataclass
class OrderResult:
    """Result of an order execution."""

    success: bool
    order_id: Optional[str]
    symbol: str
    side: str
    quantity: float
    price: Optional[float]
    status: str
    message: str
    timestamp: datetime

    def to_dict(self) -> dict:
        return {
            "success": self.success,
            "order_id": self.order_id,
            "symbol": self.symbol,
            "side": self.side,
            "quantity": self.quantity,
            "price": self.price,
            "status": self.status,
            "message": self.message,
            "timestamp": self.timestamp.isoformat(),
        }


class OrderExecutor:
    """
    Executes trading orders on crypto exchanges and stock brokers.
    """

    def __init__(self, risk_manager: Optional[RiskManager] = None):
        """
        Initialize order executor.

        Args:
            risk_manager: Risk manager for position validation
        """
        self.risk_manager = risk_manager or RiskManager()
        self.db = Database(Config.DATABASE_PATH, Config.TURSO_DATABASE_URL, Config.TURSO_AUTH_TOKEN)
        self.crypto_exchange = None
        self.stock_client = None
        self._init_clients()

    def _init_clients(self):
        """Initialize exchange and broker clients."""
        # Initialize crypto exchange
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
                logger.info("Binance exchange initialized for trading")
            except Exception as e:
                logger.error(f"Failed to initialize Binance: {e}")

        # Initialize stock broker
        if Config.ALPACA_API_KEY:
            try:
                from alpaca.trading.client import TradingClient

                self.stock_client = TradingClient(
                    Config.ALPACA_API_KEY,
                    Config.ALPACA_SECRET_KEY,
                    paper=Config.is_paper_trading(),
                )
                logger.info("Alpaca client initialized for trading")
            except Exception as e:
                logger.error(f"Failed to initialize Alpaca: {e}")

    def _is_crypto(self, symbol: str) -> bool:
        """Check if symbol is cryptocurrency."""
        return "/" in symbol

    async def execute_signal(
        self,
        signal: TradeSignal,
        portfolio_value: float,
        dry_run: bool = False,
    ) -> OrderResult:
        """
        Execute a trading signal.

        Args:
            signal: TradeSignal to execute
            portfolio_value: Current portfolio value for sizing
            dry_run: If True, simulate without placing real orders

        Returns:
            OrderResult with execution details
        """
        symbol = signal.symbol
        action = signal.recommended_action

        # Skip non-actionable signals
        if action in ["hold_position", "hold_no_position", "hold_low_confidence"]:
            return OrderResult(
                success=True,
                order_id=None,
                symbol=symbol,
                side="none",
                quantity=0,
                price=None,
                status="skipped",
                message=f"Action: {action}",
                timestamp=datetime.now(),
            )

        # Determine order side
        if action in ["open_long", "add_to_long"]:
            side = "buy"
        elif action in ["close_long", "reduce_long"]:
            side = "sell"
        else:
            return OrderResult(
                success=False,
                order_id=None,
                symbol=symbol,
                side="unknown",
                quantity=0,
                price=None,
                status="invalid_action",
                message=f"Unknown action: {action}",
                timestamp=datetime.now(),
            )

        # Calculate position size
        if signal.current_price:
            sizing = self.risk_manager.calculate_position_size(
                symbol=symbol,
                entry_price=signal.current_price,
                portfolio_value=portfolio_value,
                signal_strength=signal.confidence,
            )
            quantity = sizing.max_quantity
        else:
            return OrderResult(
                success=False,
                order_id=None,
                symbol=symbol,
                side=side,
                quantity=0,
                price=None,
                status="no_price",
                message="Cannot execute without current price",
                timestamp=datetime.now(),
            )

        # Dry run mode
        if dry_run or Config.is_paper_trading():
            logger.info(
                f"[DRY RUN] {side.upper()} {quantity:.6f} {symbol} "
                f"@ {signal.current_price}"
            )

            # Log to database
            self.db.log_trade(
                symbol=symbol,
                side=side,
                quantity=quantity,
                price=signal.current_price,
                sentiment_score=signal.sentiment_score,
                signal_type=signal.signal_type.value,
                notes="paper_trade",
            )

            return OrderResult(
                success=True,
                order_id=f"paper_{datetime.now().timestamp()}",
                symbol=symbol,
                side=side,
                quantity=quantity,
                price=signal.current_price,
                status="paper_executed",
                message="Paper trade executed",
                timestamp=datetime.now(),
            )

        # Execute real order
        if self._is_crypto(symbol):
            return await self._execute_crypto_order(
                symbol, side, quantity, signal
            )
        else:
            return await self._execute_stock_order(
                symbol, side, quantity, signal
            )

    async def _execute_crypto_order(
        self,
        symbol: str,
        side: str,
        quantity: float,
        signal: TradeSignal,
    ) -> OrderResult:
        """Execute a cryptocurrency order."""
        if not self.crypto_exchange:
            return OrderResult(
                success=False,
                order_id=None,
                symbol=symbol,
                side=side,
                quantity=quantity,
                price=None,
                status="no_exchange",
                message="Crypto exchange not configured",
                timestamp=datetime.now(),
            )

        try:
            loop = asyncio.get_event_loop()

            # Place market order
            order = await loop.run_in_executor(
                None,
                lambda: self.crypto_exchange.create_order(
                    symbol=symbol,
                    type="market",
                    side=side,
                    amount=quantity,
                ),
            )

            executed_price = order.get("average") or order.get("price")

            # Log trade
            self.db.log_trade(
                symbol=symbol,
                side=side,
                quantity=quantity,
                price=executed_price or signal.current_price,
                sentiment_score=signal.sentiment_score,
                signal_type=signal.signal_type.value,
                order_id=order.get("id"),
            )

            logger.info(
                f"Crypto order executed: {side} {quantity} {symbol} "
                f"@ {executed_price}"
            )

            return OrderResult(
                success=True,
                order_id=order.get("id"),
                symbol=symbol,
                side=side,
                quantity=quantity,
                price=executed_price,
                status=order.get("status", "filled"),
                message="Order executed successfully",
                timestamp=datetime.now(),
            )

        except Exception as e:
            logger.error(f"Crypto order failed: {e}")
            return OrderResult(
                success=False,
                order_id=None,
                symbol=symbol,
                side=side,
                quantity=quantity,
                price=None,
                status="error",
                message=str(e),
                timestamp=datetime.now(),
            )

    async def _execute_stock_order(
        self,
        symbol: str,
        side: str,
        quantity: float,
        signal: TradeSignal,
    ) -> OrderResult:
        """Execute a stock order via Alpaca."""
        if not self.stock_client:
            return OrderResult(
                success=False,
                order_id=None,
                symbol=symbol,
                side=side,
                quantity=quantity,
                price=None,
                status="no_broker",
                message="Stock broker not configured",
                timestamp=datetime.now(),
            )

        try:
            from alpaca.trading.requests import MarketOrderRequest
            from alpaca.trading.enums import OrderSide, TimeInForce

            loop = asyncio.get_event_loop()

            # Round to whole shares for stocks
            quantity = int(quantity)
            if quantity < 1:
                return OrderResult(
                    success=False,
                    order_id=None,
                    symbol=symbol,
                    side=side,
                    quantity=0,
                    price=None,
                    status="insufficient_size",
                    message="Quantity less than 1 share",
                    timestamp=datetime.now(),
                )

            order_side = OrderSide.BUY if side == "buy" else OrderSide.SELL

            order_request = MarketOrderRequest(
                symbol=symbol,
                qty=quantity,
                side=order_side,
                time_in_force=TimeInForce.DAY,
            )

            order = await loop.run_in_executor(
                None,
                lambda: self.stock_client.submit_order(order_request),
            )

            # Log trade
            self.db.log_trade(
                symbol=symbol,
                side=side,
                quantity=quantity,
                price=signal.current_price,
                sentiment_score=signal.sentiment_score,
                signal_type=signal.signal_type.value,
                order_id=str(order.id),
            )

            logger.info(
                f"Stock order submitted: {side} {quantity} {symbol}"
            )

            return OrderResult(
                success=True,
                order_id=str(order.id),
                symbol=symbol,
                side=side,
                quantity=quantity,
                price=None,  # Market order, filled price TBD
                status=str(order.status),
                message="Order submitted",
                timestamp=datetime.now(),
            )

        except Exception as e:
            logger.error(f"Stock order failed: {e}")
            return OrderResult(
                success=False,
                order_id=None,
                symbol=symbol,
                side=side,
                quantity=quantity,
                price=None,
                status="error",
                message=str(e),
                timestamp=datetime.now(),
            )

    async def get_positions(self) -> dict[str, dict]:
        """
        Get all current positions.

        Returns:
            Dictionary of symbol to position details
        """
        positions = {}

        # Get crypto positions
        if self.crypto_exchange:
            try:
                loop = asyncio.get_event_loop()
                balance = await loop.run_in_executor(
                    None, lambda: self.crypto_exchange.fetch_balance()
                )

                for currency, amounts in balance.get("total", {}).items():
                    if amounts > 0 and currency != "USDT":
                        symbol = f"{currency}/USDT"
                        positions[symbol] = {
                            "symbol": symbol,
                            "quantity": amounts,
                            "side": "long",
                            "type": "crypto",
                        }
            except Exception as e:
                logger.error(f"Error fetching crypto positions: {e}")

        # Get stock positions
        if self.stock_client:
            try:
                loop = asyncio.get_event_loop()
                stock_positions = await loop.run_in_executor(
                    None, lambda: self.stock_client.get_all_positions()
                )

                for pos in stock_positions:
                    positions[pos.symbol] = {
                        "symbol": pos.symbol,
                        "quantity": float(pos.qty),
                        "entry_price": float(pos.avg_entry_price),
                        "value": float(pos.market_value),
                        "unrealized_pnl": float(pos.unrealized_pl),
                        "side": "long" if float(pos.qty) > 0 else "short",
                        "type": "stock",
                    }
            except Exception as e:
                logger.error(f"Error fetching stock positions: {e}")

        return positions

    async def get_portfolio_value(self) -> float:
        """
        Get total portfolio value across all accounts.

        Returns:
            Total portfolio value in USD
        """
        total = 0.0

        # Get crypto account value
        if self.crypto_exchange:
            try:
                loop = asyncio.get_event_loop()
                balance = await loop.run_in_executor(
                    None, lambda: self.crypto_exchange.fetch_balance()
                )
                # Estimate based on USDT balance
                usdt = balance.get("total", {}).get("USDT", 0)
                total += usdt
            except Exception as e:
                logger.error(f"Error fetching crypto balance: {e}")

        # Get stock account value
        if self.stock_client:
            try:
                loop = asyncio.get_event_loop()
                account = await loop.run_in_executor(
                    None, lambda: self.stock_client.get_account()
                )
                total += float(account.portfolio_value)
            except Exception as e:
                logger.error(f"Error fetching stock account: {e}")

        return total
