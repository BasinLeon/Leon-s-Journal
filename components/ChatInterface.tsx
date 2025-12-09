import React, { useState, useRef, useEffect } from 'react';
import { AppMode, ChatMessage } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { Chat } from '@google/genai';
import { Send, Terminal, Cpu, PenTool, Activity, ShieldAlert } from 'lucide-react';

interface ChatInterfaceProps {
  mode: AppMode;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ mode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize chat session on mode change
  useEffect(() => {
    try {
      chatSessionRef.current = createChatSession(mode);
      setMessages([{
        id: 'init',
        role: 'model',
        text: getWelcomeMessage(mode),
        timestamp: new Date()
      }]);
      setError(null);
    } catch (e) {
      setError("API Key missing or invalid. Please check process.env.API_KEY");
    }
  }, [mode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getWelcomeMessage = (m: AppMode) => {
    switch (m) {
      case AppMode.DOJO: return "⚔️ SIMULATION STARTED. I have your resume. That 160% growth figure looks inflated. Walk me through the attribution model. Now.";
      case AppMode.ARCHITECT: return "🏗️ ARCHITECT MODE ONLINE. What system are we building today? Need a workflow optimized or a tool connected?";
      case AppMode.SCRIBE: return "📣 SCRIBE READY. Paste your raw notes. I'll turn them into gravity.";
      case AppMode.MIRROR: return "🔭 REFLECTION POOL. What's on your mind, Leon? Let's verify your frame.";
      default: return "System Ready.";
    }
  };

  const getIcon = () => {
    switch(mode) {
        case AppMode.DOJO: return <ShieldAlert className="w-5 h-5 text-nexus-danger" />;
        case AppMode.ARCHITECT: return <Cpu className="w-5 h-5 text-nexus-accent" />;
        case AppMode.SCRIBE: return <PenTool className="w-5 h-5 text-nexus-warning" />;
        case AppMode.MIRROR: return <Activity className="w-5 h-5 text-purple-500" />;
        default: return <Terminal className="w-5 h-5" />;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !chatSessionRef.current || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const modelMsgId = (Date.now() + 1).toString();
    
    // Optimistic model message
    setMessages(prev => [...prev, {
      id: modelMsgId,
      role: 'model',
      text: '', // Start empty for streaming
      timestamp: new Date(),
      isStreaming: true
    }]);

    let fullResponse = "";

    await sendMessageStream(chatSessionRef.current, userMsg.text, (chunk) => {
      fullResponse += chunk;
      setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId ? { ...msg, text: fullResponse } : msg
      ));
    });

    setMessages(prev => prev.map(msg => 
        msg.id === modelMsgId ? { ...msg, isStreaming: false } : msg
    ));
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-nexus-danger font-mono p-4 border border-nexus-danger bg-red-900/10 rounded-lg">
        <ShieldAlert className="w-8 h-8 mr-3" />
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-nexus-panel rounded-xl border border-nexus-border overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-nexus-dark px-4 py-3 border-b border-nexus-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
            {getIcon()}
            <h2 className="font-mono text-lg font-bold text-nexus-text uppercase tracking-wider">
                {mode.replace('_', ' ')}
            </h2>
        </div>
        <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-nexus-success animate-pulse"></span>
            <span className="text-xs text-nexus-muted font-mono">ONLINE</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-3 rounded-lg border ${
                msg.role === 'user' 
                  ? 'bg-nexus-accent/10 border-nexus-accent text-nexus-text' 
                  : 'bg-nexus-dark border-nexus-border text-gray-300'
              }`}
            >
               {/* Very basic markdown rendering for bullet points */}
               <div className="whitespace-pre-wrap leading-relaxed">
                 {msg.text.split('\n').map((line, i) => (
                   <div key={i}>{line}</div>
                 ))}
               </div>
               {msg.isStreaming && <span className="inline-block w-2 h-4 bg-nexus-accent ml-1 animate-blink"></span>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-nexus-dark border-t border-nexus-border">
        <div className="relative flex items-center">
            <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Command the ${mode.toLowerCase()}...`}
                className="w-full bg-nexus-panel text-nexus-text border border-nexus-border rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:border-nexus-accent font-mono text-sm resize-none h-14"
            />
            <button 
                onClick={handleSend}
                disabled={isTyping || !inputValue.trim()}
                className="absolute right-2 p-2 bg-nexus-accent text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;