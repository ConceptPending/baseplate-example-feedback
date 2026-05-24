from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_admin
from app.models.submission import SubmissionStatus
from app.schemas.submission import SubmissionResponse, SubmissionUpdate
from app.services.submissions import SubmissionService

router = APIRouter(
    prefix="/api/admin/submissions",
    tags=["submissions-admin"],
    dependencies=[Depends(get_current_admin)],
)


@router.get("", response_model=list[SubmissionResponse])
async def list_submissions(
    status: SubmissionStatus | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    return await SubmissionService.list_by_status(db, status)


@router.patch("/{submission_id}", response_model=SubmissionResponse)
async def review_submission(
    submission_id: UUID,
    data: SubmissionUpdate,
    db: AsyncSession = Depends(get_db),
):
    submission = await SubmissionService.update_status(db, submission_id, data)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission
