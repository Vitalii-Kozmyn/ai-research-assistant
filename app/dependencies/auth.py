from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError
from app.schemas.token import TokenData
from app.config.database import get_db
from app.models.user import User
from sqlalchemy.orm import Session

from app.utils import ALGORITHM, JWT_SECRET_KEY

reuseable_oauth = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(reuseable_oauth), db: Session = Depends(get_db)):
    try:
        decode = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        
        token_data = TokenData(**decode)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

    user = db.query(User).filter(User.id == int(token_data.sub)).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

    return user