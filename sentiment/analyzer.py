"""
Core sentiment analyzer that aggregates scores from multiple sources.
"""
from dataclasses import dataclass
from typing import Optional
import asyncio

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob

from config import Config
from utils.logger import get_logger
from .twitter_feed import TwitterFeed
from .reddit_feed import RedditFeed
from .news_feed import NewsFeed

logger = get_logger("sentiment")


@dataclass
class SentimentResult:
    """Container for sentiment analysis results."""

    symbol: str
    combined_score: float
    twitter_score: Optional[float]
    reddit_score: Optional[float]
    news_score: Optional[float]
    signal: str
    confidence: float

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            "symbol": self.symbol,
            "combined_score": self.combined_score,
            "twitter_score": self.twitter_score,
            "reddit_score": self.reddit_score,
            "news_score": self.news_score,
            "signal": self.signal,
            "confidence": self.confidence,
        }


class SentimentAnalyzer:
    """
    Aggregates sentiment from multiple sources and generates trading signals.
    """

    def __init__(self):
        """Initialize sentiment analyzer with all data sources."""
        self.vader = SentimentIntensityAnalyzer()
        self.twitter = TwitterFeed()
        self.reddit = RedditFeed()
        self.news = NewsFeed()
        self.weights = Config.SENTIMENT_WEIGHTS

    def analyze_text(self, text: str) -> float:
        """
        Analyze sentiment of a single text using VADER.

        Args:
            text: Text to analyze

        Returns:
            Sentiment score from -1 (bearish) to +1 (bullish)
        """
        if not text:
            return 0.0

        scores = self.vader.polarity_scores(text)
        return scores["compound"]

    def analyze_text_ensemble(self, text: str) -> float:
        """
        Analyze sentiment using both VADER and TextBlob for better accuracy.

        Args:
            text: Text to analyze

        Returns:
            Averaged sentiment score from -1 to +1
        """
        if not text:
            return 0.0

        # VADER score
        vader_score = self.vader.polarity_scores(text)["compound"]

        # TextBlob score (returns -1 to 1)
        blob = TextBlob(text)
        textblob_score = blob.sentiment.polarity

        # Average the two
        return (vader_score + textblob_score) / 2

    def aggregate_scores(
        self,
        twitter_score: Optional[float],
        reddit_score: Optional[float],
        news_score: Optional[float],
    ) -> tuple[float, float]:
        """
        Calculate weighted aggregate sentiment score.

        Args:
            twitter_score: Twitter sentiment (-1 to 1)
            reddit_score: Reddit sentiment (-1 to 1)
            news_score: News sentiment (-1 to 1)

        Returns:
            Tuple of (combined_score, confidence)
        """
        scores = []
        weights = []

        if twitter_score is not None:
            scores.append(twitter_score)
            weights.append(self.weights["twitter"])

        if reddit_score is not None:
            scores.append(reddit_score)
            weights.append(self.weights["reddit"])

        if news_score is not None:
            scores.append(news_score)
            weights.append(self.weights["news"])

        if not scores:
            return 0.0, 0.0

        # Normalize weights
        total_weight = sum(weights)
        normalized_weights = [w / total_weight for w in weights]

        # Calculate weighted average
        combined = sum(s * w for s, w in zip(scores, normalized_weights))

        # Confidence based on number of sources and agreement
        source_coverage = len(scores) / 3
        if len(scores) > 1:
            variance = sum((s - combined) ** 2 for s in scores) / len(scores)
            agreement = max(0, 1 - variance)
        else:
            agreement = 0.5

        confidence = (source_coverage * 0.5) + (agreement * 0.5)

        return combined, confidence

    def generate_signal(self, score: float) -> str:
        """
        Convert sentiment score to trading signal.

        Args:
            score: Combined sentiment score (-1 to 1)

        Returns:
            Signal string: strong_buy, buy, hold, sell, strong_sell
        """
        if score > Config.STRONG_BUY_THRESHOLD:
            return "strong_buy"
        elif score > Config.BUY_THRESHOLD:
            return "buy"
        elif score < Config.STRONG_SELL_THRESHOLD:
            return "strong_sell"
        elif score < Config.SELL_THRESHOLD:
            return "sell"
        else:
            return "hold"

    async def analyze_symbol(self, symbol: str) -> SentimentResult:
        """
        Perform full sentiment analysis for a symbol.

        Args:
            symbol: Asset symbol to analyze

        Returns:
            SentimentResult with all scores and signal
        """
        keywords = Config.ASSET_KEYWORDS.get(symbol, [symbol.lower()])
        logger.info(f"Analyzing sentiment for {symbol} with keywords: {keywords}")

        # Gather sentiment from all sources concurrently
        twitter_task = self.twitter.get_sentiment(keywords)
        reddit_task = self.reddit.get_sentiment(keywords, symbol)
        news_task = self.news.get_sentiment(keywords)

        twitter_score, reddit_score, news_score = await asyncio.gather(
            twitter_task, reddit_task, news_task, return_exceptions=True
        )

        # Handle exceptions
        if isinstance(twitter_score, Exception):
            logger.warning(f"Twitter sentiment failed: {twitter_score}")
            twitter_score = None
        if isinstance(reddit_score, Exception):
            logger.warning(f"Reddit sentiment failed: {reddit_score}")
            reddit_score = None
        if isinstance(news_score, Exception):
            logger.warning(f"News sentiment failed: {news_score}")
            news_score = None

        # Aggregate scores
        combined_score, confidence = self.aggregate_scores(
            twitter_score, reddit_score, news_score
        )

        # Generate signal
        signal = self.generate_signal(combined_score)

        result = SentimentResult(
            symbol=symbol,
            combined_score=round(combined_score, 4),
            twitter_score=round(twitter_score, 4) if twitter_score else None,
            reddit_score=round(reddit_score, 4) if reddit_score else None,
            news_score=round(news_score, 4) if news_score else None,
            signal=signal,
            confidence=round(confidence, 4),
        )

        logger.info(
            f"Sentiment for {symbol}: score={combined_score:.3f}, "
            f"signal={signal}, confidence={confidence:.2f}"
        )

        return result

    async def analyze_all_symbols(self) -> dict[str, SentimentResult]:
        """
        Analyze sentiment for all configured symbols.

        Returns:
            Dictionary mapping symbols to their SentimentResult
        """
        all_symbols = Config.CRYPTO_SYMBOLS + Config.STOCK_SYMBOLS
        results = {}

        tasks = [self.analyze_symbol(symbol) for symbol in all_symbols]
        sentiment_results = await asyncio.gather(*tasks, return_exceptions=True)

        for symbol, result in zip(all_symbols, sentiment_results):
            if isinstance(result, Exception):
                logger.error(f"Failed to analyze {symbol}: {result}")
                continue
            results[symbol] = result

        return results

    def get_fear_greed_index(self) -> Optional[dict]:
        """
        Fetch the Fear & Greed Index for crypto market.

        Returns:
            Dictionary with index value and classification
        """
        import requests

        try:
            response = requests.get(
                "https://api.alternative.me/fng/", timeout=10
            )
            data = response.json()

            if data.get("data"):
                index_data = data["data"][0]
                return {
                    "value": int(index_data["value"]),
                    "classification": index_data["value_classification"],
                    "timestamp": index_data["timestamp"],
                }
        except Exception as e:
            logger.warning(f"Failed to fetch Fear & Greed Index: {e}")

        return None
