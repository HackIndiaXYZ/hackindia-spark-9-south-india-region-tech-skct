import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import ConfigPanel from './components/ConfigPanel';
import ChatPanel from './components/ChatPanel';

const INITIAL_NODES = [
  {
    id: 'node-input',
    type: 'input',
    position: { x: 100, y: 250 },
    data: { name: 'User Input' }
  },
  {
    id: 'node-agent',
    type: 'agent',
    position: { x: 350, y: 250 },
    data: { 
      name: 'AI Agent', 
      model: 'gemini-1.5-flash', 
      prompt: 'You are a helpful and creative AI assistant. Answer the user queries with flair.',
      temperature: 0.7 
    }
  },
  {
    id: 'node-output',
    type: 'output',
    position: { x: 650, y: 250 },
    data: { name: 'Final Answer' }
  }
];

const INITIAL_EDGES = [
  { id: 'edge-1', source: 'node-input', target: 'node-agent', animated: true },
  { id: 'edge-2', source: 'node-agent', target: 'node-output', animated: true }
];

export default function App() {
  const [workflowId, setWorkflowId] = useState(null);
  const [workflowName, setWorkflowName] = useState('My First Agent Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('A simple agentic chain built using React Flow and LangGraph');
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [edges, setEdges] = useState(INITIAL_EDGES);
  
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [workflowsList, setWorkflowsList] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Hello! Design your graph and start chatting to execute the workflow. Try asking a question like 'write a 4 line poem about agents'." }
  ]);
  const [activeRunningNodeId, setActiveRunningNodeId] = useState(null);

  // Fetch all saved workflows on mount
  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch('/api/workflows');
      if (res.ok) {
        const data = await res.json();
        setWorkflowsList(data);
      }
    } catch (err) {
      console.error("Error fetching workflows:", err);
    }
  };

  // Create new blank workspace
  const handleNewWorkflow = () => {
    setWorkflowId(null);
    setWorkflowName('New Agent Canvas');
    setWorkflowDescription('Configure a custom multi-agent workflow');
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
    setSelectedNodeId(null);
    setLogs([]);
    setChatMessages([
      { role: 'assistant', content: "New workspace loaded. Wire up your nodes and start typing!" }
    ]);
  };

  // Save current workflow
  const handleSaveWorkflow = async () => {
    try {
      const url = workflowId ? `/api/workflows?workflow_id=${workflowId}` : '/api/workflows';
      const payload = {
        name: workflowName,
        description: workflowDescription,
        nodes: nodes,
        edges: edges
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        setWorkflowId(saved.id);
        fetchWorkflows();
        alert(`Workflow "${workflowName}" saved successfully!`);
      } else {
        const errData = await res.json();
        alert(`Error saving workflow: ${errData.detail || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Network error saving workflow: ${err.message}`);
    }
  };

  // Load a workflow from list
  const handleLoadWorkflow = async (id) => {
    try {
      const res = await fetch(`/api/workflows/${id}`);
      if (res.ok) {
        const data = await res.json();
        setWorkflowId(data.id);
        setWorkflowName(data.name);
        setWorkflowDescription(data.description || '');
        setNodes(data.nodes);
        setEdges(data.edges);
        setSelectedNodeId(null);
        setLogs([]);
        setChatMessages([
          { role: 'assistant', content: `Loaded workflow: ${data.name}. Ready to run!` }
        ]);
      }
    } catch (err) {
      alert(`Error loading workflow: ${err.message}`);
    }
  };

  // Delete a workflow
  const handleDeleteWorkflow = async (id) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return;
    try {
      const res = await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchWorkflows();
        if (workflowId === id) {
          handleNewWorkflow();
        }
      }
    } catch (err) {
      alert(`Error deleting workflow: ${err.message}`);
    }
  };

  // Execute Graph / Send Chat Message
  const handleExecuteGraph = async (userInput) => {
    if (isRunning) return;
    
    // Add user message to chatbot
    const newChatMessages = [...chatMessages, { role: 'user', content: userInput }];
    setChatMessages(newChatMessages);
    setIsRunning(true);
    setLogs(["[Compiler] Initializing graph compile...", "[Compiler] Bundling nodes and edges..."]);
    
    try {
      // API call to execute graph
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodes,
          edges: edges,
          user_input: userInput
        })
      });

      if (res.ok) {
        const result = await res.json();
        
        // Let's create a beautiful animation effect by stepping through the logs
        // and highlighting the nodes sequentially.
        const returnedLogs = result.logs || [];
        
        // Simulating trace walkthrough
        let currentLogIndex = 0;
        const interval = setInterval(() => {
          if (currentLogIndex < returnedLogs.length) {
            const nextLog = returnedLogs[currentLogIndex];
            setLogs(prev => [...prev, nextLog]);
            
            // Check if log indicates node execution to highlight it in the canvas
            if (nextLog.includes("Executing Node:")) {
              const match = nextLog.match(/Executing Node: (.*) \((.*)\)/);
              if (match) {
                // Find node by name or type
                const matchedNodeName = match[1];
                const found = nodes.find(n => (n.data?.name === matchedNodeName || n.id === matchedNodeName));
                if (found) {
                  setActiveRunningNodeId(found.id);
                }
              }
            }
            
            currentLogIndex++;
          } else {
            clearInterval(interval);
            // Append final output and complete run
            setChatMessages(prev => [...prev, { role: 'assistant', content: result.final_output }]);
            setLogs(prev => [...prev, "[Engine] Graph execution completed successfully."]);
            setIsRunning(false);
            setActiveRunningNodeId(null);
          }
        }, 500); // 500ms delay per execution trace line for a real cool visual effect!

      } else {
        const errData = await res.json();
        setLogs(prev => [...prev, `[Error] Run failed: ${errData.detail || 'Internal server error'}`]);
        setChatMessages(prev => [...prev, { role: 'assistant', content: `Error executing workflow: ${errData.detail || 'Server error'}` }]);
        setIsRunning(false);
      }
    } catch (err) {
      setLogs(prev => [...prev, `[Network Error] Failed to reach backend: ${err.message}`]);
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Failed to execute: ${err.message}` }]);
      setIsRunning(false);
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const handleUpdateNodeData = (nodeId, updatedData) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        return { ...n, data: { ...n.data, ...updatedData } };
      }
      return n;
    }));
  };

  return (
    <div className="flex flex-col w-full h-full bg-background overflow-hidden">
      <Header 
        workflowName={workflowName}
        setWorkflowName={setWorkflowName}
        workflowDescription={workflowDescription}
        setWorkflowDescription={setWorkflowDescription}
        onSave={handleSaveWorkflow}
        onNew={handleNewWorkflow}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      <div className="flex flex-1 w-full relative overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen}
          workflows={workflowsList}
          currentWorkflowId={workflowId}
          onLoad={handleLoadWorkflow}
          onDelete={handleDeleteWorkflow}
        />
        
        <div className="flex-1 h-full relative">
          <Canvas 
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            activeRunningNodeId={activeRunningNodeId}
          />
          
          {selectedNode && (
            <ConfigPanel 
              node={selectedNode}
              onUpdateData={handleUpdateNodeData}
              onClose={() => setSelectedNodeId(null)}
            />
          )}

          <ChatPanel 
            messages={chatMessages}
            logs={logs}
            isRunning={isRunning}
            onSendMessage={handleExecuteGraph}
          />
        </div>
      </div>
    </div>
  );
}
