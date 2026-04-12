import contextvars
from typing import Optional

# Context variable to store the current user's ID
# It will be set by the authentication middleware for each request
current_user_id: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar(
    "current_user_id", default=None
)


def get_current_user_id() -> Optional[str]:
    """Get the current user's ID from the context."""
    return current_user_id.get()


def set_current_user_id(user_id: Optional[str]) -> contextvars.Token:
    """Set the current user's ID in the context."""
    return current_user_id.set(user_id)
