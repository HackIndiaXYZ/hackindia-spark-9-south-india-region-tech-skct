# AgentCanvas AI

A premium, interactive visual canvas interface to design, build, and deploy multi-agent workflows using **React + Tailwind CSS** in the frontend, and **FastAPI + LangGraph** in the backend.

```
                    ┌────────────────────────────┐
                    │      AgentCanvas AI        │
                    │   (Visual Node Editor)     │
                    └─────────────┬──────────────┘
                                  │
                       [JSON Graph Definition]
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │      FastAPI Backend       │
                    │   (State Graph Compiler)   │
                    └─────────────┬──────────────┘
                                  │
                       [LangGraph StateGraph]
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │     Executed Workflow      │
                    │ (LLM & Tools Simulation)  │
                    └────────────────────────────┘
```

## Features

- **Interactive Visual Canvas**: Add, configure, delete, and wire nodes (User Input, AI Agent, Tools, Router, Final Output) using a drag-and-drop workspace built on React Flow.
- **Dynamic Node Configuration**: Modify LLM parameters (models, temperature, system prompts), custom tools (Calculator, Web Search, System Clock), and routing rules on-the-fly.
- **LangGraph Compilation Engine**: Compiles your visual node topology into a real state machine using LangGraph.
- **Interactive Chat & Trace Logs**: Chat with your visual pipeline in real-time, with a side-by-side terminal log displaying LangGraph transition states.
- **Workflow Persistence**: Save, load, and delete workflows stored in a local SQLite database.
- **Zero-Config Simulation Fallback**: Runs full simulations of agents and tools if API keys are missing, allowing immediate testing of complex agent loops and routing.

---

## Getting Started

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```
3. Install dependencies (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   The backend will be running at `http://127.0.0.1:8000`.

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

## Directory Structure

```
agentcanvas-ai/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   └── tools.py         # Custom tools (Calculator, Web Search, Clock)
│   │   ├── __init__.py
│   │   ├── database.py         # SQLAlchemy SQLite initialization
│   │   ├── graph_compiler.py   # Compiles visual graph to LangGraph StateGraph
│   │   ├── main.py             # FastAPI App & Endpoints
│   │   └── models.py           # Pydantic schemas
│   └── requirements.txt        # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.jsx       # React Flow Visual Editor & custom nodes
│   │   │   ├── ChatPanel.jsx    # Chatbot & terminal log split view
│   │   │   ├── ConfigPanel.jsx  # Floating properties inspector
│   │   │   ├── Header.jsx       # Logo & control panel
│   │   │   └── Sidebar.jsx      # Drag-and-drop node catalog
│   │   ├── App.jsx             # State manager & API client
│   │   ├── index.css           # Custom styles & Tailwind imports
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js      # Styling design system
│   └── vite.config.js          # Vite config & API proxying
├── database/                   # SQLite database directory
├── docs/
│   └── architecture.md         # Design documentation
└── README.md
```

## AI Models & Tool Config

To run actual LLM requests instead of simulation runs, set the following environment variables:
```bash
# Set environment variables (or create a backend/.env file)
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
```
If these keys are not set, the compiler runs in simulation mode, which executes tool calls, parses routes, and returns visual logs to make demonstration seamless.
