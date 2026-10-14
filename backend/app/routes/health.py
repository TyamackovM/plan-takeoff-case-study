from typing import Annotated

from fastapi import APIRouter, Depends
from psycopg import AsyncConnection

from app.db import get_connection

router = APIRouter(tags=["health"])

Connection = Annotated[AsyncConnection, Depends(get_connection)]


@router.get("/health")
async def health(connection: Connection) -> dict[str, str]:
    async with connection.cursor() as cursor:
        await cursor.execute("SELECT 1")
        row = await cursor.fetchone()
    if row != (1,):
        raise RuntimeError("database health check returned an unexpected row")
    return {"status": "ok"}
