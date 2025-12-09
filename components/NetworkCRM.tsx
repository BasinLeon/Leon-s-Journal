
import React, { useState, useRef } from 'react';
import { AppMode, NetworkContact } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { Chat } from '@google/genai';
import { Network, Share2, Loader2, Linkedin, Twitter, Copy, Database, PenTool, CheckCircle, Download, Target, RefreshCw, Trello, AlertCircle, Clock, X, Hourglass, Zap, Plus, Users, ArrowRightLeft, Sparkles } from 'lucide-react';

interface NetworkCRMProps {
  contacts: NetworkContact[];
  onAddContact: (contact: NetworkContact) => void;
}

const NEXT_STEP_OPTIONS: Record<string, Array<{action: string, type: string}>> = {
  "Cold": [
    { action: "Send {name} a relevant article about {topic} to warm up the relationship", type: "value_add" },
    { action: "Comment on {name}'s recent LinkedIn post before sending a DM", type: "engagement" },
    { action: "Find a mutual connection who can provide a warm intro to {name}", type: "intro" },
  ],
  "Warm": [
    { action: "Share a specific case study showing {topic} impact at a similar company", type: "value_add" },
    { action: "Ask {name} for their perspective on {topic} to deepen the conversation", type: "engagement" },
    { action: "Offer to send a 2-minute Loom video with a personalized insight for {company}", type: "value_add" },
  ],
  "Hot": [
    { action: "Propose a 15-minute call to discuss how {topic} applies to {company}", type: "meeting" },
    { action: "Send a tailored one-pager on implementing {topic} at {company}", type: "whitepaper" },
    { action: "Introduce {name} to someone in your network who solved this problem", type: "intro" },
  ],
  "Champion": [
    { action: "Ask {name} for a referral to another leader dealing with {topic}", type: "referral" },
    { action: "Co-create content with {name} about your {topic} conversation", type: "collab" },
    { action: "Invite {name} to an exclusive event or community discussion", type: "community" },
  ]
};

const STEP_COLORS: Record<string, string> = {
  value_add: "#4ade80", // green
  engagement: "#fbbf24", // amber
  intro: "#60a5fa", // blue
  meeting: "#f87171", // red
  whitepaper: "#a78bfa", // purple
  referral: "#D4AF37", // gold
  collab: "#ec4899", // pink
  community: "#14b8a6" // teal
};

interface RecommendedAction {
  text: string;
  type: string;
}

