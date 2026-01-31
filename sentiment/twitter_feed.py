"""
Twitter/X sentiment feed using Tweepy.
"""
from dataclasses import dataclass
from typing import Optional
import asyncio

from config import Config
from utils.logger import get_logger

logger = get_logger("twitter")


@dataclass
class RawTweet:
    """Container for raw tweet data."""
    tweet_id: str
    text: str
    sentiment_score: float
    author_id: Optional[str]
    engagement_score: float
    created_at: Optional[str]
    metrics: dict


class TwitterFeed:
    """Fetches and analyzes Twitter sentiment for trading signals."""

    def __init__(self):
        """Initialize Twitter client."""
        self.client = None
        self._init_client()

    def _init_client(self):
        """Initialize Tweepy client if credentials are available."""
        if not Config.TWITTER_BEARER_TOKEN:
            logger.warning("Twitter API credentials not configured")
            return

        try:
            import tweepy

            self.client = tweepy.Client(
                bearer_token=Config.TWITTER_BEARER_TOKEN,
                consumer_key=Config.TWITTER_API_KEY,
                consumer_secret=Config.TWITTER_API_SECRET,
                access_token=Config.TWITTER_ACCESS_TOKEN,
                access_token_secret=Config.TWITTER_ACCESS_TOKEN_SECRET,
                wait_on_rate_limit=True,
            )
            logger.info("Twitter client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Twitter client: {e}")

    async def get_sentiment(
        self, keywords: list[str], max_tweets: int = 100
    ) -> Optional[float]:
        """
        Fetch tweets and calculate aggregate sentiment.

        Args:
            keywords: List of keywords to search
            max_tweets: Maximum tweets to analyze

        Returns:
            Sentiment score from -1 to 1, or None if unavailable
        """
        result = await self.get_sentiment_with_raw(keywords, max_tweets)
        return result[0] if result else None

    async def get_sentiment_with_raw(
        self, keywords: list[str], max_tweets: int = 100
    ) -> Optional[tuple[float, list[RawTweet]]]:
        """
        Fetch tweets and calculate aggregate sentiment with raw data.

        Args:
            keywords: List of keywords to search
            max_tweets: Maximum tweets to analyze

        Returns:
            Tuple of (sentiment_score, list of RawTweet) or None if unavailable
        """
        if not self.client:
            return None

        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

            vader = SentimentIntensityAnalyzer()

            # Build search query
            query = " OR ".join(keywords)
            query += " -is:retweet lang:en"

            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            tweets = await loop.run_in_executor(
                None,
                lambda: self.client.search_recent_tweets(
                    query=query,
                    max_results=min(max_tweets, 100),
                    tweet_fields=["created_at", "public_metrics", "author_id"],
                ),
            )

            if not tweets.data:
                logger.warning(f"No tweets found for keywords: {keywords}")
                return None

            # Calculate sentiment with engagement weighting
            scores = []
            weights = []
            raw_tweets = []

            for tweet in tweets.data:
                text = tweet.text
                score = vader.polarity_scores(text)["compound"]

                # Weight by engagement
                metrics = tweet.public_metrics or {}
                engagement = (
                    metrics.get("like_count", 0)
                    + metrics.get("retweet_count", 0) * 2
                    + metrics.get("reply_count", 0)
                )
                weight = 1 + (engagement / 100)  # Normalize engagement weight

                scores.append(score)
                weights.append(weight)

                # Store raw data
                raw_tweets.append(RawTweet(
                    tweet_id=str(tweet.id),
                    text=text,
                    sentiment_score=score,
                    author_id=str(tweet.author_id) if tweet.author_id else None,
                    engagement_score=engagement,
                    created_at=tweet.created_at.isoformat() if tweet.created_at else None,
                    metrics=dict(metrics) if metrics else {},
                ))

            if not scores:
                return None

            # Weighted average
            weighted_sum = sum(s * w for s, w in zip(scores, weights))
            total_weight = sum(weights)
            avg_sentiment = weighted_sum / total_weight

            logger.info(
                f"Twitter sentiment for {keywords[0]}: {avg_sentiment:.3f} "
                f"({len(scores)} tweets)"
            )

            return avg_sentiment, raw_tweets

        except Exception as e:
            logger.error(f"Error fetching Twitter sentiment: {e}")
            return None

    async def get_trending_topics(self, woeid: int = 1) -> list[str]:
        """
        Get trending topics.

        Args:
            woeid: Where On Earth ID (1 = worldwide)

        Returns:
            List of trending topic names
        """
        if not self.client:
            return []

        try:
            # Note: Trending topics require different API access
            # This is a placeholder for when available
            return []
        except Exception as e:
            logger.error(f"Error fetching trending topics: {e}")
            return []
