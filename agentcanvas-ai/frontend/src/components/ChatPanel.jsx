import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, MessageSquare, ChevronDown, ChevronUp, RefreshCw, AlertCircle } from 'lucide-react';

export default function ChatPanel({ messages, logs, isRunning, onSendMessage }) {
  const [isOpen, setIsOpen] = useState(true);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);
  const consoleEndRef = useRef(null);

  // Auto-scroll chat and logs
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isRunning) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border flex flex-col z-20 transition-all duration-300 ${
      isOpen ? 'h-80' : 'h-11'
    }`}>
      {/* Header bar / Toggle */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-6 py-2.5 border-b border-border/60 cursor-pointer hover:bg-border/20 transition-colors select-none"
      >
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1.5 text-slate-300 text-sm font-semibold">
            <MessageSquare size={16} className="text-accent-purple" />
            <span>Interactive Chatbot</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-300 text-sm font-semibold">
            <Terminal size={16} className="text-accent-cyan" />
            <span>LangGraph Trace Logs</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isRunning && (
            <div className="flex items-center space-x-1.5 text-xs text-accent-cyan">
              <RefreshCw size={12} className="animate-spin" />
              <span className="font-semibold">Graph Executing...</span>
            </div>
          )}
          <button className="text-slate-400 hover:text-slate-200">
            {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="flex flex-1 w-full overflow-hidden">
          {/* Left panel: Chat Interface */}
          <div className="w-1/2 h-full flex flex-col border-r border-border">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-accent-purple text-white rounded-br-none' 
                      : msg.role === 'system'
                        ? 'bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald rounded-bl-none font-mono text-xs'
                        : 'bg-background border border-border text-slate-200 rounded-bl-none'
                  }`}>
                    {msg.role === 'system' && <span className="font-bold block text-[10px] uppercase tracking-wider mb-0.5">Tool Payload</span>}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-3 bg-background border-t border-border flex items-center space-x-2">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isRunning ? "Running..." : "Type query to execute graph..."}
                disabled={isRunning}
                className="flex-1 bg-card border border-border rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-accent-purple disabled:opacity-50 transition-colors"
              />
              <button 
                type="submit"
                disabled={isRunning || !inputText.trim()}
                className="p-2.5 rounded-xl bg-accent-purple hover:bg-violet-700 text-white disabled:opacity-40 transition-colors shadow-lg active:scale-95"
              >
                <Send size={15} />
              </button>
            </form>
          </div>

          {/* Right panel: LangGraph Terminal Logs */}
          <div className="w-1/2 h-full bg-slate-950/80 font-mono text-xs text-slate-300 p-4 overflow-y-auto flex flex-col">
            <div className="flex-1 space-y-1">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-1">
                  <AlertCircle size={20} />
                  <span>No executions performed yet.</span>
                  <span className="text-[10px]">Your LangGraph execution trace will print here.</span>
                </div>
              ) : (
                logs.map((log, idx) => {
                  let logColor = 'text-slate-400';
                  if (log.startsWith("===")) {
                    logColor = 'text-accent-purple font-semibold mt-2';
                  } else if (log.includes("[Error]")) {
                    logColor = 'text-accent-rose font-semibold';
                  } else if (log.includes("Tool Result:")) {
                    logColor = 'text-accent-emerald font-semibold';
                  } else if (log.includes("[Compiler]")) {
                    logColor = 'text-accent-cyan';
                  } else if (log.includes("Final output")) {
                    logColor = 'text-teal-400 font-bold';
                  }
                  
                  return (
                    <div key={idx} className={`${logColor} leading-relaxed break-words`}>
                      {log}
                    </div>
                  );
                })
              )}
              <div ref={consoleEndRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