const NetworkCRM: React.FC<NetworkCRMProps> = ({ contacts, onAddContact }) => {
  const [activeTab, setActiveTab] = useState<'factory' | 'database' | 'kanban' | 'matchmaker'>('factory');
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    topic: '',
    insight: '',
    stage: 'Warm' as 'Cold' | 'Warm' | 'Hot' | 'Champion'
  });
  const [smartIngestText, setSmartIngestText] = useState('');
  const [showSmartIngest, setShowSmartIngest] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  const [matchmakerData, setMatchmakerData] = useState<{from: string, to: string}>({from: '', to: ''});
  const [introEmail, setIntroEmail] = useState('');
  const [isMatchmaking, setIsMatchmaking] = useState(false);

  const [generatedContent, setGeneratedContent] = useState('');
  const [recommendedAction, setRecommendedAction] = useState<RecommendedAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [selectedContact, setSelectedContact] = useState<NetworkContact | null>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setIsLogged(false); 
  };

  const generateNextStep = () => {
    const options = NEXT_STEP_OPTIONS[formData.stage] || NEXT_STEP_OPTIONS["Warm"];
    const choice = options[Math.floor(Math.random() * options.length)];
    
    let actionText = choice.action
      .replace("{name}", formData.name || "them")
      .replace("{topic}", formData.topic || "this topic")
      .replace("{company}", formData.company || "their company");

    setRecommendedAction({
      text: actionText,
      type: choice.type
    });
  };

  const getDaysSinceLastTouch = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const getResurfaceStatus = (dateString: string) => {
      const daysSince = getDaysSinceLastTouch(dateString);
      const threshold = 14;
      if (daysSince > threshold) return { status: 'overdue', days: daysSince - threshold };
      return { status: 'safe', days: threshold - daysSince };
  };

  const isDecaying = (dateString: string) => {
      return getDaysSinceLastTouch(dateString) > 14; 
  };

  const handleGenerate = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setGeneratedContent('');
    setRecommendedAction(null);
    setIsLogged(false);

    generateNextStep();

    const newContact: NetworkContact = {
      id: Date.now().toString(),
      name: formData.name || 'Unknown',
      role: formData.role || 'Unknown',
      company: formData.company || 'Unknown',
      date: new Date().toISOString().split('T')[0],
      stage: formData.stage,
      lastTopic: formData.topic || 'General',
      priority: 2
    };
    onAddContact(newContact);
    setIsLogged(true);

    try {
      if (!chatSessionRef.current) {
        chatSessionRef.current = createChatSession(AppMode.NETWORK);
      }

      const prompt = `
        LOG INTERACTION:
        Name: ${formData.name}
        Role: ${formData.role}
        Company: ${formData.company}
        Topic: ${formData.topic}
        Key Insight/Alpha: ${formData.insight}

        CONTEXT:
        Speaker is Leon Basin (Director GTM, Fudo Security 160% Growth, "Basin::Nexus" Builder).
        
        TASK:
        1. 💼 **LinkedIn Draft**: 
           - Hook: Contrarian or Insight-led.
           - Body: The "Builder's Path" perspective. No corporate fluff.
           - Call to Action: Clear question or invitation to engage.
        2. 🐦 **X (Twitter) Draft**: Punchy, thread-style.
        3. 📊 **SIGNAL ANALYSIS**:
           - **Signal Score**: Rate strategic value (1-10) based on Role, Company, and Insight.
           - **Recommended Next Step**: Suggest high-leverage action (Type: ${recommendedAction?.type || 'General'}).
             Valid Types: value_add, engagement, intro, meeting, whitepaper, referral, collab, community.
           - **Reasoning**: Why this matters for the 2026 Goal.
      `;

      await sendMessageStream(chatSessionRef.current, prompt, (chunk) => {
        setGeneratedContent(prev => prev + chunk);
      });

    } catch (e) {
      setGeneratedContent("Error: Could not connect to Basin::Nexus Signal Engine.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSmartIngest = async () => {
    if (!smartIngestText.trim()) return;
    setIsIngesting(true);
    
    try {
        if (!chatSessionRef.current) {
            chatSessionRef.current = createChatSession(AppMode.NETWORK);
        }

        const prompt = `
            ACT AS: Data Extraction Engine.
            INPUT: "${smartIngestText}"
            
            GOAL: Extract specific fields. Detect "Intent Signals" (hiring, fundraising, news).
            
            OUTPUT JSON ONLY:
            {
                "name": "Full Name",
                "role": "Job Title",
                "company": "Company Name",
                "lastTopic": "Summary of context or signal",
                "stage": "Cold" | "Warm" | "Hot",
                "tags": ["Hiring", "Investor", etc]
            }
        `;

        const result = await chatSessionRef.current.sendMessage(prompt);
        const text = result.response.text();
        
        // Basic JSON cleaning (Gemini sometimes adds markdown blocks)
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const extracted = JSON.parse(jsonStr);

        const newContact: NetworkContact = {
            id: Date.now().toString(),
            name: extracted.name || 'Unknown',
            role: extracted.role || 'Unknown',
            company: extracted.company || 'Unknown',
            date: new Date().toISOString().split('T')[0],
            stage: extracted.stage || 'Cold',
            lastTopic: extracted.lastTopic || 'Smart Ingest',
            tags: extracted.tags || [],
            lastSignal: smartIngestText,
            priority: extracted.tags?.includes('Hiring') ? 1 : 2
        };

        onAddContact(newContact);
        setFormData({
            ...formData,
            name: newContact.name,
            role: newContact.role,
            company: newContact.company,
            topic: newContact.lastTopic,
            stage: newContact.stage
        });
        
        setShowSmartIngest(false);
        setSmartIngestText('');
        alert(`Successfully ingested: ${newContact.name}`);

    } catch (e) {
        console.error(e);
        alert("Failed to parse signal. Try pasting cleaner text.");
    } finally {
        setIsIngesting(false);
    }
  };

  const handleMatchmake = async () => {
      if(!matchmakerData.from || !matchmakerData.to) return;
      setIsMatchmaking(true);
      setIntroEmail('');

      try {
        if (!chatSessionRef.current) {
            chatSessionRef.current = createChatSession(AppMode.NETWORK);
        }
        
        const c1 = contacts.find(c => c.id === matchmakerData.from);
        const c2 = contacts.find(c => c.id === matchmakerData.to);

        const prompt = `
            ACT AS: Super-Connector.
            TASK: Write a "Double Opt-In" introduction email connecting these two people.
            
            PERSON A (Connector/Me): Leon Basin.
            PERSON B (To): ${c1?.name} (${c1?.role} @ ${c1?.company}). Context: ${c1?.lastTopic}.
            PERSON C (To be intro'd): ${c2?.name} (${c2?.role} @ ${c2?.company}). Context: ${c2?.lastTopic}.
            
            STYLE: High-status, brief, value-forward. No fluff.
            Output specific subject line and body.
        `;

        await sendMessageStream(chatSessionRef.current, prompt, (chunk) => {
            setIntroEmail(prev => prev + chunk);
        });

      } catch (e) {
          setIntroEmail("Error generating intro.");
      } finally {
          setIsMatchmaking(false);
      }
  };

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(contacts, null, 2);
    navigator.clipboard.writeText(jsonString);
    alert("Network data copied to clipboard in JSON format!");
  };

  const renderDetailPanel = () => {
    if (!selectedContact) return null;

    const daysSince = getDaysSinceLastTouch(selectedContact.date);
    const healthScore = Math.max(0, 100 - (daysSince * 5)); 
    
    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-nexus-dark/95 backdrop-blur-xl border-l border-nexus-border shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto">
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-nexus-text font-mono">{selectedContact.name}</h2>
                        <div className="text-sm text-nexus-muted mt-1">{selectedContact.role} @ <span className="text-nexus-accent">{selectedContact.company}</span></div>
                    </div>
                    <button 
                        onClick={() => setSelectedContact(null)}
                        className="p-1 hover:bg-nexus-panel rounded text-nexus-muted hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Tags */}
                    {selectedContact.tags && selectedContact.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedContact.tags.map(tag => (
                                <span key={tag} className="text-[10px] font-mono px-2 py-1 rounded bg-nexus-accent/10 text-nexus-accent border border-nexus-accent/30 flex items-center">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Health Status */}
                    <div className="p-4 bg-nexus-panel rounded-lg border border-nexus-border">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-nexus-muted font-mono uppercase">RELATIONSHIP HEALTH</span>
                            <span className={`text-xs font-bold ${healthScore > 70 ? 'text-nexus-success' : healthScore > 40 ? 'text-nexus-warning' : 'text-nexus-danger'}`}>
                                {healthScore}%
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-nexus-base rounded-full overflow-hidden">
                             <div 
                                className={`h-full transition-all duration-500 ${healthScore > 70 ? 'bg-nexus-success' : healthScore > 40 ? 'bg-nexus-warning' : 'bg-nexus-danger'}`}
                                style={{ width: `${healthScore}%` }}
                             />
                        </div>
                        <div className="mt-3 flex items-center text-xs text-nexus-muted">
                            <Clock className="w-3 h-3 mr-2" />
                            Last touch: {daysSince} days ago
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-nexus-panel rounded-lg border border-nexus-border">
                            <div className="text-[10px] text-nexus-muted font-mono mb-1">STAGE</div>
                            <div className={`text-sm font-bold ${
                                selectedContact.stage === 'Hot' ? 'text-nexus-success' :
                                selectedContact.stage === 'Warm' ? 'text-nexus-warning' :
                                'text-nexus-muted'
                            }`}>{selectedContact.stage}</div>
                        </div>
                        <div className="p-3 bg-nexus-panel rounded-lg border border-nexus-border">
                            <div className="text-[10px] text-nexus-muted font-mono mb-1">PRIORITY</div>
                            <div className="text-sm font-bold text-white flex items-center">
                                {selectedContact.priority === 1 ? '🔴 P1 - HIGH' : selectedContact.priority === 2 ? '🟡 P2 - MED' : '⚪ P3 - LOW'}
                            </div>
                        </div>
                    </div>

                    {/* Signal / Reasoning */}
                    {selectedContact.signalScore && (
                        <div className="p-4 bg-nexus-panel rounded-lg border border-nexus-border">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-nexus-muted font-mono uppercase">SIGNAL STRENGTH</span>
                                <span className="text-xs font-mono font-bold text-nexus-gold">{selectedContact.signalScore}/10</span>
                            </div>
                            <p className="text-xs text-gray-400 italic">"{selectedContact.reasoning}"</p>
                        </div>
                    )}

                    {/* Last Topic */}
                    <div className="p-4 bg-nexus-panel rounded-lg border border-nexus-border">
                        <div className="text-xs text-nexus-muted font-mono uppercase mb-2">LAST CONTEXT</div>
                        <p className="text-sm text-gray-300 italic">"{selectedContact.lastTopic}"</p>
                        {selectedContact.lastSignal && (
                            <div className="mt-2 pt-2 border-t border-nexus-border/50">
                                <span className="text-[10px] text-nexus-muted uppercase">RAW SIGNAL</span>
                                <p className="text-xs text-nexus-muted mt-1 truncate">{selectedContact.lastSignal}</p>
                            </div>
                        )}
                    </div>

                    {/* History Placeholder */}
                    <div>
                        <div className="text-xs text-nexus-muted font-mono uppercase mb-3 flex items-center">
                             <Database className="w-3 h-3 mr-2" />
                             INTERACTION LOG
                        </div>
                        <div className="space-y-3">
                            {selectedContact.history ? (
                                selectedContact.history.map(log => (
                                    <div key={log.id} className="p-3 bg-nexus-panel rounded border border-nexus-border text-xs">
                                        <div className="flex justify-between text-nexus-muted mb-1">
                                            <span>{log.date}</span>
                                            <span className="uppercase">{log.type}</span>
                                        </div>
                                        <div className="text-white">{log.summary}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-4 border border-dashed border-nexus-border rounded text-nexus-muted text-xs">
                                    No detailed logs available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative">
      {renderDetailPanel()}
      
      {/* Smart Ingest Modal */}
      {showSmartIngest && (
          <div className="absolute inset-0 z-40 bg-nexus-base/90 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-nexus-panel border border-nexus-border rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-white font-mono flex items-center">
                          <Zap className="w-5 h-5 text-nexus-accent mr-2" />
                          SMART SIGNAL INGEST
                      </h3>
                      <button onClick={() => setShowSmartIngest(false)} className="text-nexus-muted hover:text-white"><X className="w-5 h-5"/></button>
                  </div>
                  <p className="text-xs text-nexus-muted mb-4">
                      Paste raw text (LinkedIn profile, Tweet, Email, CSV row) to auto-extract and tag.
                  </p>
                  <textarea 
                    className="w-full h-32 bg-nexus-dark border border-nexus-border rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-nexus-accent resize-none"
                    placeholder="e.g. 'Met John Smith (VP Sales @ Tebra) at SaaStr. They just raised Series C and are hiring aggressively.'"
                    value={smartIngestText}
                    onChange={(e) => setSmartIngestText(e.target.value)}
                  />
                  <div className="flex justify-end mt-4">
                      <button 
                        onClick={handleSmartIngest}
                        disabled={isIngesting || !smartIngestText}
                        className="flex items-center px-4 py-2 bg-nexus-accent text-white rounded-lg font-bold text-xs hover:bg-blue-600 disabled:opacity-50"
                      >
                          {isIngesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Sparkles className="w-4 h-4 mr-2"/>}
                          PROCESS SIGNAL
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-4 border-b border-nexus-border overflow-x-auto">
        <button
          onClick={() => setActiveTab('factory')}
          className={`flex items-center px-4 py-2 text-sm font-mono font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'factory' 
              ? 'border-nexus-accent text-nexus-text bg-nexus-panel/50' 
              : 'border-transparent text-nexus-muted hover:text-nexus-text'
          }`}
        >
          <PenTool className="w-4 h-4 mr-2" />
          FACTORY
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center px-4 py-2 text-sm font-mono font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'database' 
              ? 'border-nexus-accent text-nexus-text bg-nexus-panel/50' 
              : 'border-transparent text-nexus-muted hover:text-nexus-text'
          }`}
        >
          <Database className="w-4 h-4 mr-2" />
          DATABASE ({contacts.length})
        </button>
         <button
          onClick={() => setActiveTab('kanban')}
          className={`flex items-center px-4 py-2 text-sm font-mono font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'kanban' 
              ? 'border-nexus-accent text-nexus-text bg-nexus-panel/50' 
              : 'border-transparent text-nexus-muted hover:text-nexus-text'
          }`}
        >
          <Trello className="w-4 h-4 mr-2" />
          KANBAN
        </button>
        <button
          onClick={() => setActiveTab('matchmaker')}
          className={`flex items-center px-4 py-2 text-sm font-mono font-bold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'matchmaker' 
              ? 'border-nexus-accent text-nexus-text bg-nexus-panel/50' 
              : 'border-transparent text-nexus-muted hover:text-nexus-text'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          CONNECTOR
        </button>
      </div>

      {activeTab === 'factory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
          {/* Input Panel */}
          <div className="bg-nexus-panel rounded-xl border border-nexus-border p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b border-nexus-border pb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-nexus-dark rounded-lg border border-nexus-border">
                        <Network className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-nexus-text font-mono">SIGNAL INPUT</h2>
                        <p className="text-xs text-nexus-muted">Log Conversation → Generate Gravity</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowSmartIngest(true)}
                    className="flex items-center px-3 py-1.5 bg-nexus-dark border border-nexus-accent/50 text-nexus-accent rounded text-xs font-bold hover:bg-nexus-accent/10 transition-colors"
                >
                    <Zap className="w-3 h-3 mr-1" />
                    SMART PASTE
                </button>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-nexus-muted font-mono mb-1">NAME</label>
                        <input 
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full bg-nexus-dark border border-nexus-border rounded p-2 text-sm text-nexus-text focus:border-nexus-accent focus:outline-none"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-nexus-muted font-mono mb-1">COMPANY</label>
                        <input 
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="w-full bg-nexus-dark border border-nexus-border rounded p-2 text-sm text-nexus-text focus:border-nexus-accent focus:outline-none"
                            placeholder="Tebra"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-nexus-muted font-mono mb-1">ROLE</label>
                        <input 
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="w-full bg-nexus-dark border border-nexus-border rounded p-2 text-sm text-nexus-text focus:border-nexus-accent focus:outline-none"
                            placeholder="VP of Sales"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-nexus-muted font-mono mb-1">RELATIONSHIP STAGE</label>
                        <select
                            name="stage"
                            value={formData.stage}
                            onChange={handleInputChange}
                            className="w-full bg-nexus-dark border border-nexus-border rounded p-2 text-sm text-nexus-text focus:border-nexus-accent focus:outline-none"
                        >
                            <option value="Cold">❄️ Cold</option>
                            <option value="Warm">🌡️ Warm</option>
                            <option value="Hot">🔥 Hot</option>
                            <option value="Champion">⭐ Champion</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-nexus-muted font-mono mb-1">TOPIC / CONTEXT</label>
                    <input 
                        name="topic"
                        value={formData.topic}
                        onChange={handleInputChange}
                        className="w-full bg-nexus-dark border border-nexus-border rounded p-2 text-sm text-nexus-text focus:border-nexus-accent focus:outline-none"
                        placeholder="e.g. AI SDRs, Outbound Strategy"
                    />
                </div>
                 <div>
                    <label className="block text-xs text-nexus-muted font-mono mb-1">THE ALPHA / KEY INSIGHT</label>
                    <textarea 
                        name="insight"
                        value={formData.insight}
                        onChange={handleInputChange}
                        rows={6}
                        className="w-full bg-nexus-dark border border-nexus-border rounded p-2 text-sm text-nexus-text focus:border-nexus-accent focus:outline-none resize-none"
                        placeholder="What did you learn? What's the contrarian take?"
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isProcessing || !formData.insight}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            PROCESSING SIGNAL...
                        </>
                    ) : (
                        <>
                            <Share2 className="w-4 h-4 mr-2" />
                            PROCESS SIGNAL & AUTO-LOG
                        </>
                    )}
                </button>
                {isLogged && (
                  <div className="flex items-center justify-center text-xs text-nexus-success font-mono mt-2 animate-pulse">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    CONTACT LOGGED TO DATABASE
                  </div>
                )}
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-nexus-dark rounded-xl border border-nexus-border p-6 flex flex-col h-full overflow-hidden relative">
            <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-bold text-nexus-muted font-mono">GENERATED ASSETS</h3>
                 <div className="flex space-x-2">
                    <Linkedin className="w-4 h-4 text-nexus-muted" />
                    <Twitter className="w-4 h-4 text-nexus-muted" />
                 </div>
            </div>
            
            <div className="flex-1 bg-nexus-panel rounded-lg border border-nexus-border p-4 overflow-y-auto font-mono text-sm leading-relaxed text-gray-300 relative">
                {generatedContent ? (
                    <div className="whitespace-pre-wrap pb-32">
                        {generatedContent}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-nexus-muted opacity-50">
                        <Network className="w-12 h-12 mb-4" />
                        <p>Awaiting Signal Input...</p>
                    </div>
                )}
            </div>

            {recommendedAction && (
                <div className="absolute bottom-16 left-6 right-6 p-4 bg-nexus-dark border border-nexus-gold/30 rounded-lg shadow-2xl border-l-4" style={{ borderLeftColor: STEP_COLORS[recommendedAction.type] || '#D4AF37' }}>
                    <div className="flex justify-between items-start">
                        <h4 className="text-nexus-text font-bold text-xs font-mono uppercase mb-2 flex items-center">
                            <Target className="w-4 h-4 mr-2 text-nexus-accent" />
                            Recommended Next Step
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70 uppercase">{recommendedAction.type}</span>
                    </div>
                    <p className="text-white/90 text-sm font-medium">{recommendedAction.text}</p>
                    <div className="mt-3 flex gap-2">
                        <button className="px-3 py-1 bg-nexus-accent/20 text-nexus-accent rounded text-xs hover:bg-nexus-accent/30 transition-colors">
                        ✅ MARK COMPLETE
                        </button>
                        <button 
                            onClick={generateNextStep}
                            className="px-3 py-1 bg-white/10 text-white/70 rounded text-xs hover:bg-white/20 transition-colors flex items-center"
                        >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        GET ANOTHER
                        </button>
                    </div>
                </div>
            )}
            
            {generatedContent && (
                 <div className="mt-4 flex justify-end space-x-4">
                    <button 
                        onClick={() => {
                            const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(generatedContent)}`;
                            window.open(url, '_blank');
                        }}
                        className="text-xs flex items-center text-nexus-text hover:text-nexus-accent transition-colors"
                    >
                        <Linkedin className="w-3 h-3 mr-1" />
                        SHARE TO LINKEDIN
                    </button>
                    <button 
                        onClick={() => navigator.clipboard.writeText(generatedContent)}
                        className="text-xs flex items-center text-nexus-accent hover:text-white transition-colors"
                    >
                        <Copy className="w-3 h-3 mr-1" />
                        COPY ALL
                    </button>
                 </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="bg-nexus-panel rounded-xl border border-nexus-border p-6 h-full overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
                <h2 className="text-lg font-bold text-nexus-text font-mono">RELATIONSHIP MATRIX</h2>
                <button 
                    onClick={() => setShowSmartIngest(true)}
                    className="flex items-center px-3 py-1.5 bg-nexus-dark border border-nexus-accent/50 text-nexus-accent rounded text-xs font-bold hover:bg-nexus-accent/10 transition-colors"
                >
                    <Plus className="w-3 h-3 mr-1" />
                    ADD
                </button>
            </div>
            <button 
              onClick={handleExportJSON}
              className="flex items-center px-4 py-2 bg-nexus-dark border border-nexus-border rounded text-xs font-mono text-nexus-text hover:bg-nexus-border transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              EXPORT JSON
            </button>
          </div>
          
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-nexus-border text-xs text-nexus-muted font-mono">
                  <th className="p-3">NAME</th>
                  <th className="p-3">ROLE</th>
                  <th className="p-3">COMPANY</th>
                  <th className="p-3">LAST TOPIC</th>
                  <th className="p-3">RESURFACE</th>
                  <th className="p-3">STAGE</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {contacts.map((contact) => {
                  const resurface = getResurfaceStatus(contact.date);
                  return (
                    <tr 
                        key={contact.id} 
                        onClick={() => setSelectedContact(contact)}
                        className="border-b border-nexus-border/50 hover:bg-nexus-dark/50 transition-colors group cursor-pointer"
                    >
                        <td className="p-3 font-bold text-nexus-text">
                            {contact.name}
                            {resurface.status === 'overdue' && (
                            <span title="Relationship Decaying (>14 days)" className="inline-block ml-2 cursor-help">
                                <AlertCircle className="w-3 h-3 text-nexus-danger" />
                            </span>
                            )}
                            {contact.priority === 1 && <span className="ml-2 text-[8px] bg-red-500/20 text-red-400 px-1 rounded">HOT</span>}
                        </td>
                        <td className="p-3 text-gray-400">{contact.role}</td>
                        <td className="p-3 text-nexus-accent">{contact.company}</td>
                        <td className="p-3 text-gray-400 truncate max-w-[200px]">
                            {contact.lastTopic}
                            {contact.tags && contact.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                    {contact.tags.slice(0,2).map(t => <span key={t} className="text-[8px] bg-nexus-panel border px-1 rounded">{t}</span>)}
                                </div>
                            )}
                        </td>
                        <td className="p-3">
                            {resurface.status === 'overdue' ? (
                                <span className="flex items-center text-nexus-danger font-bold text-xs bg-nexus-danger/10 px-2 py-1 rounded w-fit">
                                    <Hourglass className="w-3 h-3 mr-1" />
                                    OVERDUE {resurface.days} DAYS
                                </span>
                            ) : (
                                <span className="text-nexus-muted text-xs">
                                    In {resurface.days} days
                                </span>
                            )}
                        </td>
                        <td className="p-3">
                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                            contact.stage === 'Hot' ? 'bg-nexus-success/20 text-nexus-success' :
                            contact.stage === 'Warm' ? 'bg-nexus-warning/20 text-nexus-warning' :
                            'bg-nexus-border text-nexus-muted'
                        }`}>
                            {contact.stage}
                        </span>
                        </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'matchmaker' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full p-6 bg-nexus-panel rounded-xl border border-nexus-border overflow-hidden">
              <div className="lg:col-span-1 space-y-4">
                  <h2 className="text-lg font-bold text-nexus-text font-mono flex items-center mb-6">
                      <ArrowRightLeft className="w-5 h-5 mr-2 text-nexus-accent" />
                      MATCHMAKER
                  </h2>
                  
                  <div className="p-4 bg-nexus-dark rounded-lg border border-nexus-border">
                      <label className="text-xs text-nexus-muted font-mono block mb-2">CONNECTOR (YOU)</label>
                      <div className="text-sm font-bold text-white">Leon Basin</div>
                  </div>

                  <div className="relative">
                      <div className="absolute left-1/2 -ml-0.5 w-0.5 h-8 bg-nexus-border -top-6"></div>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="text-xs text-nexus-muted font-mono block mb-1">SELECT PERSON A (TO)</label>
                          <select 
                            className="w-full bg-nexus-dark border border-nexus-border rounded p-2 text-sm text-nexus-text"
                            value={matchmakerData.from}
                            onChange={(e) => setMatchmakerData({...matchmakerData, from: e.target.value})}
                          >
                              <option value="">Select Contact...</option>
                              {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                          </select>
                      </div>
                      
                      <div className="flex justify-center text-nexus-muted">
                          <ArrowRightLeft className="w-4 h-4 rotate-90" />
                      </div>

                      <div>
                          <label className="text-xs text-nexus-muted font-mono block mb-1">SELECT PERSON B (INTRO)</label>
                          <select 
                            className="w-full bg-nexus-dark border border-nexus-border rounded p-2 text-sm text-nexus-text"
                            value={matchmakerData.to}
                            onChange={(e) => setMatchmakerData({...matchmakerData, to: e.target.value})}
                          >
                              <option value="">Select Contact...</option>
                              {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                          </select>
                      </div>
                  </div>

                  <button 
                    onClick={handleMatchmake}
                    disabled={!matchmakerData.from || !matchmakerData.to || isMatchmaking}
                    className="w-full mt-4 py-3 bg-nexus-accent hover:bg-blue-600 text-white font-bold rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
                  >
                      {isMatchmaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      GENERATE DOUBLE OPT-IN
                  </button>
              </div>

              <div className="lg:col-span-2 bg-nexus-dark rounded-lg border border-nexus-border p-6 relative">
                  <div className="absolute top-4 right-4">
                      <button 
                        onClick={() => navigator.clipboard.writeText(introEmail)}
                        className="p-2 hover:bg-nexus-panel rounded text-nexus-muted hover:text-white"
                        title="Copy to Clipboard"
                      >
                          <Copy className="w-4 h-4" />
                      </button>
                  </div>
                  <h3 className="text-xs text-nexus-muted font-mono uppercase mb-4">DRAFT EMAIL</h3>
                  {introEmail ? (
                      <div className="prose prose-invert prose-sm font-mono whitespace-pre-wrap text-gray-300">
                          {introEmail}
                      </div>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-nexus-muted opacity-50">
                          <Users className="w-12 h-12 mb-4" />
                          <p>Select contacts to generate intro.</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'kanban' && (
        <div className="bg-nexus-panel rounded-xl border border-nexus-border p-6 h-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-nexus-text font-mono">PIPELINE BOARD</h2>
            </div>
            <div className="flex-1 grid grid-cols-4 gap-4 overflow-x-auto min-w-[800px]">
                {['Cold', 'Warm', 'Hot', 'Champion'].map((stage) => (
                    <div key={stage} className="bg-nexus-dark rounded-lg border border-nexus-border flex flex-col h-full">
                        <div className={`p-3 border-b border-nexus-border flex justify-between items-center ${
                             stage === 'Cold' ? 'bg-gray-800/30' :
                             stage === 'Warm' ? 'bg-amber-900/20' :
                             stage === 'Hot' ? 'bg-red-900/20' : 'bg-green-900/20'
                        }`}>
                            <span className="font-bold text-sm text-nexus-text uppercase">{stage}</span>
                            <span className="text-xs text-nexus-muted bg-nexus-panel px-2 py-0.5 rounded">
                                {contacts.filter(c => c.stage === stage).length}
                            </span>
                        </div>
                        <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                            {contacts.filter(c => c.stage === stage).map(contact => (
                                <div 
                                    key={contact.id} 
                                    onClick={() => setSelectedContact(contact)}
                                    className="bg-nexus-panel p-3 rounded border border-nexus-border hover:border-nexus-accent cursor-pointer group relative hover:-translate-y-1 transition-transform"
                                >
                                    <div className="flex justify-between">
                                        <div className="font-bold text-sm text-nexus-text">{contact.name}</div>
                                        {isDecaying(contact.date) && <AlertCircle className="w-3 h-3 text-nexus-danger" />}
                                    </div>
                                    <div className="text-xs text-nexus-muted mt-1">{contact.role} @ <span className="text-nexus-accent">{contact.company}</span></div>
                                    {contact.lastTopic && (
                                        <div className="mt-2 pt-2 border-t border-nexus-border/50 text-[10px] text-gray-500 truncate">
                                            "{contact.lastTopic}"
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default NetworkCRM;
