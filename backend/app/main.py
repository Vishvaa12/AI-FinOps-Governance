from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import dashboard, demo, history, models, requests
from app.core.config import settings
from app.core.error_handlers import register_error_handlers
from app.core.logging import configure_logging
from app.database import init_db

configure_logging()

app = FastAPI(
    title=settings.app_name,
    description="AI-08 AI FinOps Governance API.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}


app.include_router(demo.router, prefix="/api", tags=["demo"])
app.include_router(requests.router, prefix="/api", tags=["requests"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(history.router, prefix="/api", tags=["history"])
app.include_router(models.router, prefix="/api", tags=["models"])
