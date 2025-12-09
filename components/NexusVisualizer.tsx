import React from 'react';
import { Network, Database, Zap, Sword } from 'lucide-react';

const NexusVisualizer: React.FC = () => {
  return (
    <div className="relative w-full h-64 md:h-80 flex items-center justify-center overflow-hidden bg-nexus-base rounded-xl border border-nexus-border shadow-2xl group">
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-nexus-border" />
            </pattern>
            <radialGradient id="centerGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#centerGlow)" />
        </svg>
      </div>

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-nexus-accent/10 to-transparent pointer-events-none"></div>
      
      {/* Central Node: Basin::Nexus */}
      <div className="relative z-20 flex flex-col items-center">
        <div className="relative">
             <div className="absolute inset-0 rounded-full bg-nexus-accent blur-xl opacity-30 animate-pulse"></div>
             <div className="w-24 h-24 rounded-full border border-nexus-accent/50 bg-nexus-dark/90 backdrop-blur-xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)] relative z-10 group-hover:border-nexus-accent group-hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] transition-all duration-700">
                <div className="text-center">
                    <span className="text-nexus-accent font-bold font-mono text-2xl tracking-tighter block text-shadow-glow">NEXUS</span>
                </div>
             </div>
        </div>
        <div className="mt-4 text-[10px] text-nexus-text font-mono tracking-[0.3em] bg-nexus-dark/80 px-3 py-1 rounded border border-nexus-border/50 shadow-lg">CORE ENGINE</div>
      </div>

      {/* Connecting Lines (Animated) */}
      <svg className="absolute inset-0 pointer-events-none z-0 opacity-50">
        <defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        
        {/* Top Left */}
        <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="#10b981" strokeWidth="1" strokeDasharray="5,5" className="animate-[dash_20s_linear_infinite]" />
        <circle cx="35%" cy="35%" r="2" fill="#10b981" className="animate-[ping_3s_linear_infinite]" />
        
        {/* Top Right */}
        <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="#a855f7" strokeWidth="1" strokeDasharray="5,5" className="animate-[dash_25s_linear_infinite]" />
         <circle cx="65%" cy="35%" r="2" fill="#a855f7" className="animate-[ping_3s_linear_infinite_1s]" />

        {/* Bottom Left */}
        <line x1="50%" y1="50%" x2="20%" y2="80%" stroke="#06b6d4" strokeWidth="1" strokeDasharray="5,5" className="animate-[dash_22s_linear_infinite]" />
        <circle cx="35%" cy="65%" r="2" fill="#06b6d4" className="animate-[ping_3s_linear_infinite_0.5s]" />

        {/* Bottom Right */}
        <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="#f59e0b" strokeWidth="1" strokeDasharray="5,5" className="animate-[dash_18s_linear_infinite]" />
         <circle cx="65%" cy="65%" r="2" fill="#f59e0b" className="animate-[ping_3s_linear_infinite_1.5s]" />
      </svg>

      {/* Satellite Nodes */}
      
      {/* Signal Engine (Top Left) */}
      <div className="absolute top-8 left-[15%] flex flex-col items-center group/node cursor-pointer hover:scale-110 transition-transform duration-300">
        <div className="w-14 h-14 rounded-2xl border border-nexus-success/30 bg-nexus-dark/80 backdrop-blur-md flex items-center justify-center shadow-lg group-hover/node:border-nexus-success group-hover/node:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all relative">
           <div className="absolute inset-0 bg-nexus-success opacity-10 rounded-2xl"></div>
           <Zap className="w-6 h-6 text-nexus-success drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
        </div>
        <span className="mt-3 text-[10px] text-nexus-text font-mono tracking-wider opacity-70 group-hover/node:opacity-100 group-hover/node:text-nexus-success transition-colors">SIGNAL</span>
      </div>

      {/* Network (Top Right) */}
      <div className="absolute top-8 right-[15%] flex flex-col items-center group/node cursor-pointer hover:scale-110 transition-transform duration-300">
        <div className="w-14 h-14 rounded-2xl border border-purple-500/30 bg-nexus-dark/80 backdrop-blur-md flex items-center justify-center shadow-lg group-hover/node:border-purple-500 group-hover/node:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all relative">
           <div className="absolute inset-0 bg-purple-500 opacity-10 rounded-2xl"></div>
           <Network className="w-6 h-6 text-purple-500 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]" />
        </div>
        <span className="mt-3 text-[10px] text-nexus-text font-mono tracking-wider opacity-70 group-hover/node:opacity-100 group-hover/node:text-purple-400 transition-colors">NETWORK</span>
      </div>

       {/* Data Chain (Bottom Left) */}
       <div className="absolute bottom-8 left-[15%] flex flex-col items-center group/node cursor-pointer hover:scale-110 transition-transform duration-300">
        <div className="w-14 h-14 rounded-2xl border border-cyan-500/30 bg-nexus-dark/80 backdrop-blur-md flex items-center justify-center shadow-lg group-hover/node:border-cyan-500 group-hover/node:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all relative">
           <div className="absolute inset-0 bg-cyan-500 opacity-10 rounded-2xl"></div>
           <Database className="w-6 h-6 text-cyan-500 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
        </div>
        <span className="mt-3 text-[10px] text-nexus-text font-mono tracking-wider opacity-70 group-hover/node:opacity-100 group-hover/node:text-cyan-400 transition-colors">DATA</span>
      </div>

      {/* Dojo (Bottom Right) */}
      <div className="absolute bottom-8 right-[15%] flex flex-col items-center group/node cursor-pointer hover:scale-110 transition-transform duration-300">
        <div className="w-14 h-14 rounded-2xl border border-nexus-gold/30 bg-nexus-dark/80 backdrop-blur-md flex items-center justify-center shadow-lg group-hover/node:border-nexus-gold group-hover/node:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all relative">
          <div className="absolute inset-0 bg-nexus-gold opacity-10 rounded-2xl"></div>
          <Sword className="w-6 h-6 text-nexus-gold drop-shadow-[0_0_5px_rgba(212,175,55,0.8)]" />
        </div>
        <span className="mt-3 text-[10px] text-nexus-text font-mono tracking-wider opacity-70 group-hover/node:opacity-100 group-hover/node:text-nexus-gold transition-colors">DOJO</span>
      </div>

    </div>
  );
};

export default NexusVisualizer;