# syntax=docker/dockerfile:1

FROM ghcr.io/astral-sh/uv:0.9.28-python3.12-bookworm-slim

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1 \
    APP_DATA_DIR=/data

COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY backend/app ./app
COPY data /data
RUN uv sync --frozen --no-dev

EXPOSE 8000

CMD ["uv", "run", "--no-dev", "--no-sync", "uvicorn", "app.server:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
