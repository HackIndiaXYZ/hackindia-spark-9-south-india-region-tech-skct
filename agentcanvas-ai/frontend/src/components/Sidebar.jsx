import React from 'react';
import { Cpu, Wrench, GitFork, LogIn, LogOut, FileText, Trash2, HelpCircle } from 'lucide-react';

const NODE_TYPES = [
  { type: 'input', label: 'User Input', icon: LogIn, color: 'text-accent-cyan border-accent-cyan/20 bg-accent-cyan/5' },
  { type: 'agent', label: 'AI Agent', icon: Cpu, color: 'text-accent-purple border-accent-purple/20 bg-accent-purple/5' },
  { type: 'tool', label: 'Custom Tool', icon: Wrench, color: 'text-accent-emerald border-accent-emerald/20 bg-accent-emerald/5' },
  { type: 'router', label: 'Conditional Router', icon: GitFork, color: 'text-accent-rose border-accent-rose/20 bg-accent-rose/5' },
  { type: 'output', label: 'Final Output', icon: LogOut, color: 'text-teal-400 border-teal-400/20 bg-teal-400/5' },
];

export default function Sidebar({ isOpen, workflows, currentWorkflowId, onLoad, onDelete }) {
  if (!isOpen) return null;

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-72 h-full border-r border-border bg-card/30 backdrop-blur-md flex flex-col z-10">
      {/* Node Catalog */}
      <div className="p-5 border-b border-border">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center space-x-1.5">
          <Cpu size={14} />
          <span>Nodes Catalog</span>
        </h2>
        <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
          Drag and drop nodes onto the canvas to architect your AI agent pipeline. Connect nodes to pass execution states.
        </p>

        <div className="space-y-2">
          {NODE_TYPES.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.type}
                className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-grab active:cursor-grabbing hover:bg-border/40 transition-colors shadow-inner ${node.color}`}
                onDragStart={(event) => onDragStart(event, node.type)}
                draggable
              >
                <Icon size={16} />
                <span className="text-sm font-semibold text-slate-200">{node.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Saved Workflows */}
      <div className="flex-1 overflow-y-auto p-5">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center space-x-1.5">
          <FileText size={14} />
          <span>Saved Workflows</span>
        </h2>

        {workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-border rounded-xl">
            <HelpCircle size={24} className="text-slate-600 mb-2" />
            <span className="text-xs text-slate-500 text-center">No saved workflows found. Set up and save your first pipeline!</span>
          </div>
        ) : (
          <div className="space-y-2">
            {workflows.map((wf) => (
              <div 
                key={wf.id}
                className={`group flex items-center justify-between p-3 rounded-xl border border-border transition-all cursor-pointer hover:border-accent-purple/50 ${
                  currentWorkflowId === wf.id ? 'bg-accent-purple/10 border-accent-purple/50' : 'bg-background hover:bg-card'
                }`}
                onClick={() => onLoad(wf.id)}
              >
                <div className="flex flex-col min-w-0 mr-2">
                  <span className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                    {wf.name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {wf.description || 'No description'}
                  </span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(wf.id);
                  }}
                  className="p-1 rounded text-slate-500 hover:text-accent-rose hover:bg-accent-rose/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete workflow"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
