
import React, { useState, useRef } from 'react';
import { AppMode, Deal } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { Chat } from '@google/genai';
import { Crosshair, Search, Loader2, FileText, UserPlus, AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface HuntProps {
  onAddDeal: (deal: Deal) => void;
}

const Hunt: React.FC<HuntProps> = ({ onAddDeal }) => {
  const [jdText, setJdText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);

  const handleAnalyze = async () => {
    if (!jdText.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysis('');

    try {
      if (!chatSessionRef.current) {
        chatSessionRef.current = createChatSession(AppMode.HUNT);
      }

      const prompt = `
        JOB DESCRIPTION:
        ${jdText}

        Analyze this against Leon Basin's resume context.
        
        Provide the following sections:
        1. **Gap Analysis**: Strengths & Risks.
        2. **Boolean Search Strings**: To find Hiring Managers/Peers.
        3. **Sniper Message**: A short value prop message.
        4. **Resume Optimization (Builder's Path)**: 
           - Identify specific requirements in the JD that Leon's resume doesn't fully capture.
           - Draft 3 specific bullet points he should add/adapt.
           - rigid formatting: Use "Action Verb + System Built + Quantified Result".
           - Example: "Architected automated outbound engine in Python, driving 160% pipeline growth."
      `;

      await sendMessageStream(chatSessionRef.current, prompt, (chunk) => {
        setAnalysis(prev => prev + chunk);
      });
    } catch (e) {
      setAnalysis("Error: Sniper Scope malfunction. Check API connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddTarget = () => {
    // Basic heuristics to create a draft deal from the JD
    const lines = jdText.split('\n').filter(line => line.trim().length > 0);
    const titleGuess = lines[0]?.substring(0, 50) || "Unknown Role";
    
    const newDeal: Deal = {
        id: Date.now().toString(),
        company: "Target (See JD)",
        role: titleGuess,
        stage: 'Target',
        value: 'TBD',
        contacts: [],
        next_step: 'Research & Outreach',
        date: new Date().toISOString().split('T')[0]
    };
    onAddDeal(newDeal);
    alert("Target added to Pipeline! View in Pipeline tab.");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Input Panel */}
        <div className="bg-nexus-panel rounded-xl border border-nexus-border p-6 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-nexus-dark rounded-lg border border-nexus-border">
              <Crosshair className="w-6 h-6 text-nexus-danger" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-nexus-text font-mono">SNIPER SCOPE</h2>
              <p className="text-xs text-nexus-muted">JD Analysis & Boolean Generator</p>
            </div>
          </div>
          
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste Job Description here..."
            className="flex-1 bg-nexus-dark border border-nexus-border rounded-lg p-4 text-sm font-mono text-nexus-text focus:outline-none focus:border-nexus-danger resize-none mb-4"
          />
          
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !jdText.trim()}
            className="w-full py-3 bg-nexus-danger hover:bg-red-600 text-white font-bold rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ACQUIRING TARGET...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                ANALYZE TARGET
              </>
            )}
          </button>
        </div>

        {/* Output Panel */}
        <div className="bg-nexus-panel rounded-xl border border-nexus-border p-6 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-nexus-border">
            <h3 className="font-bold text-nexus-text font-mono flex items-center">
              <FileText className="w-4 h-4 mr-2 text-nexus-accent" />
              TACTICAL ANALYSIS
            </h3>
            <div className="flex items-center space-x-3">
                {analysis && !isAnalyzing && (
                    <button 
                        onClick={handleAddTarget}
                        className="flex items-center px-3 py-1.5 bg-nexus-success/10 text-nexus-success border border-nexus-success/30 rounded text-xs hover:bg-nexus-success/20 transition-colors font-bold"
                    >
                        <UserPlus className="w-3 h-3 mr-2" />
                        ADD TO PIPELINE
                    </button>
                )}
                {analysis && !isAnalyzing && (
                   <span className="text-xs text-nexus-success flex items-center">
                     <CheckCircle className="w-3 h-3 mr-1" /> COMPLETE
                   </span>
                )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-nexus-dark rounded-lg p-4 border border-nexus-border">
             {analysis ? (
               <div className="prose prose-invert prose-sm max-w-none font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                 {analysis}
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-nexus-muted opacity-50 text-center p-8">
                 <Target className="w-12 h-12 mb-4" />
                 <p className="font-mono text-sm">NO TARGET DATA</p>
                 <p className="text-xs mt-2">Paste a JD to generate gap analysis and boolean search strings.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hunt;
