from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from open_notebook.domain.base import ObjectModel, RecordModel


class TradingIntegration(ObjectModel):
    name: str
    exchange: str
    api_key: str
    api_secret: str
    is_active: bool = True

class TradingWorkflow(ObjectModel):
    name: str
    description: str
    prompt: str
    integration_id: str
    is_active: bool = True

class TradingState(ObjectModel):
    workflow_id: str
    balance: float
    positions: List[Dict[str, Any]]
    last_updated: datetime

class CreateIntegrationRequest(BaseModel):
    name: str
    exchange: str
    api_key: str
    api_secret: str

class CreateWorkflowRequest(BaseModel):
    name: str
    description: str
    prompt: str
    integration_id: str
