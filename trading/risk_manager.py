"""
Risk management for trading operations.
"""
from dataclasses import dataclass
from typing import Optional

from config import Config
from utils.logger import get_logger

logger = get_logger("risk")


@dataclass
class PositionSizing:
    """Position sizing calculation result."""

    symbol: str
    max_quantity: float
    max_value: float
    risk_amount: float
    stop_loss_price: float
    take_profit_price: float


class RiskManager:
    """
    Manages trading risk including position sizing and exposure limits.
    """

    def __init__(
        self,
        max_position_pct: float = None,
        max_portfolio_risk_pct: float = 0.02,
        max_positions: int = 10,
    ):
        """
        Initialize risk manager.

        Args:
            max_position_pct: Max size per position (% of portfolio)
            max_portfolio_risk_pct: Max total portfolio risk
            max_positions: Maximum concurrent positions
        """
        self.max_position_pct = max_position_pct or Config.MAX_POSITION_SIZE_PCT
        self.max_portfolio_risk_pct = max_portfolio_risk_pct
        self.max_positions = max_positions
        self.stop_loss_pct = Config.STOP_LOSS_PCT
        self.take_profit_pct = Config.TAKE_PROFIT_PCT

    def calculate_position_size(
        self,
        symbol: str,
        entry_price: float,
        portfolio_value: float,
        signal_strength: float = 1.0,
    ) -> PositionSizing:
        """
        Calculate optimal position size based on risk parameters.

        Args:
            symbol: Asset symbol
            entry_price: Expected entry price
            portfolio_value: Total portfolio value
            signal_strength: Signal strength multiplier (0-1)

        Returns:
            PositionSizing with calculated values
        """
        # Base position size
        base_size = portfolio_value * self.max_position_pct

        # Adjust by signal strength
        adjusted_size = base_size * signal_strength

        # Calculate risk per share
        stop_loss_price = entry_price * (1 - self.stop_loss_pct)
        risk_per_unit = entry_price - stop_loss_price

        # Calculate max quantity based on risk
        if risk_per_unit > 0:
            max_risk = portfolio_value * self.max_portfolio_risk_pct
            risk_based_quantity = max_risk / risk_per_unit
        else:
            risk_based_quantity = float("inf")

        # Final quantity is minimum of size-based and risk-based
        size_based_quantity = adjusted_size / entry_price
        max_quantity = min(size_based_quantity, risk_based_quantity)

        return PositionSizing(
            symbol=symbol,
            max_quantity=max_quantity,
            max_value=max_quantity * entry_price,
            risk_amount=max_quantity * risk_per_unit,
            stop_loss_price=round(stop_loss_price, 2),
            take_profit_price=round(entry_price * (1 + self.take_profit_pct), 2),
        )

    def check_position_limits(
        self,
        current_positions: list[dict],
        proposed_position: dict,
        portfolio_value: float,
    ) -> tuple[bool, str]:
        """
        Check if a proposed position passes risk limits.

        Args:
            current_positions: List of current positions
            proposed_position: Proposed new position
            portfolio_value: Total portfolio value

        Returns:
            Tuple of (is_allowed, reason)
        """
        # Check max positions
        if len(current_positions) >= self.max_positions:
            # Allow if closing a position
            if proposed_position.get("side") == "sell":
                return True, "closing_position"
            return False, "max_positions_reached"

        # Check if already have position in this symbol
        symbol = proposed_position.get("symbol")
        existing = [p for p in current_positions if p.get("symbol") == symbol]
        if existing and proposed_position.get("side") == "buy":
            return False, "position_already_exists"

        # Check position size limit
        position_value = proposed_position.get("value", 0)
        max_allowed = portfolio_value * self.max_position_pct
        if position_value > max_allowed:
            return False, f"exceeds_max_position_size_{max_allowed:.2f}"

        # Check total exposure
        total_exposure = sum(p.get("value", 0) for p in current_positions)
        total_exposure += position_value
        max_exposure = portfolio_value * 0.8  # Max 80% invested

        if total_exposure > max_exposure:
            return False, "exceeds_max_exposure"

        return True, "approved"

    def calculate_stop_loss(
        self, entry_price: float, side: str = "long"
    ) -> float:
        """
        Calculate stop loss price.

        Args:
            entry_price: Position entry price
            side: Position side (long or short)

        Returns:
            Stop loss price
        """
        if side == "long":
            return entry_price * (1 - self.stop_loss_pct)
        else:
            return entry_price * (1 + self.stop_loss_pct)

    def calculate_take_profit(
        self, entry_price: float, side: str = "long"
    ) -> float:
        """
        Calculate take profit price.

        Args:
            entry_price: Position entry price
            side: Position side (long or short)

        Returns:
            Take profit price
        """
        if side == "long":
            return entry_price * (1 + self.take_profit_pct)
        else:
            return entry_price * (1 - self.take_profit_pct)

    def get_portfolio_risk_summary(
        self,
        positions: list[dict],
        portfolio_value: float,
    ) -> dict:
        """
        Get summary of current portfolio risk.

        Args:
            positions: List of current positions
            portfolio_value: Total portfolio value

        Returns:
            Risk summary dictionary
        """
        total_exposure = sum(p.get("value", 0) for p in positions)
        total_risk = sum(p.get("risk_amount", 0) for p in positions)

        return {
            "total_positions": len(positions),
            "max_positions": self.max_positions,
            "total_exposure": total_exposure,
            "exposure_pct": (total_exposure / portfolio_value * 100)
            if portfolio_value
            else 0,
            "total_risk": total_risk,
            "risk_pct": (total_risk / portfolio_value * 100) if portfolio_value else 0,
            "available_capital": portfolio_value - total_exposure,
        }

    def adjust_for_volatility(
        self,
        base_size: float,
        current_volatility: float,
        average_volatility: float,
    ) -> float:
        """
        Adjust position size based on volatility.

        Higher volatility = smaller position.

        Args:
            base_size: Base position size
            current_volatility: Current asset volatility
            average_volatility: Historical average volatility

        Returns:
            Adjusted position size
        """
        if current_volatility <= 0 or average_volatility <= 0:
            return base_size

        volatility_ratio = average_volatility / current_volatility

        # Cap adjustment between 0.5x and 1.5x
        adjustment = max(0.5, min(1.5, volatility_ratio))

        return base_size * adjustment
