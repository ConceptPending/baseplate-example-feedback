from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.submission import SubmissionStatus


class SubmissionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    message: str = Field(min_length=1, max_length=10_000)


class SubmissionUpdate(BaseModel):
    status: SubmissionStatus
    reviewer_notes: str | None = None


class SubmissionResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    message: str
    status: SubmissionStatus
    reviewer_notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
