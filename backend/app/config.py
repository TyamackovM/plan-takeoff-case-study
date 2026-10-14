"""Process settings.

Environment variables use the ``APP_`` prefix, for example ``APP_DATABASE_URL``.
A ``.env`` file in the working directory is read when present. The process
environment wins over that file.
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="APP_",
        env_file=".env",
        extra="ignore",
    )

    log_level: str = "INFO"
    database_url: str = "postgresql://postgres:postgres@localhost:5432/takeoff"
    data_dir: Path = Path("../data")
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    def origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    def resolved_data_dir(self) -> Path:
        return self.data_dir.expanduser().resolve()
