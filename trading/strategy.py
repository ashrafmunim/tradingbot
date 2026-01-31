"""
Trading strategy based on sentiment analysis.
"""
from dataclasses import dataclass
from typing import Optional
from enum import Enum

from config import Config
from sentiment.analyzer import SentimentResult
from data.market_data import Quote
from utils.logger import get_logger

logger = get_logger("strategy")


class SignalType(Enum):
    """Trading signal types."""

    STRONG_BUY = "strong_buy"
    BUY = "buy"
    HOLD = "hold"
    SELL = "sell"
    STRONG_SELL = "strong_sell"


@dataclass
class TradeSignal:
    """Trading signal with action details."""

    symbol: str
    signal_type: SignalType
    sentiment_score: float
    confidence: float
    current_price: Optional[float]
    recommended_action: str
    position_size_pct: float
    stop_loss_price: Optional[float]
    take_profit_price: Optional[float]

    def to_dict(self) -> dict:
        return {
            "symbol": self.symbol,
            "signal_type": self.signal_type.value,
            "sentiment_score": self.sentiment_score,
            "confidence": self.confidence,
            "current_price": self.current_price,
            "recommended_action": self.recommended_action,
            "position_size_pct": self.position_size_pct,
            "stop_loss_price": self.stop_loss_price,
            "take_profit_price": self.take_profit_price,
        }


