
import React, { useState, useRef } from 'react';
import { AppMode, Deal } from '../types';
import { Briefcase, DollarSign, Calendar, Plus, ExternalLink, TrendingUp, ChevronRight, Download, Zap, Loader2, X } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { Chat } from '@google/genai';

interface PipelineProps {
  deals: Deal[];
  onUpdateDeals: (deals: Deal[]) => void;
}

const Pipeline: React.FC<PipelineProps> = ({ deals, onUpdateDeals }) => {
  const [showSmartAdd, setShowSmartAdd] = useState(false);
  const [smartAddText, setSmartAddText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);

  const stages = ['Target', 'Applied', 'Interviewing', 'Offer'];

  // Calculate Weighted Value
  const calculateWeightedValue = () => {
      let total = 0;
      deals.forEach(deal => {
          const rawValue = parseInt(deal.value.replace(/[^0-9]/g, '')) || 0;
          let weight = 0;
          if (deal.stage === 'Target') weight = 0.1;
          if (deal.stage === 'Applied') weight = 0.2;
          if (deal.stage === 'Interviewing') weight = 0.5;
          if (deal.stage === 'Offer') weight = 0.9;
          total += rawValue * weight;
      });
      return total.toLocaleString();
  };

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'Target': return 'bg-gray-800/50 border-gray-700';
      case 'Applied': return 'bg-blue-900/20 border-blue-800';
      case 'Interviewing': return 'bg-nexus-warning/20 border-nexus-warning';
      case 'Offer': return 'bg-nexus-success/20 border-nexus-success';
      default: return 'bg-nexus-panel border-nexus-border';
    }
  };

  const moveDeal = (dealId: string, currentStage: string) => {
      const stageIdx = stages.indexOf(currentStage);
      if (stageIdx < stages.length - 1) {
          const newStage = stages[stageIdx + 1];
          const updatedDeals = deals.map(d => 
            d.id === dealId ? { ...d, stage: newStage as any } : d
          );
          onUpdateDeals(updatedDeals);
      }
  };

  const handleExportCSV = () => {
      const headers = ['Company', 'Role', 'Stage', 'Value', 'Next Step', 'Date Applied', 'Follow Up'];
      const rows = deals.map(d => [
          d.company, d.role, d.stage, d.value, d.next_step, d.dateApplied || '', d.nextFollowUp || ''
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
          + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "nexus_pipeline.csv");
      document.body.appendChild(link);
      link.click();
  };

  const handleSmartAdd = async () => {
      if (!smartAddText.trim()) return;
      setIsProcessing(true);

      try {
        if (!chatSessionRef.current) {
            chatSessionRef.current = createChatSession(AppMode.PIPELINE); // Using Pipeline mode which knows about jobs
        }

        const prompt = `
            ACT AS: Job Parser.
            INPUT: "${smartAddText}"
            
            GOAL: Extract deal details. Infer value if missing based on role seniority (e.g. Director ~$220k, VP ~$250k, AE ~$180k).
            
            OUTPUT JSON ONLY:
            {
                "company": "Company Name",
                "role": "Role Title",
                "value": "$200k",
                "next_step": "Suggested first step",
                "stage": "Target"
            }
        `;

        const result = await chatSessionRef.current.sendMessage(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const extracted = JSON.parse(jsonStr);

        const newDeal: Deal = {
            id: Date.now().toString(),
            company: extracted.company || 'Unknown',
            role: extracted.role || 'Unknown',
            stage: 'Target',
            value: extracted.value || '$0k',
            contacts: [],
            next_step: extracted.next_step || 'Research',
            date: new Date().toISOString().split('T')[0],
            dateApplied: new Date().toISOString().split('T')[0]
        };

        onUpdateDeals([newDeal, ...deals]);
        setSmartAddText('');
        setShowSmartAdd(false);

      } catch (e) {
          alert("Failed to parse deal info.");
      } finally {
          setIsProcessing(false);
      }
  };

  const isStale = (deal: Deal) => {
      // Basic check: if applied > 14 days ago and still applied
      if (!deal.dateApplied) return false;
      const applied = new Date(deal.dateApplied);
      const now = new Date();
      const diff = Math.ceil(Math.abs(now.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 14 && (deal.stage === 'Applied' || deal.stage === 'Target');
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative">
      {/* Smart Add Modal */}
      {showSmartAdd && (
          <div className="absolute inset-0 z-40 bg-nexus-base/90 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-nexus-panel border border-nexus-border rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-white font-mono flex items-center">
                          <Zap className="w-5 h-5 text-nexus-accent mr-2" />
                          SMART DEAL CAPTURE
                      </h3>
                      <button onClick={() => setShowSmartAdd(false)} className="text-nexus-muted hover:text-white"><X className="w-5 h-5"/></button>
                  </div>
                  <p className="text-xs text-nexus-muted mb-4">
                      Paste a Job Description URL, text snippet, or Slack message to auto-create a deal.
                  </p>
                  <textarea 
                    className="w-full h-32 bg-nexus-dark border border-nexus-border rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-nexus-accent resize-none"
                    placeholder="e.g. 'Found a Director of GTM role at Vercel. Looks perfect for my background. Pay range $220-260k.'"
                    value={smartAddText}
                    onChange={(e) => setSmartAddText(e.target.value)}
                  />
                  <div className="flex justify-end mt-4">
                      <button 
                        onClick={handleSmartAdd}
                        disabled={isProcessing || !smartAddText}
                        className="flex items-center px-4 py-2 bg-nexus-accent text-white rounded-lg font-bold text-xs hover:bg-blue-600 disabled:opacity-50"
                      >
                          {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Zap className="w-4 h-4 mr-2"/>}
                          CREATE TARGET
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-lg font-bold text-nexus-text font-mono">JOB APPLICATION PIPELINE</h2>
           <p className="text-xs text-nexus-muted">Target: Jan 31, 2026</p>
        </div>
        <div className="flex items-center space-x-4">
            <div className="bg-nexus-panel border border-nexus-border px-4 py-2 rounded-lg flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-nexus-success" />
                <div>
                    <div className="text-[10px] text-nexus-muted uppercase">Weighted Forecast</div>
                    <div className="text-lg font-bold text-nexus-text font-mono">${calculateWeightedValue()}k</div>
                </div>
            </div>
            <button 
                onClick={handleExportCSV}
                className="flex items-center px-3 py-2 bg-nexus-dark border border-nexus-border text-nexus-muted rounded text-xs font-bold hover:text-white hover:border-nexus-accent transition-colors"
            >
                <Download className="w-4 h-4 mr-2" />
                CSV
            </button>
            <button 
                onClick={() => setShowSmartAdd(true)}
                className="flex items-center px-4 py-2 bg-nexus-accent text-white rounded text-xs font-bold hover:bg-blue-600 transition-colors"
            >
                <Plus className="w-4 h-4 mr-2" />
                ADD TARGET
            </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4 overflow-x-auto min-w-[1000px] pb-4">
        {stages.map((stage) => (
          <div key={stage} className="flex flex-col h-full bg-nexus-dark/50 rounded-xl border border-nexus-border overflow-hidden">
            <div className={`p-3 border-b border-nexus-border/50 flex justify-between items-center ${
              stage === 'Offer' ? 'text-nexus-success' : 'text-nexus-text'
            }`}>
              <span className="font-bold text-sm font-mono uppercase">{stage}</span>
              <span className="text-xs bg-nexus-panel px-2 py-0.5 rounded text-nexus-muted">
                {deals.filter(d => d.stage === stage).length}
              </span>
            </div>
            
            <div className="p-3 space-y-3 flex-1 overflow-y-auto">
              {deals.filter(d => d.stage === stage).map((deal) => (
                <div 
                  key={deal.id}
                  className={`p-4 rounded-lg border hover:border-nexus-accent cursor-pointer group transition-all relative ${getStageColor(deal.stage)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-nexus-text">{deal.company}</div>
                    <ExternalLink className="w-3 h-3 text-nexus-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-xs text-nexus-accent font-mono mb-3">{deal.role}</div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-nexus-muted">
                    <div className="flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {deal.value}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {deal.date}
                    </div>
                  </div>

                  {/* Tracker Details */}
                  {deal.dateApplied && (
                      <div className="mt-2 text-[9px] text-nexus-muted font-mono flex justify-between">
                          <span>Applied: {deal.dateApplied}</span>
                          {isStale(deal) && <span className="text-nexus-warning font-bold">STALE</span>}
                      </div>
                  )}
                  {deal.nextFollowUp && (
                      <div className="text-[9px] text-nexus-accent font-mono">
                          Follow Up: {deal.nextFollowUp}
                      </div>
                  )}
                  
                  {deal.next_step && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <div className="text-[10px] text-nexus-muted uppercase mb-1">NEXT STEP</div>
                      <div className="text-xs text-white font-medium flex items-center">
                         <div className="w-1.5 h-1.5 rounded-full bg-nexus-warning mr-2 animate-pulse"></div>
                         {deal.next_step}
                      </div>
                    </div>
                  )}

                  {/* Move Button (Simulation of drag/drop) */}
                  {stage !== 'Offer' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveDeal(deal.id, deal.stage); }}
                        className="absolute right-2 bottom-2 p-1.5 rounded bg-nexus-dark border border-nexus-border text-nexus-muted hover:text-white hover:border-nexus-accent opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Advance Stage"
                      >
                          <ChevronRight className="w-4 h-4" />
                      </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pipeline;
