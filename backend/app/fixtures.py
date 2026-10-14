"""Read the fixture plans and price libraries from disk."""

import json
import re
from pathlib import Path

from pydantic import ValidationError

from app.schemas import Library, Plan

_ID = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

LIBRARY_FILES: dict[str, str] = {
    "v1": "assemblies.json",
    "v2": "assemblies-v2.json",
}


class FixtureError(Exception):
    """A shipped input file is missing or does not match the schema."""

    def __init__(self, path: Path, message: str) -> None:
        self.path = path
        super().__init__(f"{path}: {message}")


class PlanNotFound(Exception):
    def __init__(self, plan_id: str) -> None:
        self.plan_id = plan_id
        super().__init__(plan_id)


class LibraryNotFound(Exception):
    def __init__(self, version: str) -> None:
        self.version = version
        super().__init__(version)


def load_plan(data_dir: Path, plan_id: str) -> Plan:
    if not _ID.fullmatch(plan_id):
        raise PlanNotFound(plan_id)
    path = data_dir / "plans" / f"{plan_id}.json"
    if not path.is_file():
        raise PlanNotFound(plan_id)
    plan = _read_model(path, Plan)
    if plan.id != plan_id:
        raise FixtureError(path, f"id is {plan.id!r}, file name is {plan_id!r}")
    return plan


def list_plans(data_dir: Path) -> list[Plan]:
    directory = data_dir / "plans"
    if not directory.is_dir():
        raise FixtureError(directory, "plans directory is missing")
    plans = [load_plan(data_dir, path.stem) for path in sorted(directory.glob("*.json"))]
    if not plans:
        raise FixtureError(directory, "no plans found")
    return plans


def load_library(data_dir: Path, version: str) -> Library:
    file_name = LIBRARY_FILES.get(version)
    if file_name is None:
        raise LibraryNotFound(version)
    path = data_dir / "library" / file_name
    if not path.is_file():
        raise FixtureError(path, "library file is missing")
    library = _read_model(path, Library)
    if library.version != version:
        raise FixtureError(path, f"version is {library.version!r}, expected {version!r}")
    return library


def list_libraries(data_dir: Path) -> list[Library]:
    return [load_library(data_dir, version) for version in LIBRARY_FILES]


def load_catalog(data_dir: Path) -> None:
    """Parse every shipped fixture. Raises if one of them is unusable."""
    list_plans(data_dir)
    list_libraries(data_dir)


def _read_model[ModelT: Plan | Library](path: Path, model: type[ModelT]) -> ModelT:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        return model.model_validate(payload)
    except (OSError, json.JSONDecodeError, ValidationError) as exc:
        raise FixtureError(path, str(exc)) from exc
