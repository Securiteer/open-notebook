from fastapi import APIRouter

router = APIRouter(prefix="/simple-video", tags=["simple-video"])

@router.post("/generate")
async def generate_simple_video():
    return {"status": "Not Implemented"}
