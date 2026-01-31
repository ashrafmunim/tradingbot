"""
News sentiment feed using NewsAPI.
"""
from typing import Optional
from datetime import datetime, timedelta
import asyncio

from config import Config
from utils.logger import get_logger

logger = get_logger("news")


class NewsFeed:
    """Fetches and analyzes news sentiment for trading signals."""

    def __init__(self):
        """Initialize NewsAPI client."""
        self.api = None
        self._init_client()

    def _init_client(self):
        """Initialize NewsAPI client if credentials are available."""
        if not Config.NEWS_API_KEY:
            logger.warning("News API key not configured")
            return

        try:
            from newsapi import NewsApiClient

            self.api = NewsApiClient(api_key=Config.NEWS_API_KEY)
            logger.info("News API client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize News API client: {e}")

    async def get_sentiment(
        self, keywords: list[str], days_back: int = 1
    ) -> Optional[float]:
        """
        Fetch news articles and calculate sentiment.

        Args:
            keywords: Keywords to search for
            days_back: Number of days to look back

        Returns:
            Sentiment score from -1 to 1, or None if unavailable
        """
        if not self.api:
            return None

        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

            vader = SentimentIntensityAnalyzer()

            # Build query
            query = " OR ".join(keywords[:5])
            from_date = (datetime.now() - timedelta(days=days_back)).strftime(
                "%Y-%m-%d"
            )

            loop = asyncio.get_event_loop()
            articles = await loop.run_in_executor(
                None,
                lambda: self.api.get_everything(
                    q=query,
                    from_param=from_date,
                    language="en",
                    sort_by="relevancy",
                    page_size=50,
                ),
            )

            if not articles.get("articles"):
                logger.warning(f"No news articles found for {keywords}")
                return None

            scores = []
            for article in articles["articles"]:
                # Combine title and description for analysis
                title = article.get("title", "") or ""
                description = article.get("description", "") or ""
                text = f"{title} {description}"

                if text.strip():
                    score = vader.polarity_scores(text)["compound"]
                    scores.append(score)

            if not scores:
                return None

            avg_sentiment = sum(scores) / len(scores)

            logger.info(
                f"News sentiment for {keywords[0]}: {avg_sentiment:.3f} "
                f"({len(scores)} articles)"
            )

            return avg_sentiment

        except Exception as e:
            logger.error(f"Error calculating news sentiment: {e}")
            return None

    async def get_top_headlines(
        self, category: str = "business", country: str = "us"
    ) -> list[dict]:
        """
        Get top headlines for market overview.

        Args:
            category: News category (business, technology, etc.)
            country: Country code

        Returns:
            List of headline dictionaries
        """
        if not self.api:
            return []

        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.api.get_top_headlines(
                    category=category, country=country, page_size=20
                ),
            )

            headlines = []
            for article in response.get("articles", []):
                headlines.append(
                    {
                        "title": article.get("title"),
                        "source": article.get("source", {}).get("name"),
                        "url": article.get("url"),
                        "published_at": article.get("publishedAt"),
                    }
                )

            return headlines

        except Exception as e:
            logger.error(f"Error fetching headlines: {e}")
            return []

    async def get_market_news_sentiment(self) -> Optional[float]:
        """
        Get overall market sentiment from business news.

        Returns:
            Aggregate market sentiment score
        """
        if not self.api:
            return None

        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

            vader = SentimentIntensityAnalyzer()

            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.api.get_top_headlines(
                    category="business", country="us", page_size=50
                ),
            )

            scores = []
            for article in response.get("articles", []):
                title = article.get("title", "") or ""
                description = article.get("description", "") or ""
                text = f"{title} {description}"

                if text.strip():
                    score = vader.polarity_scores(text)["compound"]
                    scores.append(score)

            if not scores:
                return None

            return sum(scores) / len(scores)

        except Exception as e:
            logger.error(f"Error calculating market news sentiment: {e}")
            return None
