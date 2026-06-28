import React, { useState, useEffect } from 'react';
import { LayoutGrid, Save, Plus, ChevronLeft, ChevronRight, Activity, Terminal } from 'lucide-react';

export default function Header({ 
  workflowName, 
  setWorkflowName, 
  workflowDescription, 
  setWorkflowDescription, 
  onSave, 
  onNew,
  isSidebarOpen,
  setIsSidebarOpen
}) {
  const [dbStatus, setDbStatus] = useState('connecting');
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setDbStatus('connected');
        } else {
          setDbStatus('error');
        }
      } catch (e) {
        setDbStatus('disconnected');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50 backdrop-blur-md z-10">
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-lg border border-border bg-background hover:bg-border transition-colors text-slate-400 hover:text-slate-200"
          title={isSidebarOpen ? "Hide Workflows" : "Show Workflows"}
        >
          {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-accent-purple to-accent-cyan shadow-[0_0_15px_rgba(124,58,237,0.5)]">
            <Terminal className="text-white" size={18} />
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-white via-slate-200 to-accent-cyan bg-clip-text text-transparent tracking-wide">
            AgentCanvas
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-accent-purple/30 bg-accent-purple/10 text-accent-purple">
            AI
          </span>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border"></div>

        {/* Workflow Info (Editable) */}
        <div className="flex flex-col">
          {isEditingName ? (
            <input 
              type="text" 
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
              autoFocus
              className="bg-background border border-accent-purple text-slate-200 font-semibold px-2 py-0.5 rounded text-sm focus:outline-none w-64"
            />
          ) : (
            <h1 
              onClick={() => setIsEditingName(true)}
              className="text-sm font-semibold text-slate-200 hover:text-white cursor-pointer transition-colors flex items-center space-x-1"
              title="Click to edit name"
            >
              <span>{workflowName || "Untitled Workflow"}</span>
            </h1>
          )}
          <input 
            type="text"
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            placeholder="Add description..."
            className="bg-transparent text-xs text-slate-400 focus:text-slate-300 focus:outline-none w-80 truncate"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Database Status Badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-border bg-background text-xs">
          <Activity 
            size={12} 
            className={`
              ${dbStatus === 'connected' ? 'text-accent-emerald animate-pulse' : ''}
              ${dbStatus === 'connecting' ? 'text-amber-500 animate-spin' : ''}
              ${dbStatus === 'disconnected' || dbStatus === 'error' ? 'text-accent-rose' : ''}
            `}
          />
          <span className="text-slate-400 capitalize">
            {dbStatus === 'connected' ? 'Engine Ready' : 'Engine Offline'}
          </span>
        </div>

        {/* New Workflow */}
        <button 
          onClick={onNew}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg border border-border bg-background hover:bg-border text-sm text-slate-300 font-medium transition-colors"
        >
          <Plus size={16} />
          <span>New</span>
        </button>

        {/* Save Workflow */}
        <button 
          onClick={onSave}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-accent-purple to-violet-800 hover:opacity-90 text-sm text-white font-semibold shadow-lg shadow-accent-purple/20 transition-all active:scale-95"
        >
          <Save size={16} />
          <span>Save Workflow</span>
        </button>
      </div>
    </header>
  );
}
