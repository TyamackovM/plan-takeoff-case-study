from pathlib import Path

import pytest
from pydantic import ValidationError

from app.fixtures import list_libraries, list_plans, load_library, load_plan
from app.schemas import Wall

DATA = Path(__file__).resolve().parents[2] / "data"


def _baseline_length(wall: Wall) -> float:
    (x0, y0), (x1, y1) = wall.baseline
    return abs(x1 - x0) + abs(y1 - y0)


def test_shipped_plans_and_libraries_parse() -> None:
    plans = list_plans(DATA)
    libraries = list_libraries(DATA)
    assert {plan.id for plan in plans} == {
        "rectangle",
        "l-plan",
        "opening-too-wide",
        "missing-assembly",
    }
    assert [library.version for library in libraries] == ["v1", "v2"]


def test_library_versions_list_the_same_assemblies_with_a_changed_wall_rate() -> None:
    current = load_library(DATA, "v1")
    updated = load_library(DATA, "v2")
    current_rates = {item.id: item.rate for item in current.assemblies}
    updated_rates = {item.id: item.rate for item in updated.assemblies}
    assert set(current_rates) == set(updated_rates)
    assert current_rates["external-wall"] != updated_rates["external-wall"]
    assert current_rates["internal-partition"] == updated_rates["internal-partition"]
    assert current_rates["ground-slab"] == updated_rates["ground-slab"]
    assert current_rates["roof"] == updated_rates["roof"]


def test_missing_assembly_plan_refers_to_an_unknown_id() -> None:
    plan = load_plan(DATA, "missing-assembly")
    known = {item.id for item in load_library(DATA, "v1").assemblies}
    assert any(wall.assembly_id not in known for wall in plan.storey.walls)


def test_opening_too_wide_does_not_fit_its_wall() -> None:
    plan = load_plan(DATA, "opening-too-wide")
    assert any(
        opening.width_m > _baseline_length(wall)
        for wall in plan.storey.walls
        for opening in wall.openings
    )


def test_diagonal_baseline_is_rejected() -> None:
    with pytest.raises(ValidationError):
        Wall.model_validate(
            {
                "id": "w",
                "assembly_id": "external-wall",
                "baseline": [[0, 0], [1, 1]],
                "thickness_m": 0.3,
                "thickness_side": "right",
                "openings": [],
            }
        )
