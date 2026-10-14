"""Typed access to the objects ``create_app`` stores on ``app.state``."""

from pathlib import Path

from fastapi import Request
from psycopg import AsyncConnection
from psycopg_pool import AsyncConnectionPool


def data_dir_of(request: Request) -> Path:
    data_dir = request.app.state.data_dir
    if not isinstance(data_dir, Path):
        raise RuntimeError("data directory is not configured")
    return data_dir


def pool_of(request: Request) -> AsyncConnectionPool[AsyncConnection]:
    pool = request.app.state.pool
    if not isinstance(pool, AsyncConnectionPool):
        raise RuntimeError("database pool is not configured")
    return pool
