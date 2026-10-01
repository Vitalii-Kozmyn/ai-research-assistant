from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.schemas.user import UserLogin, UserRegister
from app.services.auth import register_user, login_user
from app.schemas.token import TokenResponse

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    user = register_user(db=db, email=user_data.email, password=user_data.password)

    if user is None:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )

    return {
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "email": user.email
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user_tokens = login_user(db=db, email=user_data.email, password=user_data.password)

    return user_tokens