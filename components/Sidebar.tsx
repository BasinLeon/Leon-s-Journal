
import React from 'react';
import { AppMode } from '../types';
import { LayoutDashboard, Sword, Cpu, Feather, Eye, Network, Book, Briefcase, Crosshair, FileText, Activity, ExternalLink, Shield, Zap, Anchor, Radio, Circle } from 'lucide-react';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  const groups = [
    {
      title: 'BATTLESTATION', // Prep & Defense
      color: 'text-nexus-danger',
      items: [
        { mode: AppMode.DOJO, label: 'The Dojo', sub: 'Combat Sim', icon: Sword },
        { mode: AppMode.MIRROR, label: 'The Mirror', sub: 'Digital Twin', icon: Eye },
      ]
    },
    {
      title: 'ORACLE ARRAY', // Intel & Analysis
      color: 'text-nexus-accent',
      items: [
        { mode: AppMode.HUNT, label: 'Sniper Scope', sub: 'JD Analysis', icon: Crosshair },
        { mode: AppMode.RESUME, label: 'Resume Architect', sub: 'Fit Optimization', icon: FileText },
        { mode: AppMode.ARCHITECT, label: 'The Architect', sub: 'System Logic', icon: Cpu },
        { mode: AppMode.JOURNAL, label: 'The Journal', sub: 'Chronicle', icon: Book },
      ]
    },
    {
      title: 'BUILDER DECK', // Execution & CRM
      color: 'text-nexus-gold',
      items: [
        { mode: AppMode.DASHBOARD, label: 'CMD Center', sub: 'Metrics', icon: LayoutDashboard },
        { mode: AppMode.PIPELINE, label: 'Pipeline CRM', sub: 'Deal Flow', icon: Briefcase },
        { mode: AppMode.NETWORK, label: 'The Connector', sub: 'Network CRM', icon: Network },
        { mode: AppMode.SCRIBE, label: 'Social HQ', sub: 'Content Ops', icon: Feather },
      ]
    }
  ];

  return (
    <div className="w-20 md:w-64 bg-nexus-base/95 backdrop-blur-xl border-r border-nexus-border flex flex-col h-screen fixed left-0 top-0 z-50 shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-nexus-border flex items-center justify-center md:justify-start bg-gradient-to-r from-nexus-base to-nexus-dark">
        <div className="w-10 h-10 bg-gradient-to-br from-nexus-accent to-blue-700 rounded-xl flex items-center justify-center shrink-0 shadow-glow relative group cursor-default">
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-xl"></div>
            <span className="font-bold text-white text-xl tracking-tight">N</span>
        </div>
        <div className="hidden md:block ml-3">
            <h1 className="text-sm font-bold text-white tracking-widest font-mono">BASIN::NEXUS</h1>
            <div className="flex items-center mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-nexus-gold mr-1.5 animate-pulse"></span>
                <p className="text-[10px] text-nexus-gold font-mono tracking-wider opacity-90">v5.2-WAR ROOM</p>
            </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto custom-scrollbar space-y-6">
        {groups.map((group) => (
          <div key={group.title} className="space-y-1 bg-nexus-dark/20 rounded-xl p-2 border border-white/5">
            <div className="hidden md:flex items-center px-3 mb-2 mt-1">
                <span className={`text-[10px] font-bold tracking-[0.2em] font-mono uppercase group-hover:text-nexus-muted transition-colors flex items-center ${group.color}`}>
                  <span className="mr-2">▼</span> {group.title}
                </span>
            </div>
            {group.items.map((item) => {
              const isActive = currentMode === item.mode;
              return (
                <button
                  key={item.mode}
                  onClick={() => setMode(item.mode)}
                  className={`w-full flex items-center p-2 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? 'bg-nexus-panel border border-nexus-border shadow-lg'
                      : 'hover:bg-nexus-panel/50 border border-transparent hover:border-nexus-border/50'
                  }`}
                >
                  <div className={`hidden md:flex items-center justify-center w-4 h-4 mr-3 ${isActive ? group.color : 'text-nexus-muted'}`}>
                     {isActive ? <Radio className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
                  </div>
                  
                  <item.icon 
                    className={`w-4 h-4 shrink-0 transition-all duration-300 md:hidden ${
                        isActive ? 'text-nexus-accent scale-110' : 'text-nexus-muted'
                    }`} 
                  />
                  
                  <div className="hidden md:block text-left">
                      <div className={`font-mono text-xs font-medium tracking-tight transition-all ${isActive ? 'text-white' : 'text-nexus-muted group-hover:text-gray-300'}`}>
                        {item.label}
                      </div>
                      {/* Sub-label only visible on active or hover, maybe? keeping it simple for now */}
                  </div>
                  
                  {isActive && (
                     <div className={`ml-auto hidden md:block w-1.5 h-1.5 rounded-full shadow-[0_0_5px] ${group.color.replace('text-', 'bg-').replace('text-', 'shadow-')}`}></div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-nexus-border bg-nexus-dark/50 space-y-3 hidden md:block">
        
        {/* Streamlit Launcher */}
        <a 
          href="https://basinnexusappapp-39k7ljzoseebgnrivt6oey.streamlit.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-lg bg-nexus-panel border border-nexus-border hover:border-nexus-success/50 hover:bg-nexus-success/5 transition-all group"
        >
          <div className="flex items-center">
            <Activity className="w-3 h-3 text-nexus-success mr-2" />
            <span className="text-[10px] font-mono text-nexus-muted group-hover:text-white">INTERVIEW::NEXUS</span>
          </div>
          <ExternalLink className="w-3 h-3 text-nexus-subtle group-hover:text-nexus-success" />
        </a>

        <div className="flex items-center justify-center pt-2">
            <div className="text-[9px] font-mono text-nexus-subtle">
                LEON BASIN <br/>
                <span className="text-nexus-success">OPERATOR ONLINE</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
