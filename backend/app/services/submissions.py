from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.submission import Submission, SubmissionStatus
from app.schemas.submission import SubmissionCreate, SubmissionUpdate


class SubmissionService:
    @staticmethod
    async def create(db: AsyncSession, data: SubmissionCreate) -> Submission:
        submission = Submission(**data.model_dump())
        db.add(submission)
        await db.commit()
        await db.refresh(submission)
        return submission

    @staticmethod
    async def list_by_status(
        db: AsyncSession,
        status: SubmissionStatus | None = None,
    ) -> list[Submission]:
        query = select(Submission).order_by(Submission.created_at.desc())
        if status is not None:
            query = query.where(Submission.status == status)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update_status(
        db: AsyncSession,
        submission_id: UUID,
        data: SubmissionUpdate,
    ) -> Submission | None:
        result = await db.execute(
            select(Submission).where(Submission.id == submission_id)
        )
        submission = result.scalar_one_or_none()
        if not submission:
            return None
        submission.status = data.status
        if data.reviewer_notes is not None:
            submission.reviewer_notes = data.reviewer_notes
        await db.commit()
        await db.refresh(submission)
        return submission
