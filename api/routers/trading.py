from typing import List

from fastapi import APIRouter, Depends, HTTPException

from open_notebook.trading.models import (
    CreateIntegrationRequest,
    CreateWorkflowRequest,
    TradingIntegration,
    TradingWorkflow,
)
from open_notebook.trading.services import create_integration, create_workflow

router = APIRouter(prefix="/trading", tags=["trading"])

@router.post("/integrations", response_model=TradingIntegration)
async def add_integration(request: CreateIntegrationRequest):
    return await create_integration(request.model_dump())

@router.get("/integrations", response_model=List[TradingIntegration])
async def list_integrations():
    return []

@router.post("/workflows", response_model=TradingWorkflow)
async def add_workflow(request: CreateWorkflowRequest):
    return await create_workflow(request.model_dump())

@router.get("/workflows", response_model=List[TradingWorkflow])
async def list_workflows():
    return []

@router.get("/state")
async def get_trading_state():
    return {
        "status": "Running",
        "balance": 10000.00,
        "positions": []
    }
