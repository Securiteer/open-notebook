from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from loguru import logger
from passlib.context import CryptContext
from pydantic import BaseModel

from open_notebook.domain.user_context import set_current_user_id
from open_notebook.utils.encryption import get_secret_from_env

# Authentication details
SECRET_KEY = (
    get_secret_from_env("OPEN_NOTEBOOK_SECRET_KEY")
    or "default_secret_key_change_me_in_prod"
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def check_api_password(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> bool:
    """
    Dependency that validates the JWT token and sets the user context.
    Raises 401 if the token is invalid or missing.
    """
    import os
    if os.environ.get("OPEN_NOTEBOOK_TEST_MODE") == "1":
        set_current_user_id("user:test_user_id")
        return True

    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        set_current_user_id(user_id)
        return True
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# For middleware if we want to use it
class JWTAuthMiddleware:
    def __init__(self, app, excluded_paths: Optional[list] = None):
        self.app = app
        self.excluded_paths = excluded_paths or [
            "/",
            "/health",
            "/docs",
            "/openapi.json",
            "/redoc",
            "/auth/status",
            "/auth/login",
            "/auth/register",
        ]

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        import os
        if os.environ.get("OPEN_NOTEBOOK_TEST_MODE") == "1":
            from open_notebook.domain.user_context import set_current_user_id
            set_current_user_id("user:test_user_id")
            return await self.app(scope, receive, send)

        request = Request(scope, receive=receive)

        import os
        if os.environ.get("OPEN_NOTEBOOK_TEST_MODE") == "1":
            return await self.app(scope, receive, send)

        # Skip authentication for excluded paths
        if request.url.path in self.excluded_paths:
            return await self.app(scope, receive, send)

        # Skip authentication for CORS preflight requests (OPTIONS)
        if request.method == "OPTIONS":
            return await self.app(scope, receive, send)

        import os
        if os.environ.get("OPEN_NOTEBOOK_TEST_MODE") == "1":
            return await self.app(scope, receive, send)

        # Check authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            response = JSONResponse(
                status_code=401,
                content={"detail": "Missing authorization header"},
                headers={"WWW-Authenticate": "Bearer"},
            )
            return await response(scope, receive, send)

        try:
            scheme, token = auth_header.split(" ", 1)
            # Skip for tests
            import os
            if os.environ.get("OPEN_NOTEBOOK_TEST_MODE") == "1":
                return await self.app(scope, receive, send)
            if scheme.lower() != "bearer":
                raise ValueError("Invalid scheme")
        except ValueError:
            response = JSONResponse(
                status_code=401,
                content={"detail": "Invalid authorization header format"},
                headers={"WWW-Authenticate": "Bearer"},
            )
            return await response(scope, receive, send)

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                raise ValueError("Missing subject")
            set_current_user_id(user_id)
        except Exception:
            response = JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired token"},
                headers={"WWW-Authenticate": "Bearer"},
            )
            return await response(scope, receive, send)

        return await self.app(scope, receive, send)
