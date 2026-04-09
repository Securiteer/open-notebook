import asyncio
from datetime import datetime, timezone
from typing import List, Optional

import feedparser
from fastapi import APIRouter, HTTPException
from loguru import logger
from surreal_commands import execute_command_sync

from api.models import NewsArticleResponse
from open_notebook.domain.news import NewsArticle

router = APIRouter()

# Some mock feeds mapped to categories
FEEDS = {
    "Tech": "http://feeds.bbci.co.uk/news/technology/rss.xml",
    "Finance": "http://feeds.bbci.co.uk/news/business/rss.xml",
    "Sports": "http://feeds.bbci.co.uk/sport/rss.xml",
    "Politics": "http://feeds.bbci.co.uk/news/politics/rss.xml",
    "Science": "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml"
}

def parse_time(dt: datetime) -> str:
    now = datetime.now(timezone.utc)
    diff = now - dt
    if diff.days > 0:
        return f"{diff.days} days ago"
    hours = diff.seconds // 3600
    if hours > 0:
        return f"{hours} hours ago"
    minutes = (diff.seconds % 3600) // 60
    return f"{minutes} minutes ago"

async def fetch_feed(category: str, url: str) -> List[NewsArticle]:
    try:
        # Run feedparser in a thread since it's blocking
        feed = await asyncio.to_thread(feedparser.parse, url)
        articles = []
        for entry in feed.entries[:5]: # Get top 5 from each feed
            title = entry.get("title", "")
            summary = entry.get("summary", "")
            link = entry.get("link", "")

            # Find an image
            image = None
            if "media_content" in entry and len(entry.media_content) > 0:
                image = entry.media_content[0].get("url")
            elif "media_thumbnail" in entry and len(entry.media_thumbnail) > 0:
                image = entry.media_thumbnail[0].get("url")

            published_date = entry.get("published", "")
            time_str = "Recently"
            if "published_parsed" in entry and entry.published_parsed:
                dt = datetime(*entry.published_parsed[:6]).replace(tzinfo=timezone.utc)
                time_str = parse_time(dt)

            # Create our domain model without saving it yet
            article = NewsArticle(
                category=category,
                source="BBC", # Using BBC RSS
                title=title,
                summary=summary,
                image=image,
                url=link,
                time=time_str,
                published_date=published_date,
                likes=0,
                dislikes=0
            )
            articles.append(article)
        return articles
    except Exception as e:
        logger.error(f"Error fetching feed {url}: {e}")
        return []

@router.get("/news", response_model=List[NewsArticleResponse])
async def get_news():
    """
    Get live news articles.
    We fetch from RSS feeds if we don't have recent articles in DB.
    For simplicity in this implementation, we will fetch, save to DB, and return.
    In a real system, you might have a background task doing this.
    """
    try:
        # Check if we have articles in DB
        # If we have articles from the last hour, use those
        # But to be simple and ensure we see new data, we will just fetch every time and upsert by URL
        # For this prototype, we'll fetch, delete all old, and save new.

        all_articles = []
        tasks = []
        for category, url in FEEDS.items():
            tasks.append(fetch_feed(category, url))

        results = await asyncio.gather(*tasks)
        for result in results:
            all_articles.extend(result)

        # Save to DB (using sync loop or command)
        # Assuming we just clear the table and insert

        from open_notebook.database.repository import repo_create, repo_delete
        from open_notebook.domain.base import ObjectModel

        # This is a bit brute force, but simple
        try:
            old_articles = await NewsArticle.get_all()
            for old in old_articles:
                if old.id:
                    await old.delete()
        except Exception:
            pass

        saved_articles: List[NewsArticle] = []
        for article in all_articles:
            await article.save()
            saved = article
            saved_articles.append(saved)

        response = []
        for a in saved_articles:
            response.append(
                NewsArticleResponse(
                    id=a.id,
                    category=a.category,
                    source=a.source,
                    title=a.title,
                    summary=a.summary,
                    image=a.image,
                    url=a.url,
                    time=a.time,
                    published_date=a.published_date,
                    likes=a.likes,
                    dislikes=a.dislikes
                )
            )

        return response
    except Exception as e:
        logger.error(f"Error in get_news: {e}")
        raise HTTPException(status_code=500, detail=str(e))
