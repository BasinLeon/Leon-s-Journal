
import React from 'react';
import { Deal } from '../types';
import { Briefcase, DollarSign, Calendar, Plus, ExternalLink, TrendingUp, ChevronRight } from 'lucide-react';

interface PipelineProps {
  deals: Deal[];
  onUpdateDeals: (deals: Deal[]) => void;
}

const Pipeline: React.FC<PipelineProps> = ({ deals, onUpdateDeals }) => {
  const stages = ['Target', 'Applied', 'Interviewing', 'Offer'];

  // Calculate Weighted Value
  // Target: 10%, Applied: 20%, Interviewing: 50%, Offer: 90%
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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
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
            <button className="flex items-center px-4 py-2 bg-nexus-accent text-white rounded text-xs font-bold hover:bg-blue-600 transition-colors">
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
