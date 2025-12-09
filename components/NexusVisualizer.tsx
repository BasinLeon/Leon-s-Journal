import React from 'react';

const NexusVisualizer: React.FC = () => {
  return (
    <div className="relative w-full h-64 md:h-80 flex items-center justify-center overflow-hidden bg-nexus-panel rounded-xl border border-nexus-border shadow-lg">
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-nexus-border" />
        </svg>
      </div>
      
      {/* Central Node: Basin::Nexus */}
      <div className="relative z-10 flex flex-col items-center animate-pulse">
        <div className="w-24 h-24 rounded-full border-4 border-nexus-accent bg-nexus-dark flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
          <span className="text-nexus-accent font-bold font-mono text-xl">NEXUS</span>
        </div>
        <div className="mt-2 text-xs text-nexus-muted font-mono tracking-widest">CORE ENGINE</div>
      </div>

      {/* Satellite Nodes */}
      {/* Signal Engine */}
      <div className="absolute top-8 left-1/4 transform -translate-x-1/2 flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform">
        <div className="w-16 h-16 rounded-lg border-2 border-nexus-success bg-nexus-panel flex items-center justify-center shadow-lg">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-nexus-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="mt-1 text-xs text-nexus-text font-mono bg-nexus-dark px-2 py-0.5 rounded border border-nexus-border">SIGNAL</span>
      </div>

      {/* Dojo */}
      <div className="absolute bottom-8 right-1/4 transform translate-x-1/2 flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform">
        <div className="w-16 h-16 rounded-lg border-2 border-nexus-warning bg-nexus-panel flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-nexus-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <span className="mt-1 text-xs text-nexus-text font-mono bg-nexus-dark px-2 py-0.5 rounded border border-nexus-border">DOJO</span>
      </div>

       {/* Network Hub */}
       <div className="absolute top-8 right-1/4 transform translate-x-1/2 flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform">
        <div className="w-16 h-16 rounded-lg border-2 border-purple-500 bg-nexus-panel flex items-center justify-center shadow-lg">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <span className="mt-1 text-xs text-nexus-text font-mono bg-nexus-dark px-2 py-0.5 rounded border border-nexus-border">NETWORK</span>
      </div>

       {/* Data Chain */}
       <div className="absolute bottom-8 left-1/4 transform -translate-x-1/2 flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform">
        <div className="w-16 h-16 rounded-lg border-2 border-cyan-500 bg-nexus-panel flex items-center justify-center shadow-lg">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <span className="mt-1 text-xs text-nexus-text font-mono bg-nexus-dark px-2 py-0.5 rounded border border-nexus-border">DATA</span>
      </div>

      {/* Connecting Lines (SVG Overlay) */}
      <svg className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <line x1="50%" y1="50%" x2="25%" y2="20%" stroke="#334155" strokeWidth="2" strokeDasharray="5,5" />
        <line x1="50%" y1="50%" x2="75%" y2="20%" stroke="#334155" strokeWidth="2" strokeDasharray="5,5" />
        <line x1="50%" y1="50%" x2="25%" y2="80%" stroke="#334155" strokeWidth="2" strokeDasharray="5,5" />
        <line x1="50%" y1="50%" x2="75%" y2="80%" stroke="#334155" strokeWidth="2" strokeDasharray="5,5" />
      </svg>
    </div>
  );
};

export default NexusVisualizer;