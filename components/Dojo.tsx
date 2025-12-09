
import React, { useState, useRef, useEffect } from 'react';
import { AppMode, ChatMessage, DOJO_LAYERS, DojoLayer } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { Chat } from '@google/genai';
import { Sword, ShieldAlert, Target, Award, Lock, Mic, Send, PlayCircle, BarChart2, Volume2, StopCircle } from 'lucide-react';

const Dojo: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<DojoLayer>(DOJO_LAYERS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [metrics, setMetrics] = useState({ star: 0, conviction: 0, specificity: 0 });
  const [isListening, setIsListening] = useState(false);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize session for the specific layer
    try {
      chatSessionRef.current = createChatSession(AppMode.DOJO);
      // More specific prompt injecting Leon's background
      const prompt = `⚔️ LAYER ${activeLayer.id}: ${activeLayer.name.toUpperCase()} 
      
      CONTEXT: You are interviewing Leon Basin (Director GTM).
      RESUME: Fudo (160% growth), Sense ($11M pipe).
      
      TASK: Ask a probing question related to the ${activeLayer.name} stage.
      Start with: "I've reviewed your resume. I see the 160% growth at Fudo..."`;

      setMessages([{
        id: 'init',
        role: 'model',
        text: `⚔️ LAYER ${activeLayer.id} INITIALIZED. \n\nI see the 160% growth at Fudo on your resume. That's a big number. \n\nWalk me through the exact attribution model you used to verify that.`,
        timestamp: new Date()
      }]);
    } catch (e) {
      console.error("API Error");
    }
  }, [activeLayer]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
             setIsListening(false);
        };
    }
  }, []);

  const toggleListening = () => {
      if (isListening) {
          recognitionRef.current?.stop();
          setIsListening(false);
      } else {
          recognitionRef.current?.start();
          setIsListening(true);
      }
  };

  const speakText = (text: string) => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel(); // Stop previous
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.pitch = 0.9; // Lower pitch for "serious" tone
          utterance.rate = 1.1; // Slightly faster
          window.speechSynthesis.speak(utterance);
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

    // Heuristic metrics calculation based on text content
    const wordCount = userMsg.text.split(' ').length;
    const hasStar = /(situation|task|action|result|context|outcome)/i.test(userMsg.text);
    const hasNumbers = /\d+%|\$\d+|\d+x/.test(userMsg.text); // Checks for %, $, or multipliers
    const hesitation = (userMsg.text.match(/(um|uh|maybe|think|guess)/gi) || []).length;

    const newMetrics = {
        star: hasStar ? 85 : 40 + (wordCount > 50 ? 20 : 0),
        conviction: Math.max(10, 90 - (hesitation * 15)),
        specificity: hasNumbers ? 95 : 50,
    };
    setMetrics(newMetrics);

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: modelMsgId,
      role: 'model',
      text: '',
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

    // Auto-speak the response
    speakText(fullResponse);

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

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left Sidebar: 11 Layers */}
      <div className="w-64 bg-nexus-panel rounded-xl border border-nexus-border flex flex-col overflow-hidden hidden md:flex">
        <div className="p-4 border-b border-nexus-border bg-nexus-dark">
            <h2 className="text-sm font-bold text-nexus-text font-mono flex items-center">
                <Sword className="w-4 h-4 mr-2 text-nexus-danger" />
                THE GAUNTLET
            </h2>
            <p className="text-[10px] text-nexus-muted mt-1">11 Layers to Offer</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {DOJO_LAYERS.map(layer => (
                <button
                    key={layer.id}
                    onClick={() => layer.status !== 'Locked' && setActiveLayer(layer)}
                    disabled={layer.status === 'Locked'}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group ${
                        activeLayer.id === layer.id
                            ? 'bg-nexus-danger/10 border-nexus-danger text-nexus-text'
                            : layer.status === 'Locked'
                            ? 'bg-nexus-dark/50 border-transparent text-nexus-muted opacity-50 cursor-not-allowed'
                            : 'bg-nexus-dark border-transparent text-nexus-muted hover:text-nexus-text hover:bg-nexus-panel'
                    }`}
                >
                    <div>
                        <div className="text-xs font-bold font-mono">LAYER {layer.id}</div>
                        <div className="text-sm">{layer.name}</div>
                    </div>
                    {layer.status === 'Locked' ? (
                        <Lock className="w-4 h-4 text-nexus-muted" />
                    ) : (
                        <div className={`w-2 h-2 rounded-full ${activeLayer.id === layer.id ? 'bg-nexus-danger animate-pulse' : 'bg-nexus-success'}`} />
                    )}
                </button>
            ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-nexus-panel rounded-xl border border-nexus-border flex flex-col overflow-hidden">
         {/* Header */}
         <div className="p-4 border-b border-nexus-border bg-nexus-dark flex justify-between items-center">
             <div className="flex items-center">
                 <div className="w-8 h-8 rounded bg-nexus-danger/20 flex items-center justify-center mr-3 border border-nexus-danger/50">
                     <span className="font-mono font-bold text-nexus-danger">{activeLayer.id}</span>
                 </div>
                 <div>
                     <h3 className="font-bold text-nexus-text">{activeLayer.name.toUpperCase()}</h3>
                     <p className="text-xs text-nexus-muted font-mono">{activeLayer.description} // {activeLayer.difficulty}</p>
                 </div>
             </div>
             <div className="flex items-center space-x-4">
                 <div className="text-right hidden sm:block">
                     <div className="text-[10px] text-nexus-muted font-mono">SIMULATION STATUS</div>
                     <div className="text-xs text-nexus-danger font-bold animate-pulse">LIVE ADVERSARY</div>
                 </div>
             </div>
         </div>

         {/* Chat Stream */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm bg-nexus-dark/50">
            {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-lg border shadow-lg ${
                    msg.role === 'user' 
                    ? 'bg-nexus-accent/10 border-nexus-accent text-nexus-text' 
                    : 'bg-nexus-panel border-nexus-border text-gray-300'
                }`}>
                    <div className="flex items-center mb-2 pb-2 border-b border-white/5 justify-between">
                        <div className="flex items-center">
                            {msg.role === 'model' ? (
                                <ShieldAlert className="w-3 h-3 mr-2 text-nexus-danger" />
                            ) : (
                                <Mic className="w-3 h-3 mr-2 text-nexus-accent" />
                            )}
                            <span className="text-[10px] font-bold opacity-70">
                                {msg.role === 'model' ? activeLayer.name.toUpperCase() : 'LEON BASIN'}
                            </span>
                        </div>
                         {msg.role === 'model' && (
                            <button onClick={() => speakText(msg.text)} className="p-1 hover:text-nexus-accent transition-colors">
                                <Volume2 className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                    {msg.isStreaming && <span className="inline-block w-2 h-4 bg-nexus-danger ml-1 animate-blink"></span>}
                </div>
            </div>
            ))}
            <div ref={messagesEndRef} />
         </div>

         {/* Input */}
         <div className="p-4 bg-nexus-panel border-t border-nexus-border">
            <div className="relative flex items-center gap-2">
                <button 
                    onClick={toggleListening}
                    className={`p-3 rounded-lg border transition-all ${
                        isListening 
                        ? 'bg-nexus-danger/20 border-nexus-danger text-nexus-danger animate-pulse' 
                        : 'bg-nexus-dark border-nexus-border text-nexus-muted hover:text-nexus-text'
                    }`}
                    title="Toggle Voice Input"
                >
                    {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Provide your proof of work..."
                    className="flex-1 bg-nexus-dark text-nexus-text border border-nexus-border rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:border-nexus-danger font-mono text-sm resize-none h-14"
                />
                <button 
                    onClick={handleSend}
                    disabled={isTyping || !inputValue.trim()}
                    className="absolute right-2 p-2 bg-nexus-danger text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
         </div>
      </div>

      {/* Right Panel: Coaching Metrics */}
      <div className="w-64 bg-nexus-panel rounded-xl border border-nexus-border flex flex-col hidden xl:flex">
         <div className="p-4 border-b border-nexus-border bg-nexus-dark">
            <h2 className="text-sm font-bold text-nexus-text font-mono flex items-center">
                <BarChart2 className="w-4 h-4 mr-2 text-nexus-warning" />
                LIVE COACHING
            </h2>
            <p className="text-[10px] text-nexus-muted mt-1">Real-time signal analysis</p>
         </div>
         <div className="p-4 space-y-6">
             {/* STAR Score */}
             <div>
                 <div className="flex justify-between items-end mb-2">
                     <label className="text-xs font-bold text-nexus-text">STAR METHOD</label>
                     <span className="text-xs font-mono text-nexus-warning">{metrics.star}/100</span>
                 </div>
                 <div className="w-full bg-nexus-dark h-2 rounded-full overflow-hidden">
                     <div 
                        className="bg-nexus-warning h-full transition-all duration-500" 
                        style={{ width: `${metrics.star}%` }}
                     />
                 </div>
                 <p className="text-[10px] text-nexus-muted mt-1">Situation, Task, Action, Result structure.</p>
             </div>

             {/* Conviction */}
             <div>
                 <div className="flex justify-between items-end mb-2">
                     <label className="text-xs font-bold text-nexus-text">CONVICTION</label>
                     <span className="text-xs font-mono text-nexus-accent">{metrics.conviction}/100</span>
                 </div>
                 <div className="w-full bg-nexus-dark h-2 rounded-full overflow-hidden">
                     <div 
                        className="bg-nexus-accent h-full transition-all duration-500" 
                        style={{ width: `${metrics.conviction}%` }}
                     />
                 </div>
                 <p className="text-[10px] text-nexus-muted mt-1">Absence of filler words & hesitation.</p>
             </div>

              {/* Specificity */}
              <div>
                 <div className="flex justify-between items-end mb-2">
                     <label className="text-xs font-bold text-nexus-text">SPECIFICITY</label>
                     <span className="text-xs font-mono text-nexus-success">{metrics.specificity}/100</span>
                 </div>
                 <div className="w-full bg-nexus-dark h-2 rounded-full overflow-hidden">
                     <div 
                        className="bg-nexus-success h-full transition-all duration-500" 
                        style={{ width: `${metrics.specificity}%` }}
                     />
                 </div>
                 <p className="text-[10px] text-nexus-muted mt-1">Usage of metrics, dates, and names.</p>
             </div>

             <div className="mt-8 p-3 bg-nexus-dark/50 rounded border border-nexus-border">
                 <div className="flex items-start">
                     <Award className="w-4 h-4 text-nexus-gold mr-2 mt-0.5" />
                     <div>
                         <h4 className="text-xs font-bold text-nexus-gold">COACH'S NOTE</h4>
                         <p className="text-[10px] text-nexus-muted mt-1 leading-relaxed">
                             "You are pivoting too fast to the solution. Spend more time on the 'Problem' to build tension."
                         </p>
                     </div>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default Dojo;
