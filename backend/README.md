# Backend

FastAPI, uv, async psycopg. The process serves the plans and price libraries, and it checks Postgres on `/api/v1/health`. Measurement, pricing, and saved options are not implemented.

Run the commands below from this directory. `APP_DATA_DIR` defaults to `../data`, which is correct when the working directory is `backend/`.

## Local

```bash
cp .env.example .env
uv sync --group dev
uv run uvicorn app.server:create_app --factory --reload --port 8000
```

Postgres has to be reachable at `APP_DATABASE_URL`. From the repo root, `docker compose up db` starts one.

OpenAPI: <http://localhost:8000/docs>.

## What is already here

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/health` | `SELECT 1` against Postgres |
| `GET` | `/api/v1/plans` | Summaries of the plans in `data/plans` |
| `GET` | `/api/v1/plans/{id}` | One plan |
| `GET` | `/api/v1/libraries` | The price-library versions |
| `GET` | `/api/v1/libraries/{version}` | One library (`v1` or `v2`) |

The input models live in `app/schemas.py`. Loading lives in `app/fixtures.py`. `app/takeoff/` is empty.

Startup parses every file in `data/`. A file that does not match the schema stops the process. The schema still accepts an opening that does not fit its wall, and an `assembly_id` that is not in the price library. `opening-too-wide` and `missing-assembly` are those plans.

## Database

`app/db.py` opens a connection pool during application startup and closes it on shutdown. `get_connection` is a FastAPI dependency.

A write has to commit before that dependency returns the connection. The pool rolls back a transaction that is still open:

```python
async with connection.transaction():
    await connection.execute("INSERT INTO ...")
```

`transaction()` commits when the block finishes, and rolls back when the block raises. There is no schema yet. Add tables with SQL, not an ORM.

## Checks

```bash
uv run ruff format --check . && uv run ruff check .
uv run pyright
uv run pytest
```

`pytest` needs Postgres. The HTTP tests call the real health check.
