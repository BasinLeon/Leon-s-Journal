
import React from 'react';
import { AppMode } from '../types';
import { LayoutDashboard, Sword, Cpu, Feather, Eye, Network, Book } from 'lucide-react';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  const menuItems = [
    { mode: AppMode.DASHBOARD, label: 'CMD Center', icon: LayoutDashboard },
    { mode: AppMode.DOJO, label: 'The Dojo', icon: Sword },
    { mode: AppMode.ARCHITECT, label: 'The Architect', icon: Cpu },
    { mode: AppMode.SCRIBE, label: 'The Scribe', icon: Feather },
    { mode: AppMode.MIRROR, label: 'The Mirror', icon: Eye },
    { mode: AppMode.NETWORK, label: 'The Connector', icon: Network },
    { mode: AppMode.JOURNAL, label: 'The Journal', icon: Book },
  ];

  return (
    <div className="w-20 md:w-64 bg-nexus-dark border-r border-nexus-border flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-4 md:p-6 border-b border-nexus-border flex items-center justify-center md:justify-start">
        <div className="w-8 h-8 bg-nexus-accent rounded flex items-center justify-center shrink-0">
            <span className="font-bold text-white text-xl">N</span>
        </div>
        <div className="hidden md:block ml-3">
            <h1 className="text-sm font-bold text-nexus-text tracking-wider">BASIN::NEXUS</h1>
            <p className="text-[10px] text-nexus-muted">v5.0-ECOSYSTEM</p>
        </div>
      </div>

      <nav className="flex-1 py-6 space-y-2 px-2 md:px-4">
        {menuItems.map((item) => (
          <button
            key={item.mode}
            onClick={() => setMode(item.mode)}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group ${
              currentMode === item.mode
                ? 'bg-nexus-accent/10 text-nexus-accent border border-nexus-accent/20'
                : 'text-nexus-muted hover:bg-nexus-panel hover:text-nexus-text'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentMode === item.mode ? 'text-nexus-accent' : 'group-hover:text-nexus-text'}`} />
            <span className="hidden md:block ml-3 font-mono text-sm font-medium">{item.label}</span>
            {currentMode === item.mode && (
                <div className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-nexus-accent shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-nexus-border hidden md:block">
        <div className="bg-nexus-panel rounded p-3 border border-nexus-border">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-nexus-muted font-mono">STATUS</span>
                <span className="text-xs text-nexus-success font-bold font-mono">ONLINE</span>
            </div>
            <div className="w-full bg-nexus-dark h-1.5 rounded-full overflow-hidden">
                <div className="bg-nexus-accent h-full w-[85%]"></div>
            </div>
            <p className="text-[10px] text-nexus-muted mt-2">V5.0 Content Engine</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
