from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger
from pydantic import BaseModel, EmailStr

from api.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    check_api_password,
    create_access_token,
    get_password_hash,
    verify_password,
)
from open_notebook.database.repository import repo_create, repo_query

router = APIRouter(prefix="/auth", tags=["auth"])


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    invite_code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str


INVITE_CODE = "axelai"


@router.post("/register", response_model=TokenResponse)
async def register(user: UserRegister):
    if user.invite_code != INVITE_CODE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid invite code"
        )

    # Check if user exists
    existing_users = await repo_query(
        "SELECT * FROM user WHERE email = $email", {"email": user.email}
    )
    if existing_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create user
    password_hash = get_password_hash(user.password)
    new_user = await repo_create(
        "user", {"email": user.email, "password_hash": password_hash}
    )

    # Generate token
    user_id = (
        str(new_user[0]["id"]) if isinstance(new_user, list) else str(new_user["id"])
    )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin):
    users = await repo_query(
        "SELECT * FROM user WHERE email = $email", {"email": user.email}
    )

    if not users:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    db_user = users[0]
    if not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = str(db_user["id"])
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(authenticated: bool = Depends(check_api_password)):
    from open_notebook.domain.user_context import get_current_user_id

    user_id = get_current_user_id()

    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    users = await repo_query("SELECT * FROM type::thing($id)", {"id": user_id})

    if not users:
        raise HTTPException(status_code=404, detail="User not found")

    db_user = users[0]
    return {"id": str(db_user["id"]), "email": db_user["email"]}


@router.get("/status")
async def get_auth_status():
    """
    Check if authentication is enabled.
    """
    return {"auth_enabled": True, "message": "Authentication is required"}
    auth_enabled = bool(get_secret_from_env("OPEN_NOTEBOOK_PASSWORD"))

    return {
        "auth_enabled": auth_enabled,
        "message": "Authentication is required"
        if auth_enabled
        else "Authentication is disabled",
    }
