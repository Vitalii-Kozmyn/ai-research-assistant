from datetime import datetime
from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: int
    page_count: int | None
    status: str
    created_at: datetime