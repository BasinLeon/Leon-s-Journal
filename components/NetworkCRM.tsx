
import React, { useState, useRef } from 'react';
import { AppMode, NetworkContact } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { Chat } from '@google/genai';
import { Network, Share2, Loader2, Linkedin, Twitter, Copy, Database, PenTool, CheckCircle, Download } from 'lucide-react';

interface NetworkCRMProps {
  contacts: NetworkContact[];
  onAddContact: (contact: NetworkContact) => void;
}

const NetworkCRM: React.FC<NetworkCRMProps> = ({ contacts, onAddContact }) => {
  const [activeTab, setActiveTab] = useState<'factory' | 'database'>('factory');
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    topic: '',
    insight: ''
  });
  const [generatedContent, setGeneratedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setIsLogged(false); 
  };

  const handleGenerate = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setGeneratedContent('');
    setIsLogged(false);

    // Auto-log the contact when processing starts
    const newContact: NetworkContact = {
      id: Date.now().toString(),
      name: formData.name || 'Unknown',
      role: formData.role || 'Unknown',
      company: formData.company || 'Unknown',
      date: new Date().toISOString().split('T')[0],
      stage: 'Warm', // Default to Warm for active conversations
      lastTopic: formData.topic || 'General'
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

        TASK:
        1. 💼 **LinkedIn Draft**: Hook, Story (The "Alpha"), Lesson, Call to Action. Professional, high-status, "Ecosystem Owner" tone.
        2. 🐦 **X (Twitter) Draft**: Punchy, thread-style hook.
        3. 📊 **SIGNAL ANALYSIS**:
           - **Signal Score**: Rate strategic value (1-10) based on role/company.
           - **Recommended Next Step**: Suggest a specific, high-leverage action for Leon to take with the contact (e.g. sending a relevant whitepaper or making an introduction).
           - **Reasoning**: Briefly explain why this contact is strategically important for revenue architecture.
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

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(contacts, null, 2);
    navigator.clipboard.writeText(jsonString);
    alert("Network data copied to clipboard in JSON format!");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Tabs */}
      <div className="flex space-x-1 mb-4 border-b border-nexus-border">
        <button
          onClick={() => setActiveTab('factory')}
          className={`flex items-center px-4 py-2 text-sm font-mono font-bold transition-colors border-b-2 ${
            activeTab === 'factory' 
              ? 'border-nexus-accent text-nexus-text bg-nexus-panel/50' 
              : 'border-transparent text-nexus-muted hover:text-nexus-text'
          }`}
        >
          <PenTool className="w-4 h-4 mr-2" />
          CONTENT FACTORY
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center px-4 py-2 text-sm font-mono font-bold transition-colors border-b-2 ${
            activeTab === 'database' 
              ? 'border-nexus-accent text-nexus-text bg-nexus-panel/50' 
              : 'border-transparent text-nexus-muted hover:text-nexus-text'
          }`}
        >
          <Database className="w-4 h-4 mr-2" />
          NETWORK DATABASE ({contacts.length})
        </button>
      </div>

      {activeTab === 'factory' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
          {/* Input Panel */}
          <div className="bg-nexus-panel rounded-xl border border-nexus-border p-6 overflow-y-auto">
            <div className="flex items-center space-x-3 mb-6 border-b border-nexus-border pb-4">
                <div className="p-2 bg-nexus-dark rounded-lg border border-nexus-border">
                    <Network className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-nexus-text font-mono">SIGNAL INPUT</h2>
                    <p className="text-xs text-nexus-muted">Log Conversation → Generate Gravity</p>
                </div>
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
                        placeholder="What did you learn? What's the contrarian take? (e.g., 'Most outbound fails because of data quality, not copy.')"
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
          <div className="bg-nexus-dark rounded-xl border border-nexus-border p-6 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-bold text-nexus-muted font-mono">GENERATED ASSETS</h3>
                 <div className="flex space-x-2">
                    <Linkedin className="w-4 h-4 text-nexus-muted" />
                    <Twitter className="w-4 h-4 text-nexus-muted" />
                 </div>
            </div>
            
            <div className="flex-1 bg-nexus-panel rounded-lg border border-nexus-border p-4 overflow-y-auto font-mono text-sm leading-relaxed text-gray-300">
                {generatedContent ? (
                    <div className="whitespace-pre-wrap">
                        {generatedContent}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-nexus-muted opacity-50">
                        <Network className="w-12 h-12 mb-4" />
                        <p>Awaiting Signal Input...</p>
                    </div>
                )}
            </div>
            
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
      ) : (
        // Database Tab
        <div className="bg-nexus-panel rounded-xl border border-nexus-border p-6 h-full overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-nexus-text font-mono">RELATIONSHIP MATRIX</h2>
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
                  <th className="p-3">DATE</th>
                  <th className="p-3">STAGE</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-nexus-border/50 hover:bg-nexus-dark/50 transition-colors">
                    <td className="p-3 font-bold text-nexus-text">{contact.name}</td>
                    <td className="p-3 text-gray-400">{contact.role}</td>
                    <td className="p-3 text-nexus-accent">{contact.company}</td>
                    <td className="p-3 text-gray-400 truncate max-w-[200px]">{contact.lastTopic}</td>
                    <td className="p-3 text-nexus-muted">{contact.date}</td>
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
                ))}
              </tbody>
            </table>
            {contacts.length === 0 && (
              <div className="text-center py-10 text-nexus-muted text-sm font-mono">
                NO SIGNALS LOGGED YET. USE THE CONTENT FACTORY.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkCRM;
