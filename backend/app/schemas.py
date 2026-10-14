"""Input models for plans and price libraries.

The schema checks shape. It does not decide how to measure a wall, and it does
not reject ``opening-too-wide`` or ``missing-assembly``.
"""

from typing import Literal, Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

type Point = tuple[float, float]
type ThicknessSide = Literal["left", "right"]
type OpeningKind = Literal["door", "window"]
type AssemblyCategory = Literal["wall", "slab", "roof"]
type AssemblyUnit = Literal["m2"]


class Opening(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    kind: OpeningKind
    along_m: float = Field(ge=0)
    width_m: float = Field(gt=0)
    height_m: float = Field(gt=0)
    sill_m: float = Field(ge=0)


class Wall(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    assembly_id: str = Field(min_length=1)
    baseline: tuple[Point, Point]
    thickness_m: float = Field(gt=0)
    thickness_side: ThicknessSide
    openings: list[Opening] = []

    @model_validator(mode="after")
    def baseline_is_a_real_axis_aligned_segment(self) -> Self:
        (x0, y0), (x1, y1) = self.baseline
        horizontal = y0 == y1 and x0 != x1
        vertical = x0 == x1 and y0 != y1
        if not horizontal and not vertical:
            raise ValueError("baseline must be a non-zero axis-aligned segment")
        return self


class Storey(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    height_m: float = Field(gt=0)
    walls: list[Wall] = Field(min_length=1)

    @model_validator(mode="after")
    def ids_are_unique(self) -> Self:
        wall_ids = [wall.id for wall in self.walls]
        if len(wall_ids) != len(set(wall_ids)):
            raise ValueError("wall ids must be unique within a storey")
        opening_ids = [opening.id for wall in self.walls for opening in wall.openings]
        if len(opening_ids) != len(set(opening_ids)):
            raise ValueError("opening ids must be unique within a storey")
        return self


class Plan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schema_version: Literal[1]
    id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    description: str
    units: Literal["m"]
    storey: Storey


class PlanSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    description: str
    wall_count: int
    opening_count: int
    storey_height_m: float

    @classmethod
    def from_plan(cls, plan: Plan) -> Self:
        return cls(
            id=plan.id,
            name=plan.name,
            description=plan.description,
            wall_count=len(plan.storey.walls),
            opening_count=sum(len(wall.openings) for wall in plan.storey.walls),
            storey_height_m=plan.storey.height_m,
        )


class Assembly(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    category: AssemblyCategory
    unit: AssemblyUnit
    rate: int = Field(gt=0)


class Library(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schema_version: Literal[1]
    version: str = Field(min_length=1)
    currency: Literal["CRD"]
    assemblies: list[Assembly] = Field(min_length=1)

    @model_validator(mode="after")
    def assembly_ids_are_unique(self) -> Self:
        ids = [item.id for item in self.assemblies]
        if len(ids) != len(set(ids)):
            raise ValueError("assembly ids must be unique")
        return self


class LibrarySummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: str
    currency: str
    assembly_count: int

    @classmethod
    def from_library(cls, library: Library) -> Self:
        return cls(
            version=library.version,
            currency=library.currency,
            assembly_count=len(library.assemblies),
        )
