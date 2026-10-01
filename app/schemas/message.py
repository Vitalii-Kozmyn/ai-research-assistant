from datetime import datetime
from pydantic import BaseModel

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    chat_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class SourceResponse(BaseModel):
    document_id: int
    filename: str
    page: int


class ChatMessageResponse(BaseModel):
    user_message: MessageResponse
    assistant_message: MessageResponse
    sources: list[SourceResponse]