import React from 'react';
import { X, Trash2, Sliders, Cpu, Wrench, Settings } from 'lucide-react';

export default function ConfigPanel({ node, onUpdateData, onClose }) {
  const { id, type, data } = node;

  const handleChange = (field, value) => {
    onUpdateData(id, { [field]: value });
  };

  return (
    <div className="absolute top-6 right-6 w-80 bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-2xl z-20 flex flex-col max-h-[85%] overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center space-x-2 text-slate-200">
          <Settings size={16} className="text-accent-purple" />
          <span className="font-bold text-sm uppercase tracking-wider">Configure Node</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-border/50 transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Node ID & Type badge */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">ID: {id}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
            type === 'agent' ? 'text-accent-purple bg-accent-purple/5 border-accent-purple/20' :
            type === 'tool' ? 'text-accent-emerald bg-accent-emerald/5 border-accent-emerald/20' :
            type === 'router' ? 'text-accent-rose bg-accent-rose/5 border-accent-rose/20' :
            'text-accent-cyan bg-accent-cyan/5 border-accent-cyan/20'
          }`}>
            {type}
          </span>
        </div>

        {/* Node Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Node Title</label>
          <input 
            type="text"
            value={data.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-accent-purple transition-all"
          />
        </div>

        {/* Dynamic configurations based on node type */}
        {type === 'agent' && (
          <>
            {/* Model Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">AI Model</label>
              <select
                value={data.model || 'gemini-1.5-flash'}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-accent-purple transition-all cursor-pointer"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gpt-4o">OpenAI GPT-4o</option>
                <option value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-slate-400">Temperature</label>
                <span className="text-xs font-semibold text-accent-purple">{data.temperature ?? 0.7}</span>
              </div>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={data.temperature ?? 0.7}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                className="w-full accent-accent-purple cursor-ew-resize bg-background"
              />
            </div>

            {/* System Prompt Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">System Instructions / Role</label>
              <textarea 
                value={data.prompt || ''}
                onChange={(e) => handleChange('prompt', e.target.value)}
                rows={4}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-accent-purple transition-all resize-y min-h-[80px]"
                placeholder="Instructions for this agent..."
              />
            </div>
          </>
        )}

        {type === 'tool' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Active Tool Binding</label>
            <select
              value={data.toolName || 'calculator'}
              onChange={(e) => handleChange('toolName', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-accent-emerald transition-all cursor-pointer"
            >
              <option value="calculator">Python Math Calculator</option>
              <option value="web_search">Web Search Query (Simulated/Live)</option>
              <option value="current_time">System Clock / Timezone</option>
            </select>
          </div>
        )}

        {type === 'router' && (
          <div className="p-3 border border-accent-rose/20 rounded-lg bg-accent-rose/5 text-[11px] text-slate-400 leading-relaxed">
            <h4 className="font-semibold text-accent-rose mb-1.5 flex items-center space-x-1">
              <Sliders size={12} />
              <span>Routing Rules Engine</span>
            </h4>
            This router inspects state variables. Outputs are divided into two logical ports:
            <ul className="list-disc pl-4 mt-1.5 space-y-1">
              <li><strong className="text-slate-200">True/Tool:</strong> Activated if query details calculator math, search requests or system clock events.</li>
              <li><strong className="text-slate-200">False/Else:</strong> Standard fallback route mapping to the next agentic chain node.</li>
            </ul>
          </div>
        )}

        {type === 'input' && (
          <div className="text-[11px] text-slate-400 bg-background/50 p-3 rounded-lg border border-border leading-relaxed">
            The Input Node initializes graph state. It captures the query typed in the chatbot window and passes it downstream as the initial message.
          </div>
        )}

        {type === 'output' && (
          <div className="text-[11px] text-slate-400 bg-background/50 p-3 rounded-lg border border-border leading-relaxed">
            The Output Node marks the termination of execution. The final state message is captured here and returned back as the assistant response.
          </div>
        )}
      </div>
    </div>
  );
}
