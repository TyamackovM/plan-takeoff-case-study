"""Postgres pool.

Writes must commit before the connection returns to the pool. ``psycopg_pool``
rolls back a transaction that is still open when the context exits, so a route
that inserts without committing will appear to succeed and then lose the row.

    async with conn.transaction():
        await conn.execute(...)

``transaction()`` commits on a clean exit and rolls back if the block raises.
"""

import asyncio
from collections.abc import AsyncIterator

import psycopg
from fastapi import Request
from psycopg import AsyncConnection
from psycopg_pool import AsyncConnectionPool

from app.config import Settings
from app.state import pool_of


async def wait_for_database(conninfo: str, attempts: int = 30, delay_s: float = 0.5) -> None:
    """Probe Postgres before opening the pool.

    ``AsyncConnectionPool.open`` is not retried: a failed open can leave the
    pool unusable. A short-lived connection is cheap to retry while the
    database is still starting.
    """
    last_error: BaseException | None = None
    for _ in range(attempts):
        try:
            connection = await psycopg.AsyncConnection.connect(conninfo, connect_timeout=3)
        except (psycopg.Error, OSError) as exc:
            last_error = exc
            await asyncio.sleep(delay_s)
        else:
            await connection.close()
            return
    raise RuntimeError("Postgres did not become reachable") from last_error


def create_pool(settings: Settings) -> AsyncConnectionPool[AsyncConnection]:
    return AsyncConnectionPool(
        settings.database_url,
        open=False,
        min_size=1,
        max_size=10,
        timeout=10,
    )


async def get_connection(request: Request) -> AsyncIterator[AsyncConnection]:
    async with pool_of(request).connection() as connection:
        yield connection
