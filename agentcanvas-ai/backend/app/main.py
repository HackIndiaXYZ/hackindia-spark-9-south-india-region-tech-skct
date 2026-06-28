import os
import uuid
import json
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.database import init_db, get_db, Workflow
from app.models import WorkflowCreate, WorkflowResponse, GraphRunPayload
from app.graph_compiler import GraphCompiler

# Load environment variables
load_dotenv()

# Initialize DB tables
init_db()

app = FastAPI(title="AgentCanvas AI API", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

# WORKFLOWS CRUD

@app.get("/api/workflows", response_model=list[WorkflowResponse])
def get_workflows(db: Session = Depends(get_db)):
    db_workflows = db.query(Workflow).all()
    response = []
    for wf in db_workflows:
        response.append(WorkflowResponse(
            id=wf.id,
            name=wf.name,
            description=wf.description,
            nodes=json.loads(wf.nodes),
            edges=json.loads(wf.edges),
            created_at=wf.created_at,
            updated_at=wf.updated_at
        ))
    return response

@app.get("/api/workflows/{workflow_id}", response_model=WorkflowResponse)
def get_workflow(workflow_id: str, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return WorkflowResponse(
        id=wf.id,
        name=wf.name,
        description=wf.description,
        nodes=json.loads(wf.nodes),
        edges=json.loads(wf.edges),
        created_at=wf.created_at,
        updated_at=wf.updated_at
    )

@app.post("/api/workflows", response_model=WorkflowResponse)
def create_or_update_workflow(payload: WorkflowCreate, workflow_id: str = None, db: Session = Depends(get_db)):
    if workflow_id:
        # Update existing
        wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not wf:
            raise HTTPException(status_code=404, detail="Workflow not found")
        wf.name = payload.name
        wf.description = payload.description
        wf.nodes = json.dumps(payload.nodes)
        wf.edges = json.dumps(payload.edges)
    else:
        # Create new
        workflow_id = str(uuid.uuid4())
        wf = Workflow(
            id=workflow_id,
            name=payload.name,
            description=payload.description,
            nodes=json.dumps(payload.nodes),
            edges=json.dumps(payload.edges)
        )
        db.add(wf)
    
    db.commit()
    db.refresh(wf)
    
    return WorkflowResponse(
        id=wf.id,
        name=wf.name,
        description=wf.description,
        nodes=json.loads(wf.nodes),
        edges=json.loads(wf.edges),
        created_at=wf.created_at,
        updated_at=wf.updated_at
    )

@app.delete("/api/workflows/{workflow_id}")
def delete_workflow(workflow_id: str, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    db.delete(wf)
    db.commit()
    return {"message": "Workflow deleted successfully"}

# GRAPH RUNNER EXECUTOR

@app.post("/api/run")
def run_workflow(payload: GraphRunPayload):
    nodes = payload.nodes
    edges = payload.edges
    user_input = payload.user_input
    
    if not nodes:
        raise HTTPException(status_code=400, detail="Cannot run an empty graph. Please add nodes.")
    
    try:
        # Initialize compiler
        compiler = GraphCompiler(nodes=nodes, edges=edges)
        graph_app = compiler.compile()
        
        # Initial State
        initial_state = {
            "user_input": user_input,
            "messages": [],
            "current_node": "",
            "logs": [],
            "variables": {}
        }
        
        # Invoke LangGraph
        result = graph_app.invoke(initial_state)
        
        # Extract response
        final_output = result.get("variables", {}).get("output", "")
        if not final_output and result.get("messages"):
            final_output = result["messages"][-1]["content"]
            
        return {
            "success": True,
            "logs": result.get("logs", []),
            "messages": result.get("messages", []),
            "final_output": final_output
        }
        
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Graph execution failed: {str(e)}")
