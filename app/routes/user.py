from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(
    prefix="/user",
    tags=["User"]
)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user