class TradingStrategy:
    """
    Converts sentiment signals into actionable trading decisions.
    """

    def __init__(self, risk_manager=None):
        """
        Initialize trading strategy.

        Args:
            risk_manager: Optional RiskManager instance
        """
        self.risk_manager = risk_manager
        self.min_confidence = 0.4  # Minimum confidence to act

    def generate_signal(
        self,
        sentiment: SentimentResult,
        quote: Optional[Quote] = None,
        current_position: Optional[dict] = None,
    ) -> TradeSignal:
        """
        Generate a trading signal from sentiment data.

        Args:
            sentiment: Sentiment analysis result
            quote: Current market quote
            current_position: Current position in this asset (if any)

        Returns:
            TradeSignal with recommended action
        """
        symbol = sentiment.symbol
        score = sentiment.combined_score
        confidence = sentiment.confidence

        # Determine signal type
        if score > Config.STRONG_BUY_THRESHOLD:
            signal_type = SignalType.STRONG_BUY
        elif score > Config.BUY_THRESHOLD:
            signal_type = SignalType.BUY
        elif score < Config.STRONG_SELL_THRESHOLD:
            signal_type = SignalType.STRONG_SELL
        elif score < Config.SELL_THRESHOLD:
            signal_type = SignalType.SELL
        else:
            signal_type = SignalType.HOLD

        # Determine action based on signal and position
        action = self._determine_action(signal_type, current_position, confidence)

        # Calculate position sizing
        position_size_pct = self._calculate_position_size(signal_type, confidence)

        # Calculate price levels if quote available
        current_price = quote.price if quote else None
        stop_loss = None
        take_profit = None

        if current_price:
            if signal_type in [SignalType.STRONG_BUY, SignalType.BUY]:
                stop_loss = current_price * (1 - Config.STOP_LOSS_PCT)
                take_profit = current_price * (1 + Config.TAKE_PROFIT_PCT)
            elif signal_type in [SignalType.STRONG_SELL, SignalType.SELL]:
                # For short positions (if supported)
                stop_loss = current_price * (1 + Config.STOP_LOSS_PCT)
                take_profit = current_price * (1 - Config.TAKE_PROFIT_PCT)

        signal = TradeSignal(
            symbol=symbol,
            signal_type=signal_type,
            sentiment_score=score,
            confidence=confidence,
            current_price=current_price,
            recommended_action=action,
            position_size_pct=position_size_pct,
            stop_loss_price=round(stop_loss, 2) if stop_loss else None,
            take_profit_price=round(take_profit, 2) if take_profit else None,
        )

        logger.info(
            f"Signal for {symbol}: {signal_type.value} "
            f"(score={score:.3f}, confidence={confidence:.2f}) -> {action}"
        )

        return signal

    def _determine_action(
        self,
        signal_type: SignalType,
        current_position: Optional[dict],
        confidence: float,
    ) -> str:
        """Determine the recommended action based on signal and position."""
        has_position = current_position and current_position.get("quantity", 0) > 0
        position_side = current_position.get("side") if current_position else None

        # Low confidence = hold
        if confidence < self.min_confidence:
            return "hold_low_confidence"

        if signal_type == SignalType.STRONG_BUY:
            if has_position and position_side == "long":
                return "hold_position"
            return "open_long"

        elif signal_type == SignalType.BUY:
            if has_position and position_side == "long":
                return "hold_position"
            return "open_long"

        elif signal_type == SignalType.STRONG_SELL:
            if has_position and position_side == "long":
                return "close_long"
            return "hold_no_position"  # Don't short without explicit support

        elif signal_type == SignalType.SELL:
            if has_position and position_side == "long":
                return "reduce_long"
            return "hold_no_position"

        else:  # HOLD
            return "hold_position" if has_position else "hold_no_position"

    def _calculate_position_size(
        self, signal_type: SignalType, confidence: float
    ) -> float:
        """
        Calculate position size as percentage of portfolio.

        Scales with signal strength and confidence.
        """
        base_size = Config.MAX_POSITION_SIZE_PCT

        # Scale by signal strength
        if signal_type == SignalType.STRONG_BUY:
            signal_multiplier = 1.0
        elif signal_type == SignalType.BUY:
            signal_multiplier = 0.6
        elif signal_type in [SignalType.SELL, SignalType.STRONG_SELL]:
            signal_multiplier = 1.0  # Full size for exits
        else:
            signal_multiplier = 0.0

        # Scale by confidence
        confidence_multiplier = min(confidence, 1.0)

        return base_size * signal_multiplier * confidence_multiplier

    def should_exit_position(
        self,
        sentiment: SentimentResult,
        position: dict,
        quote: Quote,
    ) -> tuple[bool, str]:
        """
        Check if an existing position should be exited.

        Args:
            sentiment: Current sentiment
            position: Current position details
            quote: Current quote

        Returns:
            Tuple of (should_exit, reason)
        """
        entry_price = position.get("entry_price", 0)
        current_price = quote.price

        if entry_price == 0:
            return False, ""

        # Calculate P&L
        pnl_pct = (current_price - entry_price) / entry_price

        # Check stop loss
        if pnl_pct <= -Config.STOP_LOSS_PCT:
            return True, "stop_loss_triggered"

        # Check take profit
        if pnl_pct >= Config.TAKE_PROFIT_PCT:
            return True, "take_profit_triggered"

        # Check sentiment reversal
        if position.get("side") == "long":
            if sentiment.combined_score < Config.SELL_THRESHOLD:
                return True, "sentiment_reversal"
        elif position.get("side") == "short":
            if sentiment.combined_score > Config.BUY_THRESHOLD:
                return True, "sentiment_reversal"

        return False, ""

    def generate_all_signals(
        self,
        sentiments: dict[str, SentimentResult],
        quotes: dict[str, Quote],
        positions: dict[str, dict],
    ) -> list[TradeSignal]:
        """
        Generate signals for all analyzed symbols.

        Args:
            sentiments: Dictionary of sentiment results
            quotes: Dictionary of current quotes
            positions: Dictionary of current positions

        Returns:
            List of TradeSignals
        """
        signals = []

        for symbol, sentiment in sentiments.items():
            quote = quotes.get(symbol)
            position = positions.get(symbol)
            signal = self.generate_signal(sentiment, quote, position)
            signals.append(signal)

        # Sort by absolute sentiment score (strongest signals first)
        signals.sort(key=lambda s: abs(s.sentiment_score), reverse=True)

        return signals
