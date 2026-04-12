import asyncio
import os
import shutil
import subprocess
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException

from api.auth import check_api_password


async def get_current_user(user: Any = Depends(check_api_password)):
    return user

router = APIRouter(prefix="/api/deeptutor", tags=["deeptutor"])

# In-memory dictionary to track ports mapped to users. In a production app,
# this should be stored in the DB (SurrealDB) to persist across restarts.
user_ports: Dict[str, int] = {}
base_port = 10000

def get_user_deeptutor_dir(user_id: str) -> str:
    """Gets the unique directory for a user's DeepTutor docker context."""
    path = f"/tmp/deeptutor_sandboxes/{user_id}"
    os.makedirs(path, exist_ok=True)
    return path

async def ensure_deeptutor_repo_exists():
    """Ensure the base DeepTutor repository exists to clone from."""
    if not os.path.exists("/tmp/DeepTutor"):
        process = await asyncio.create_subprocess_shell(
            "git clone https://github.com/HKUDS/DeepTutor.git /tmp/DeepTutor",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await process.communicate()

def setup_user_sandbox(user_id: str) -> int:
    """Set up the docker compose environment for the user if it doesn't exist."""
    global base_port
    sandbox_dir = get_user_deeptutor_dir(user_id)

    # Check if we already have a port assigned
    if user_id not in user_ports:
        user_ports[user_id] = base_port
        base_port += 2  # Each instance needs 2 ports based on docker-compose (frontend & backend)

    port = user_ports[user_id]

    # Initialize the sandbox directory with the code
    if not os.path.exists(os.path.join(sandbox_dir, "docker-compose.yml")):
        # Copy everything from base repository
        os.system(f"cp -r /tmp/DeepTutor/* {sandbox_dir}/")

        # Ensure data directories exist for persistent storage inside the sandbox dir
        os.makedirs(os.path.join(sandbox_dir, "data", "user", "settings"), exist_ok=True)
        os.makedirs(os.path.join(sandbox_dir, "data", "knowledge_bases"), exist_ok=True)

        # Create a basic .env file overriding the ports specifically for this user
        env_content = f"""
BACKEND_PORT={port}
FRONTEND_PORT={port+1}
LLM_BINDING=openai
LLM_MODEL=gpt-4o-mini
LLM_API_KEY=dummy
EMBEDDING_BINDING=openai
EMBEDDING_MODEL=text-embedding-3-large
EMBEDDING_API_KEY=dummy
NEXT_PUBLIC_API_BASE=http://localhost:{port}
        """
        with open(os.path.join(sandbox_dir, ".env"), "w") as f:
            f.write(env_content)

    return port + 1 # Return frontend port

@router.post("/start")
async def start_sandbox(current_user: Any = Depends(get_current_user)):
    user_id = "default_user"
    await ensure_deeptutor_repo_exists()

    frontend_port = setup_user_sandbox(user_id)
    sandbox_dir = get_user_deeptutor_dir(user_id)

    # Use docker compose up
    # Note: in a real environment we might want to check if it's already running
    process = await asyncio.create_subprocess_shell(
        f"cd {sandbox_dir} && docker compose up -d",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        raise HTTPException(status_code=500, detail=f"Failed to start sandbox: {stderr.decode()}")

    return {"status": "started", "port": frontend_port, "url": f"http://localhost:{frontend_port}"}

@router.post("/stop")
async def stop_sandbox(current_user: Any = Depends(get_current_user)):
    user_id = "default_user"
    sandbox_dir = get_user_deeptutor_dir(user_id)

    if not os.path.exists(sandbox_dir):
        return {"status": "stopped", "message": "No sandbox exists"}

    process = await asyncio.create_subprocess_shell(
        f"cd {sandbox_dir} && docker compose down",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        raise HTTPException(status_code=500, detail=f"Failed to stop sandbox: {stderr.decode()}")

    return {"status": "stopped"}

@router.get("/status")
async def get_status(current_user: Any = Depends(get_current_user)):
    user_id = "default_user"

    if user_id not in user_ports:
        return {"status": "stopped", "url": None}

    sandbox_dir = get_user_deeptutor_dir(user_id)

    # Check if container is running
    process = await asyncio.create_subprocess_shell(
        f"cd {sandbox_dir} && docker compose ps --format json",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await process.communicate()

    # Very basic check, if we got output, it's probably running
    is_running = len(stdout.decode().strip()) > 0

    if is_running:
        frontend_port = user_ports[user_id] + 1
        return {"status": "running", "url": f"http://localhost:{frontend_port}"}
    else:
        return {"status": "stopped", "url": None}
