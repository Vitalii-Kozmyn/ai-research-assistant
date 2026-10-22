import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.user import router as user_router
from app.routes.documents import router as documents_router
from app.routes import document_groups, chats, messages

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS"
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(documents_router)
app.include_router(document_groups.router)
app.include_router(chats.router)
app.include_router(messages.router)


@app.get("/")
def root():
    return {"message": "AI Research Assistant API"}