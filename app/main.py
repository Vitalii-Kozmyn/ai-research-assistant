import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
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
            "CORS_ORIGINS",
            "http://localhost:5173",
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

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"
INDEX_HTML = FRONTEND_DIST / "index.html"
ASSETS_DIR = FRONTEND_DIST / "assets"


@app.get("/", include_in_schema=False)
def serve_frontend():
    if INDEX_HTML.exists():
        return FileResponse(INDEX_HTML)

    return {"message": "AI Research Assistant API"}


if ASSETS_DIR.is_dir():
    app.mount(
        "/assets",
        StaticFiles(directory=ASSETS_DIR),
        name="assets",
    )

@app.get("/{full_path:path}", include_in_schema=False)
def serve_react_routes(full_path: str):
    requested_file = (FRONTEND_DIST / full_path).resolve()

    if (
        requested_file.is_relative_to(FRONTEND_DIST.resolve())
        and requested_file.is_file()
    ):
        return FileResponse(requested_file)

    if INDEX_HTML.exists():
        return FileResponse(INDEX_HTML)

    return {"detail": "Not Found"}