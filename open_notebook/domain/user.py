from datetime import datetime
from typing import ClassVar, Optional

from pydantic import Field

from open_notebook.domain.base import ObjectModel


class User(ObjectModel):
    table_name: ClassVar[str] = "user"

    id: Optional[str] = Field(None, description="Unique identifier for the user")
    name: str = Field(default="Default User", description="User name")
    created: datetime = Field(default_factory=datetime.now)
    updated: datetime = Field(default_factory=datetime.now)

    @classmethod
    async def get_default_user(cls) -> "User":
        """Get or create a default user placeholder."""
        from open_notebook.database.repository import repo_query

        users = await cls.get_all()
        if not users:
            user = cls(id=None)
            await user.save()
            return user
        return users[0]
