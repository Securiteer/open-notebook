from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Dict, Any
from api.models import SkillResponse, SkillCreate, SkillRateRequest
from open_notebook.domain.skill import Skill, InstalledSkill
from open_notebook.domain.user import User

router = APIRouter(prefix="/skills", tags=["skills"])

MOCK_SKILLS: List[Dict[str, Any]] = [
    {
        "name": "Creative Writing Assistant",
        "description": "Helps you brainstorm and write creative stories or blog posts.",
        "author": "Alice",
        "version": "1.0.0",
        "instructions": "Just say 'help me write a story about...' and this skill will guide you.",
        "content": "You are a creative writing assistant. Help the user brainstorm ideas, develop characters, and draft their story.",
        "rating": 4.8,
        "rating_count": 120,
    },
    {
        "name": "Code Reviewer Pro",
        "description": "Analyzes your code for bugs, style issues, and performance improvements.",
        "author": "Bob",
        "version": "2.1.0",
        "instructions": "Paste your code snippet and ask for a review.",
        "content": "You are an expert code reviewer. Analyze the provided code for bugs, style issues, and performance improvements. Provide constructive feedback.",
        "rating": 4.5,
        "rating_count": 85,
    },
    {
        "name": "Summarize Master",
        "description": "Condenses long articles into quick, digestible summaries.",
        "author": "Charlie",
        "version": "1.2.0",
        "instructions": "Paste the article or provide a URL to summarize.",
        "content": "You are a summarization expert. Read the provided text and produce a concise summary highlighting the key points.",
        "rating": 4.9,
        "rating_count": 300,
    },
]


async def seed_skills():
    """Seed the database with mock skills if empty."""
    skills = await Skill.get_all()
    if not skills:
        for mock in MOCK_SKILLS:
            skill = Skill(
                id=None,
                name=str(mock["name"]),
                description=str(mock["description"]),
                author=str(mock["author"]),
                version=str(mock["version"]),
                instructions=str(mock["instructions"]),
                content=str(mock["content"]),
                rating=float(mock["rating"]),
                rating_count=int(mock["rating_count"]),
            )
            await skill.save()


@router.get("", response_model=List[SkillResponse])
async def list_skills():
    """List all available skills in the marketplace."""
    skills = await Skill.get_all()
    user = await User.get_default_user()

    all_installed = await InstalledSkill.get_all()
    installed = [i for i in all_installed if i.user_id == user.id]
    installed_skill_ids = {inst.skill_id for inst in installed}

    responses = []
    for skill in skills:
        resp = SkillResponse(
            **skill.model_dump(), is_installed=(skill.id in installed_skill_ids)
        )
        responses.append(resp)

    return responses


@router.get("/installed", response_model=List[SkillResponse])
async def list_installed_skills():
    """List all installed skills for the current user."""
    user = await User.get_default_user()

    all_installed = await InstalledSkill.get_all()
    installed = [i for i in all_installed if i.user_id == user.id]
    installed_skill_ids = [inst.skill_id for inst in installed if inst.skill_id]

    if not installed_skill_ids:
        return []

    skills = [await Skill.get(sid) for sid in installed_skill_ids]
    skills = [s for s in skills if s is not None]

    responses = []
    for skill in skills:
        resp = SkillResponse(**skill.model_dump(), is_installed=True)
        responses.append(resp)

    return responses


@router.get("/{skill_id}", response_model=SkillResponse)
async def get_skill(skill_id: str):
    """Get a specific skill by ID."""
    skill = await Skill.get(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    user = await User.get_default_user()

    all_installed = await InstalledSkill.get_all()
    installed = [i for i in all_installed if i.user_id == user.id]
    is_installed = any(inst.skill_id == skill_id for inst in installed)

    return SkillResponse(**skill.model_dump(), is_installed=is_installed)


@router.post("/upload", response_model=SkillResponse)
async def upload_skill(
    name: str,
    description: str,
    author: str = "Community",
    version: str = "1.0.0",
    instructions: str = "",
    file: UploadFile = File(...),
):
    """Upload a new skill from a .md file."""
    if not file.filename or not file.filename.endswith(".md"):
        raise HTTPException(status_code=400, detail="Only .md files are supported")

    content = (await file.read()).decode("utf-8")

    skill = Skill(
        id=None,
        name=name,
        description=description,
        author=author,
        version=version,
        instructions=instructions,
        content=content,
    )
    await skill.save()

    return SkillResponse(**skill.model_dump(), is_installed=False)


@router.post("/{skill_id}/install", response_model=Dict[str, str])
async def install_skill(skill_id: str):
    """Install a skill for the current user."""
    skill = await Skill.get(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    user = await User.get_default_user()

    all_installed = await InstalledSkill.get_all()
    installed = [i for i in all_installed if i.user_id == user.id]
    if any(inst.skill_id == skill_id for inst in installed):
        return {"status": "already_installed"}

    installation = InstalledSkill(id=None, user_id=user.id or "", skill_id=skill_id)
    await installation.save()

    return {"status": "installed"}


@router.delete("/{skill_id}/uninstall", response_model=Dict[str, str])
async def uninstall_skill(skill_id: str):
    """Uninstall a skill for the current user."""
    user = await User.get_default_user()

    all_installed = await InstalledSkill.get_all()
    installed = [i for i in all_installed if i.user_id == user.id]
    installation = next((inst for inst in installed if inst.skill_id == skill_id), None)

    if not installation:
        return {"status": "not_installed"}

    await installation.delete()

    return {"status": "uninstalled"}


@router.post("/{skill_id}/rate", response_model=SkillResponse)
async def rate_skill(skill_id: str, request: SkillRateRequest):
    """Rate a skill."""
    skill = await Skill.get(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    total_score = (skill.rating * skill.rating_count) + request.rating
    skill.rating_count += 1
    skill.rating = total_score / skill.rating_count

    await skill.save()

    user = await User.get_default_user()

    all_installed = await InstalledSkill.get_all()
    installed = [i for i in all_installed if i.user_id == user.id]
    is_installed = any(inst.skill_id == skill_id for inst in installed)

    return SkillResponse(**skill.model_dump(), is_installed=is_installed)
