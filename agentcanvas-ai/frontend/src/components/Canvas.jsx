import React, { useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Cpu, Wrench, GitFork, LogIn, LogOut, Trash2 } from 'lucide-react';

// === CUSTOM NODE COMPONENTS ===

const InputNode = ({ data, selected, id, activeRunningNodeId }) => {
  const isRunning = activeRunningNodeId === id;
  return (
    <div className={`w-48 bg-card border rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
      isRunning ? 'border-accent-cyan ring-4 ring-accent-cyan/20 scale-105' : selected ? 'border-accent-cyan shadow-accent-cyan/20 shadow-md' : 'border-border'
    }`}>
      <div className="flex items-center space-x-2 px-3 py-2 bg-accent-cyan/10 border-b border-border text-accent-cyan">
        <LogIn size={14} />
        <span className="text-xs font-bold uppercase tracking-wider">User Input</span>
      </div>
      <div className="p-3">
        <span className="text-sm font-semibold text-slate-200">{data.name || 'Input Query'}</span>
      </div>
      <Handle type="source" position={Position.Right} id="default" className="w-2.5 h-2.5 bg-accent-cyan" />
    </div>
  );
};

const OutputNode = ({ data, selected, id, activeRunningNodeId }) => {
  const isRunning = activeRunningNodeId === id;
  return (
    <div className={`w-48 bg-card border rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
      isRunning ? 'border-teal-400 ring-4 ring-teal-400/20 scale-105' : selected ? 'border-teal-400 shadow-teal-400/20 shadow-md' : 'border-border'
    }`}>
      <div className="flex items-center space-x-2 px-3 py-2 bg-teal-400/10 border-b border-border text-teal-400">
        <LogOut size={14} />
        <span className="text-xs font-bold uppercase tracking-wider">Final Output</span>
      </div>
      <div className="p-3">
        <span className="text-sm font-semibold text-slate-200">{data.name || 'Response'}</span>
      </div>
      <Handle type="target" position={Position.Left} id="default" className="w-2.5 h-2.5 bg-teal-400" />
    </div>
  );
};

const AgentNode = ({ data, selected, id, activeRunningNodeId }) => {
  const isRunning = activeRunningNodeId === id;
  return (
    <div className={`w-56 bg-card border rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
      isRunning ? 'border-accent-purple ring-4 ring-accent-purple/20 scale-105 animate-pulse-glow' : selected ? 'border-accent-purple shadow-accent-purple/20 shadow-md' : 'border-border'
    }`}>
      <Handle type="target" position={Position.Left} id="default" className="w-2.5 h-2.5 bg-accent-purple" />
      <div className="flex items-center justify-between px-3 py-2 bg-accent-purple/10 border-b border-border text-accent-purple">
        <div className="flex items-center space-x-1.5">
          <Cpu size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">AI Agent</span>
        </div>
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-accent-purple/20 border border-accent-purple/20">
          {data.model || 'Gemini'}
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-slate-200 mb-1">{data.name || 'Agent Alpha'}</h3>
        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
          {data.prompt || 'No system prompt defined.'}
        </p>
      </div>
      <Handle type="source" position={Position.Right} id="default" className="w-2.5 h-2.5 bg-accent-purple" />
    </div>
  );
};

const ToolNode = ({ data, selected, id, activeRunningNodeId }) => {
  const isRunning = activeRunningNodeId === id;
  return (
    <div className={`w-52 bg-card border rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
      isRunning ? 'border-accent-emerald ring-4 ring-accent-emerald/20 scale-105' : selected ? 'border-accent-emerald shadow-accent-emerald/20 shadow-md' : 'border-border'
    }`}>
      <Handle type="target" position={Position.Left} id="default" className="w-2.5 h-2.5 bg-accent-emerald" />
      <div className="flex items-center justify-between px-3 py-2 bg-accent-emerald/10 border-b border-border text-accent-emerald">
        <div className="flex items-center space-x-1.5">
          <Wrench size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Tool Node</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-slate-200 mb-1">{data.name || 'Calculator'}</h3>
        <span className="text-[10px] text-slate-400 bg-border px-2 py-0.5 rounded-full font-medium">
          {data.toolName || 'calculator'}
        </span>
      </div>
      <Handle type="source" position={Position.Right} id="default" className="w-2.5 h-2.5 bg-accent-emerald" />
    </div>
  );
};

