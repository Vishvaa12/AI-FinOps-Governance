import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "AI FinOps Governance API")
    app_env: str = os.getenv("APP_ENV", "development")
    app_debug: bool = os.getenv("APP_DEBUG", "true").lower() == "true"
    database_path: str = os.getenv("DATABASE_PATH", "./data/ai_finops.sqlite")
    cors_origins: list[str] = None  # type: ignore[assignment]

    def __post_init__(self) -> None:
        origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
        object.__setattr__(self, "cors_origins", [origin.strip() for origin in origins.split(",") if origin.strip()])


settings = Settings()
