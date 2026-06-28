from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    nodes: List[Dict[str, Any]] = Field(default_factory=list)
    edges: List[Dict[str, Any]] = Field(default_factory=list)

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GraphRunPayload(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    user_input: str
