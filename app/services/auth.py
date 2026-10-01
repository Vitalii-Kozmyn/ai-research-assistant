from http.client import HTTPException

from sqlalchemy.orm import Session 
from app.models.user import User
from app.utils import create_access_token, create_refresh_token, get_hashed_password, verify_password

def register_user(db: Session, email: str, password: str):
    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        return None

    hashed_password = get_hashed_password(password)

    user = User(email=email, password_hash=hashed_password)

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def login_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise HTTPException(
            status_code=400,
            detail="Incorrect email or password"
        )

    hashed_password = user.password_hash

    if not verify_password(password, hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect email or password"
        )    

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)   

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }