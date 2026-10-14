from fastapi import APIRouter, HTTPException, Request

from app.fixtures import FixtureError, PlanNotFound, list_plans, load_plan
from app.schemas import Plan, PlanSummary
from app.state import data_dir_of

router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("")
def read_plans(request: Request) -> list[PlanSummary]:
    try:
        plans = list_plans(data_dir_of(request))
    except FixtureError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return [PlanSummary.from_plan(plan) for plan in plans]


@router.get("/{plan_id}")
def read_plan(plan_id: str, request: Request) -> Plan:
    try:
        return load_plan(data_dir_of(request), plan_id)
    except PlanNotFound:
        raise HTTPException(status_code=404, detail="Plan not found") from None
    except FixtureError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