const RouterNode = ({ data, selected, id, activeRunningNodeId }) => {
  const isRunning = activeRunningNodeId === id;
  return (
    <div className={`w-52 bg-card border rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
      isRunning ? 'border-accent-rose ring-4 ring-accent-rose/20 scale-105' : selected ? 'border-accent-rose shadow-accent-rose/20 shadow-md' : 'border-border'
    }`}>
      <Handle type="target" position={Position.Left} id="default" className="w-2.5 h-2.5 bg-accent-rose" />
      <div className="flex items-center space-x-1.5 px-3 py-2 bg-accent-rose/10 border-b border-border text-accent-rose">
        <GitFork size={14} />
        <span className="text-xs font-bold uppercase tracking-wider">Router</span>
      </div>
      <div className="p-3 relative">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">{data.name || 'Conditional Split'}</h3>
        
        {/* Visual Outputs for handles */}
        <div className="flex flex-col space-y-2 text-xs font-medium text-slate-400 mt-1">
          <div className="flex items-center justify-end pr-2 h-6">
            <span>True/Tool</span>
          </div>
          <div className="flex items-center justify-end pr-2 h-6">
            <span>False/Else</span>
          </div>
        </div>
      </div>
      
      {/* Route Handles */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="true" 
        style={{ top: '65%' }} 
        className="w-2.5 h-2.5 bg-accent-rose" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="false" 
        style={{ top: '82%' }} 
        className="w-2.5 h-2.5 bg-slate-500" 
      />
    </div>
  );
};

// === CANVAS COMPONENT ===

export default function Canvas({ 
  nodes, 
  edges, 
  setNodes, 
  setEdges, 
  selectedNodeId, 
  setSelectedNodeId,
  activeRunningNodeId
}) {
  
  // Custom Node Types mapping
  const nodeTypes = useMemo(() => ({
    input: (props) => <InputNode {...props} activeRunningNodeId={activeRunningNodeId} />,
    output: (props) => <OutputNode {...props} activeRunningNodeId={activeRunningNodeId} />,
    agent: (props) => <AgentNode {...props} activeRunningNodeId={activeRunningNodeId} />,
    tool: (props) => <ToolNode {...props} activeRunningNodeId={activeRunningNodeId} />,
    router: (props) => <RouterNode {...props} activeRunningNodeId={activeRunningNodeId} />,
  }), [activeRunningNodeId]);

  // Hook up event handlers from React Flow state update functions
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => {
      // Find the update changes
      return nds.map((node) => {
        const change = changes.find((c) => c.id === node.id);
        if (change) {
          if (change.type === 'position' && change.position) {
            return { ...node, position: change.position };
          }
          if (change.type === 'select') {
            return { ...node, selected: change.selected };
          }
        }
        return node;
      }).filter((node) => {
        // Handle removals
        const removeChange = changes.find((c) => c.id === node.id && c.type === 'remove');
        return !removeChange;
      });
    }),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => {
      return eds.filter((edge) => {
        const removeChange = changes.find((c) => c.id === edge.id && c.type === 'remove');
        return !removeChange;
      });
    }),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Project client position onto canvas grid
      const rect = event.target.getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left - 100,
        y: event.clientY - rect.top - 40,
      };

      // Set default details based on node type
      let defaultData = { name: `Custom ${type.toUpperCase()}` };
      if (type === 'agent') {
        defaultData = { 
          name: 'AI Agent Node', 
          model: 'gemini-1.5-flash', 
          prompt: 'You are a helpful assistant.',
          temperature: 0.7 
        };
      } else if (type === 'tool') {
        defaultData = { 
          name: 'Calculator Tool', 
          toolName: 'calculator'
        };
      } else if (type === 'router') {
        defaultData = { 
          name: 'Condition Check'
        };
      }

      const newNode = {
        id: `node-${type}-${Date.now()}`,
        type,
        position,
        data: defaultData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div className="w-full h-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap 
          bgColor="#0a0724" 
          nodeColor={(n) => {
            if (n.type === 'agent') return '#7c3aed';
            if (n.type === 'tool') return '#10b981';
            if (n.type === 'router') return '#f43f5e';
            if (n.type === 'input') return '#06b6d4';
            return '#2e303a';
          }}
          maskColor="rgba(3, 0, 20, 0.7)"
          style={{ background: '#0a0724', border: '1px solid #1f1a4a' }}
        />
        <Background color="#1f1a4a" gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}
