from datetime import datetime
from typing import ClassVar, Optional, List
from pydantic import Field
from open_notebook.domain.base import ObjectModel


class Skill(ObjectModel):
    table_name: ClassVar[str] = "skill"

    id: Optional[str] = Field(None, description="Unique identifier for the skill")
    name: str = Field(..., description="Name of the skill")
    description: str = Field(..., description="Description of the skill")
    author: str = Field(default="Community", description="Author of the skill")
    version: str = Field(default="1.0.0", description="Version of the skill")
    instructions: str = Field(default="", description="Usage instructions")
    content: str = Field(
        ..., description="The prompt template or script content (.md content)"
    )
    rating: float = Field(default=0.0, description="Average rating")
    rating_count: int = Field(default=0, description="Number of ratings")

    created: datetime = Field(default_factory=datetime.now)
    updated: datetime = Field(default_factory=datetime.now)


class InstalledSkill(ObjectModel):
    table_name: ClassVar[str] = "installed_skill"

    id: Optional[str] = Field(None, description="Unique ID for installation")
    user_id: str = Field(..., description="ID of the user")
    skill_id: str = Field(..., description="ID of the skill")

    created: datetime = Field(default_factory=datetime.now)
    updated: datetime = Field(default_factory=datetime.now)
