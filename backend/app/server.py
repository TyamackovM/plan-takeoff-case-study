"""HTTP application.

Fixture routes expose the plans and price libraries. They do not measure or
price anything. Health checks Postgres with ``SELECT 1``.
"""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import uvicorn
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.config import Settings
from app.db import create_pool, wait_for_database
from app.fixtures import FixtureError, LibraryNotFound, PlanNotFound, load_catalog
from app.routes import health, libraries, plans

logger = logging.getLogger(__name__)


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    settings: Settings = app.state.settings
    await wait_for_database(settings.database_url)
    pool = create_pool(settings)
    await pool.open()
    app.state.pool = pool
    logger.info("database pool open")
    try:
        yield
    finally:
        await pool.close()
        logger.info("database pool closed")


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved = settings or Settings()
    configure_logging(resolved.log_level)
    data_dir = resolved.resolved_data_dir()
    if not data_dir.is_dir():
        raise RuntimeError(f"APP_DATA_DIR does not exist: {data_dir}")
    try:
        load_catalog(data_dir)
    except (FixtureError, PlanNotFound, LibraryNotFound) as exc:
        raise RuntimeError(f"fixture inputs are unusable: {exc}") from exc

    app = FastAPI(
        title="Plan takeoff",
        version=__version__,
        lifespan=lifespan,
    )
    app.state.settings = resolved
    app.state.data_dir = data_dir

    app.add_middleware(
        CORSMiddleware,
        allow_origins=resolved.origin_list(),
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    router = APIRouter(prefix="/api/v1")
    router.include_router(health.router)
    router.include_router(plans.router)
    router.include_router(libraries.router)
    app.include_router(router)

    @app.get("/")
    def root() -> dict[str, str]:
        return {
            "service": "plan-takeoff",
            "health": "/api/v1/health",
            "docs": "/docs",
        }

    return app


def main() -> None:
    uvicorn.run(
        "app.server:create_app",
        factory=True,
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
