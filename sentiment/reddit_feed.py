"""
Reddit sentiment feed using PRAW.
"""
from typing import Optional
import asyncio

from config import Config
from utils.logger import get_logger

logger = get_logger("reddit")


class RedditFeed:
    """Fetches and analyzes Reddit sentiment for trading signals."""

    def __init__(self):
        """Initialize Reddit client."""
        self.reddit = None
        self._init_client()

    def _init_client(self):
        """Initialize PRAW client if credentials are available."""
        if not Config.REDDIT_CLIENT_ID or not Config.REDDIT_CLIENT_SECRET:
            logger.warning("Reddit API credentials not configured")
            return

        try:
            import praw

            self.reddit = praw.Reddit(
                client_id=Config.REDDIT_CLIENT_ID,
                client_secret=Config.REDDIT_CLIENT_SECRET,
                user_agent=Config.REDDIT_USER_AGENT,
            )
            logger.info("Reddit client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Reddit client: {e}")

    def _get_subreddits_for_symbol(self, symbol: str) -> list[str]:
        """Get relevant subreddits for a symbol."""
        # Check if crypto or stock
        if "/" in symbol or symbol in ["BTC", "ETH", "SOL"]:
            return Config.CRYPTO_SUBREDDITS
        return Config.STOCK_SUBREDDITS

    async def get_sentiment(
        self,
        keywords: list[str],
        symbol: str,
        max_posts: int = 50,
        include_comments: bool = True,
    ) -> Optional[float]:
        """
        Fetch Reddit posts/comments and calculate sentiment.

        Args:
            keywords: Keywords to search for
            symbol: Asset symbol to determine subreddits
            max_posts: Maximum posts to analyze
            include_comments: Whether to include comment sentiment

        Returns:
            Sentiment score from -1 to 1, or None if unavailable
        """
        if not self.reddit:
            return None

        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

            vader = SentimentIntensityAnalyzer()

            subreddits = self._get_subreddits_for_symbol(symbol)
            all_texts = []
            all_weights = []

            loop = asyncio.get_event_loop()

            for subreddit_name in subreddits:
                try:
                    subreddit = await loop.run_in_executor(
                        None, lambda sn=subreddit_name: self.reddit.subreddit(sn)
                    )

                    # Search for relevant posts
                    search_query = " OR ".join(keywords[:3])  # Limit query length
                    posts = await loop.run_in_executor(
                        None,
                        lambda sq=search_query: list(
                            subreddit.search(
                                sq, sort="hot", time_filter="day", limit=max_posts
                            )
                        ),
                    )

                    for post in posts:
                        # Analyze post title and body
                        text = f"{post.title} {post.selftext or ''}"
                        score = vader.polarity_scores(text)["compound"]

                        # Weight by upvotes and comments
                        weight = 1 + (post.score / 100) + (post.num_comments / 50)
                        all_texts.append(score)
                        all_weights.append(weight)

                        # Optionally analyze top comments
                        if include_comments and post.num_comments > 0:
                            try:
                                post.comments.replace_more(limit=0)
                                for comment in post.comments[:5]:
                                    if hasattr(comment, "body"):
                                        c_score = vader.polarity_scores(comment.body)[
                                            "compound"
                                        ]
                                        c_weight = 1 + (comment.score / 50)
                                        all_texts.append(c_score)
                                        all_weights.append(c_weight)
                            except Exception:
                                pass  # Skip if comments can't be loaded

                except Exception as e:
                    logger.warning(f"Error fetching from r/{subreddit_name}: {e}")
                    continue

            if not all_texts:
                logger.warning(f"No Reddit posts found for {keywords}")
                return None

            # Calculate weighted average
            weighted_sum = sum(s * w for s, w in zip(all_texts, all_weights))
            total_weight = sum(all_weights)
            avg_sentiment = weighted_sum / total_weight

            logger.info(
                f"Reddit sentiment for {keywords[0]}: {avg_sentiment:.3f} "
                f"({len(all_texts)} posts/comments)"
            )

            return avg_sentiment

        except Exception as e:
            logger.error(f"Error calculating Reddit sentiment: {e}")
            return None

    async def get_wsb_mentions(self, limit: int = 100) -> dict[str, int]:
        """
        Get stock ticker mention counts from r/wallstreetbets.

        Returns:
            Dictionary of ticker symbols to mention counts
        """
        if not self.reddit:
            return {}

        try:
            import re

            loop = asyncio.get_event_loop()
            wsb = await loop.run_in_executor(
                None, lambda: self.reddit.subreddit("wallstreetbets")
            )

            posts = await loop.run_in_executor(
                None, lambda: list(wsb.hot(limit=limit))
            )

            # Pattern for stock tickers (1-5 uppercase letters)
            ticker_pattern = re.compile(r"\b[A-Z]{1,5}\b")

            # Common words to exclude
            exclude = {
                "I",
                "A",
                "THE",
                "IS",
                "IT",
                "TO",
                "FOR",
                "ON",
                "IN",
                "OF",
                "AND",
                "OR",
                "BE",
                "AT",
                "IF",
                "SO",
                "DD",
                "CEO",
                "CFO",
                "IPO",
                "SEC",
                "FDA",
                "USA",
                "USD",
                "UK",
                "EU",
                "ETF",
                "AM",
                "PM",
                "IMO",
                "TL",
                "DR",
                "OP",
            }

            mentions = {}
            for post in posts:
                text = f"{post.title} {post.selftext or ''}"
                tickers = ticker_pattern.findall(text)
                for ticker in tickers:
                    if ticker not in exclude and len(ticker) >= 2:
                        mentions[ticker] = mentions.get(ticker, 0) + 1

            # Sort by mentions
            sorted_mentions = dict(
                sorted(mentions.items(), key=lambda x: x[1], reverse=True)[:20]
            )

            return sorted_mentions

        except Exception as e:
            logger.error(f"Error getting WSB mentions: {e}")
            return {}
