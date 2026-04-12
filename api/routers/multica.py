import subprocess
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/multica", tags=["multica"])

@router.post("/install")
async def install_multica():
    try:
        # Note: This executes the install script from the repo
        result = subprocess.run(
            ["curl -fsSL https://raw.githubusercontent.com/multica-ai/multica/main/scripts/install.sh | bash -s -- --local"],
            shell=True,
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            return {"status": "error", "message": result.stderr}
        return {"status": "success", "message": result.stdout}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/start")
async def start_multica():
    try:
        result = subprocess.run(
            ["multica daemon start"],
            shell=True,
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            return {"status": "error", "message": result.stderr}
        return {"status": "success", "message": result.stdout}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    try:
        result = subprocess.run(
            ["multica daemon status"],
            shell=True,
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
             return {"status": "error", "message": "Daemon not running or not found", "output": result.stderr}
        return {"status": "success", "message": "Running", "output": result.stdout}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# End of multica router

# Verified
