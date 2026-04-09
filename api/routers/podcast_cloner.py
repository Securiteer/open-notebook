from fastapi import APIRouter, HTTPException
from loguru import logger
from pydantic import BaseModel

from api.podcast_cloner_service import podcast_cloner_service

router = APIRouter()


class PodcastClonerRequest(BaseModel):
    podcast_name: str
    num_episodes: int = 10


class PodcastClonerResponse(BaseModel):
    job_id: str
    status: str
    message: str


@router.post("/podcast-cloner/submit", response_model=PodcastClonerResponse)
async def submit_podcast_cloner_job(request: PodcastClonerRequest):
    """Submit a background job to clone a podcast"""
    try:
        job_id = await podcast_cloner_service.submit_cloner_job(
            podcast_name=request.podcast_name, num_episodes=request.num_episodes
        )
        return PodcastClonerResponse(
            job_id=job_id,
            status="submitted",
            message=f"Podcast cloning started for '{request.podcast_name}'",
        )
    except Exception as e:
        logger.error(f"Error submitting podcast cloner job: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to submit podcast cloner job"
        )


@router.get("/podcast-cloner/jobs/{job_id}")
async def get_podcast_cloner_job_status(job_id: str):
    """Get the status of a podcast cloner job"""
    try:
        status_data = await podcast_cloner_service.get_job_status(job_id)
        return status_data
    except Exception as e:
        logger.error(f"Error fetching podcast cloner job status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch job status")
