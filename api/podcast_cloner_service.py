from typing import Any, Dict, Optional

from fastapi import HTTPException
from loguru import logger
from surreal_commands import get_command_status, submit_command


class PodcastClonerService:
    """Service layer for podcast cloner operations"""

    @staticmethod
    async def submit_cloner_job(podcast_name: str, num_episodes: int = 10) -> str:
        """Submit a podcast cloner job for background processing"""
        try:
            command_args = {
                "podcast_name": podcast_name,
                "num_episodes": num_episodes,
            }

            try:
                import commands.podcast_cloner_commands  # noqa: F401
            except ImportError as import_err:
                logger.error(f"Failed to import podcast cloner commands: {import_err}")
                raise ValueError("Podcast cloner commands not available")

            job_id = submit_command("open_notebook", "clone_podcast", command_args)

            if not job_id:
                raise ValueError("Failed to get job_id from submit_command")

            job_id_str = str(job_id)
            logger.info(
                f"Submitted podcast cloner job: {job_id_str} for '{podcast_name}'"
            )
            return job_id_str

        except Exception as e:
            logger.error(f"Failed to submit podcast cloner job: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to submit podcast cloner job: {str(e)}",
            )

    @staticmethod
    async def get_job_status(job_id: str) -> Dict[str, Any]:
        """Get status of a podcast cloner job"""
        try:
            status = await get_command_status(job_id)
            return {
                "job_id": job_id,
                "status": status.status if status else "unknown",
                "result": status.result if status else None,
                "error_message": getattr(status, "error_message", None)
                if status
                else None,
            }
        except Exception as e:
            logger.error(f"Failed to get podcast cloner job status: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to get job status: {str(e)}"
            )


podcast_cloner_service = PodcastClonerService()
