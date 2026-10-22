import bcrypt
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from typing import Union, Any
from jose import jwt
import os
import zipfile
import xml.etree.ElementTree as ET
from pypdf import PdfReader

load_dotenv()

ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

ALGORITHM = "HS256"

JWT_SECRET_KEY = os.environ["JWT_SECRET_KEY"]
JWT_REFRESH_SECRET_KEY = os.environ["JWT_REFRESH_SECRET_KEY"]


def get_hashed_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(password: str, hashed_pass: str) -> bool:
    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed_pass.encode("utf-8")
    )


def create_access_token(subject: Union[str, Any], expires_delta: timedelta | None = None) -> str:
    if expires_delta is not None:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expire,"sub": str(subject)}

    return jwt.encode(
        to_encode,
        JWT_SECRET_KEY,
        algorithm=ALGORITHM
    )


def create_refresh_token(subject: Union[str, Any], expires_delta: timedelta | None = None) -> str:
    if expires_delta is not None:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=REFRESH_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expire, "sub": str(subject)}

    return jwt.encode(
        to_encode,
        JWT_REFRESH_SECRET_KEY,
        algorithm=ALGORITHM
    )

def decode_refresh_token(token: str):
    try:
        payload = jwt.decode(
            token,
            JWT_REFRESH_SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            return None

        return user_id

    except Exception:
        return None

def get_pdf_page_count(file_path: str) -> int | None:
    try:
        reader = PdfReader(file_path)
        return len(reader.pages)
    except Exception as e:
        print(f"PDF reading error: {e}")
        return None

def get_docx_page_count(file_path: str) -> int | None:
    try:
        with zipfile.ZipFile(file_path, 'r') as docx_zip:
            app_xml = docx_zip.read('docProps/app.xml')
            root = ET.fromstring(app_xml)

            for child in root:
                if 'Pages' in child.tag:
                    return int(child.text)
        return None
    except Exception as e:
        print(f"DOCX reading error: {e}")
        return None