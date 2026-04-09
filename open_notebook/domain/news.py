from typing import ClassVar, Optional

from pydantic import Field

from open_notebook.domain.base import ObjectModel


class NewsArticle(ObjectModel):
    table_name: ClassVar[str] = "news_article"

    category: str
    source: str
    title: str
    summary: str
    image: Optional[str] = None
    url: str
    time: str # Store as string for display like '2 hours ago', or we can store published date
    published_date: Optional[str] = None
    likes: int = 0
    dislikes: int = 0
