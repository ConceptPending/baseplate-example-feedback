from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.rate_limit import limiter
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.services.submissions import SubmissionService

router = APIRouter(prefix="/api/submissions", tags=["submissions-public"])


@router.post("", response_model=SubmissionResponse, status_code=201)
# Tight per-IP rate limit — public endpoints attract spam and probes.
@limiter.limit("3/minute")
async def create_submission(
    data: SubmissionCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    return await SubmissionService.create(db, data)
