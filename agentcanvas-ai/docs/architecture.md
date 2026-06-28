# AgentCanvas AI - Architecture Guide

This document details the architectural layout of the **AgentCanvas AI** visual node orchestration platform.

## Architecture Diagram

```mermaid
graph TD
    subgraph Frontend (React + Vite + Tailwind)
        A[ReactFlow Canvas] -->|JSON Schema: Nodes/Edges| B[App State Manager]
        C[Config Panel] -->|Updates Node Data| A
        D[Chat panel] -->|Triggers Run / Input| B
    end

    subgraph Backend (FastAPI + LangGraph)
        B -->|POST /api/run| E[API Gateway]
        E -->|Compiles Graph| F[Graph Compiler]
        F -->|Instantiates| G[LangGraph StateGraph]
        G -->|Executes Workflow| H[Execution Runner]
        H -->|Simulated/Real LLMs| I[LLM Provider]
        H -->|Invokes Tools| J[Custom Tools]
        H -->|Emits Traces| E
    end

    subgraph Database (SQLite + SQLAlchemy)
        B -->|POST /api/workflows| K[Persistence Store]
    end
```

## Frontend Architecture

The frontend is built on **React + Vite** for high performance and lightweight development cycles.

1. **Vite + React Canvas (`Canvas.jsx`)**: Implements visual workspace graph management using `@xyflow/react` (ReactFlow). It registers custom node templates matching:
   - **User Input**: Captures the entry point query.
   - **AI Agent**: Sets up agent identity, prompt configuration, temperature, and LLM model bindings.
   - **Custom Tool**: Triggers structured executable code.
   - **Router Node**: Directs state loops and routing decisions.
   - **Final Output**: Emits the final result.
2. **Properties Sidebar (`ConfigPanel.jsx`)**: Configures selected node data dynamically.
3. **Execution Console (`ChatPanel.jsx`)**: Houses the chat input form and the terminal log trace window.

## Backend Architecture

The backend is built on **FastAPI** for high concurrency and native asynchronous support.

1. **SQLite Database Schema (`database.py`)**: Stores ReactFlow graph JSON representations:
   ```sql
   CREATE TABLE workflows (
       id VARCHAR PRIMARY KEY,
       name VARCHAR NOT NULL,
       description VARCHAR,
       nodes TEXT NOT NULL,
       edges TEXT NOT NULL,
       created_at DATETIME,
       updated_at DATETIME
   );
   ```
2. **Graph Compiler Engine (`graph_compiler.py`)**:
   - Parses the JSON node elements and builds an adjacency list mapping out execution flow transitions.
   - Instantiates a LangGraph `StateGraph(AgentState)` representing the visual topology.
   - Compiles the StateGraph into an executable LangChain app.
3. **Trace Engine**:
   - Sequential execution logs are captured at each graph node step and returned in the run response.
   - The frontend steps through these logs with a visual interval to highlight the executing node in real-time.
