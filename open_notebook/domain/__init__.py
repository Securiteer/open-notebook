"""
Domain models for Open Notebook.

This module exports the core domain models used throughout the application.
"""

__all__: list[str] = []
from .skill import InstalledSkill, Skill
from .user import User

__all__.extend(["Skill", "InstalledSkill", "User"])
