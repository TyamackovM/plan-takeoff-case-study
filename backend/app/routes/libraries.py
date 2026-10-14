from fastapi import APIRouter, HTTPException, Request

from app.fixtures import FixtureError, LibraryNotFound, list_libraries, load_library
from app.schemas import Library, LibrarySummary
from app.state import data_dir_of

router = APIRouter(prefix="/libraries", tags=["libraries"])


@router.get("")
def read_libraries(request: Request) -> list[LibrarySummary]:
    try:
        libraries = list_libraries(data_dir_of(request))
    except FixtureError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return [LibrarySummary.from_library(library) for library in libraries]


@router.get("/{version}")
def read_library(version: str, request: Request) -> Library:
    try:
        return load_library(data_dir_of(request), version)
    except LibraryNotFound:
        raise HTTPException(status_code=404, detail="Library not found") from None
    except FixtureError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
