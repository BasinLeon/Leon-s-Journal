import React, { useRef, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import NexusVisualizer from './NexusVisualizer';
import { TrendingUp, Target, Network, Zap, Database, Upload, Download, RefreshCw, Calendar, FileText, ArrowUpRight, Award, Cloud, ChevronDown, Edit, ExternalLink, Briefcase } from 'lucide-react';

const data = [
  { name: 'W1', pipeline: 20 },
  { name: 'W2', pipeline: 35 },
  { name: 'W3', pipeline: 45 },
  { name: 'W4', pipeline: 80 },
  { name: 'W5', pipeline: 110 },
  { name: 'W6', pipeline: 160 },
];

const MetricCard = ({ title, value, sub, icon: Icon, trend, colorClass = "text-nexus-accent", borderClass = "border-nexus-accent/20", glowClass = "shadow-glow" }: any) => (
  <div className={`relative bg-gradient-to-b from-nexus-panel to-nexus-dark p-6 rounded-xl border border-nexus-border hover:border-opacity-100 transition-all duration-500 group overflow-hidden ${borderClass} hover:shadow-lg hover:-translate-y-1`}>
    {/* Background Glow */}
    <div className={`absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-500 ${colorClass} bg-current blur-3xl rounded-full translate-x-10 -translate-y-10`}></div>
    
    <div className="relative z-10 flex justify-between items-start mb-4">
      <div>
        <h3 className="text-nexus-muted text-[10px] font-mono uppercase tracking-widest font-bold group-hover:text-white transition-colors">{title}</h3>
        <div className="text-3xl font-bold text-white mt-2 tracking-tight flex items-baseline">
            {value}
        </div>
      </div>
      <div className={`p-2.5 bg-nexus-base rounded-lg border border-nexus-border group-hover:scale-110 transition-transform duration-300 shadow-md`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
    </div>
    <div className="relative z-10 flex items-center">
        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${trend === 'up' ? 'text-nexus-success bg-nexus-success/10 border-nexus-success/20' : 'text-nexus-muted bg-nexus-panel border-nexus-border'}`}>
            {sub}
        </span>
    </div>
  </div>
);

interface DashboardProps {
  activeDealsCount?: number;
  onExport?: () => void;
  onImport?: (file: File) => void;
  isImporting?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  activeDealsCount = 3, 
  onExport, 
  onImport,
  isImporting 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [workspaceLinks, setWorkspaceLinks] = useState({
    docs: 'https://docs.new',
    calendar: 'https://calendar.google.com/calendar/r/eventedit?text=Interview+Prep',
    drive: 'https://drive.google.com'
  });
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);

  // Load links from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nexus_workspace_links');
    if (saved) {
        setWorkspaceLinks(JSON.parse(saved));
    }
  }, []);

  const saveLinks = () => {
    localStorage.setItem('nexus_workspace_links', JSON.stringify(workspaceLinks));
    setIsEditingWorkspace(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
  };

  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  // Strategy: Monday/Friday. Execution: Tue/Wed/Thu
  const isExecutionDay = ['Tuesday', 'Wednesday', 'Thursday'].includes(dayOfWeek);
  
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* TACTICAL HUD BANNER */}
      <div className="relative w-full rounded-xl overflow-hidden border border-nexus-border shadow-2xl group">
          {/* Animated Background */}
          <div className={`absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]`}></div>
          <div className={`absolute inset-0 opacity-20 ${isExecutionDay ? 'bg-gradient-to-r from-nexus-success/20 to-transparent' : 'bg-gradient-to-r from-nexus-gold/20 to-transparent'}`}></div>
          
          <div className="relative p-6 flex flex-col md:flex-row items-center justify-between bg-nexus-panel/60 backdrop-blur-md">
              <div className="flex items-center mb-4 md:mb-0 w-full md:w-auto">
                 <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-5 border shadow-[0_0_20px_rgba(0,0,0,0.3)] ${isExecutionDay ? 'bg-nexus-success/10 border-nexus-success/30' : 'bg-nexus-gold/10 border-nexus-gold/30'}`}>
                    {isExecutionDay ? <Target className="w-7 h-7 text-nexus-success" /> : <Briefcase className="w-7 h-7 text-nexus-gold" />}
                 </div>
                 <div>
                     <div className="flex items-center space-x-3">
                         <h3 className={`font-bold font-mono text-base tracking-widest uppercase ${isExecutionDay ? 'text-nexus-success' : 'text-nexus-gold'}`}>
                             MARKET TIMING: {dayOfWeek.toUpperCase()}
                         </h3>
                         <span className={`w-2 h-2 rounded-full animate-pulse ${isExecutionDay ? 'bg-nexus-success shadow-[0_0_10px_#10b981]' : 'bg-nexus-gold shadow-[0_0_10px_#D4AF37]'}`}></span>
                     </div>
                     <p className="text-sm text-nexus-muted mt-1 font-medium max-w-lg">
                         {isExecutionDay 
                         ? "High response probability detected. Maximize OUTBOUND volume and PIPELINE velocity." 
                         : "Lower response rates expected. Focus on STRATEGY, SKILL REFINEMENT, and CONTENT."}
                     </p>
                 </div>
              </div>
              <div className="flex items-center bg-nexus-base px-5 py-3 rounded-lg border border-nexus-border shadow-lg">
                  <span className="text-[10px] text-nexus-muted font-mono mr-3 uppercase tracking-wider">RECOMMENDATION</span>
                  <span className={`text-xs font-bold font-mono px-3 py-1 rounded border ${
                       isExecutionDay 
                       ? 'bg-nexus-success/20 text-nexus-success border-nexus-success/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                       : 'bg-nexus-gold/20 text-nexus-gold border-nexus-gold/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                  }`}>
                      {isExecutionDay ? "EXECUTE: APPLY NOW" : "EXECUTE: PRACTICE"}
                  </span>
              </div>
          </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
            title="Pipeline Velocity" 
            value="160%" 
            sub="+24% vs Target" 
            icon={TrendingUp} 
            trend="up"
            colorClass="text-nexus-accent"
            borderClass="border-nexus-accent/30"
        />
        <MetricCard 
            title="Content Flywheel" 
            value="Active" 
            sub="Signal Processing" 
            icon={Network} 
            trend="up" 
            colorClass="text-purple-400"
            borderClass="border-purple-500/30"
        />
        <MetricCard 
            title="System Status" 
            value="V5.0" 
            sub="Ecosystem Owner" 
            icon={Zap} 
            trend="up"
            colorClass="text-yellow-400"
            borderClass="border-yellow-500/30"
        />
         <MetricCard 
            title="Active Deals" 
            value={`${activeDealsCount} High Value`} 
            sub="Tebra, Adobe, Fudo" 
            icon={Target} 
            trend="neutral"
            colorClass="text-emerald-400"
            borderClass="border-emerald-500/30"
        />
      </div>

      {/* MAIN VISUALIZATION AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-nexus-panel/40 backdrop-blur-xl p-6 rounded-xl border border-nexus-border shadow-xl relative overflow-hidden group">
           {/* Scanline Effect */}
           <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
           
           <div className="flex items-center justify-between mb-6 relative z-10">
             <div>
                <h3 className="text-sm font-bold text-white font-mono tracking-widest uppercase flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-nexus-accent" />
                    Growth Trajectory // FUDO
                </h3>
             </div>
             <div className="flex items-center space-x-2">
                <span className="text-[10px] text-nexus-muted font-mono uppercase">Timeline</span>
                <button className="flex items-center bg-nexus-dark text-xs text-nexus-muted border border-nexus-border rounded-lg px-3 py-1.5 hover:border-nexus-accent hover:text-white transition-colors font-mono">
                    Q3 2024
                    <ChevronDown className="w-3 h-3 ml-2" />
                </button>
             </div>
           </div>
           <div className="h-72 w-full bg-nexus-base/40 rounded-lg p-2 border border-nexus-border relative z-10">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                 <defs>
                   <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                 <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} fontFamily="JetBrains Mono" />
                 <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} fontFamily="JetBrains Mono" />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#3b82f6' }}
                    cursor={{ stroke: '#334155', strokeWidth: 1 }}
                 />
                 <Area 
                    type="monotone" 
                    dataKey="pipeline" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorPipeline)" 
                    animationDuration={1500}
                />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* System Visualizer */}
        <div className="bg-nexus-panel/40 backdrop-blur-xl p-6 rounded-xl border border-nexus-border shadow-xl flex flex-col relative overflow-hidden">
            <h3 className="text-sm font-bold text-white font-mono tracking-widest uppercase mb-4 flex items-center relative z-10">
                <Network className="w-4 h-4 mr-2 text-purple-400" />
                SYSTEM ARCHITECTURE
            </h3>
            <div className="flex-1 flex flex-col justify-center relative z-10">
                <NexusVisualizer />
                <div className="mt-4 bg-nexus-dark/50 rounded-lg border border-nexus-border p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-nexus-muted">SIGNAL ENGINE</span>
                        <div className="flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-nexus-success mr-2 shadow-[0_0_5px_#10b981]"></span>
                            <span className="text-nexus-success">ONLINE</span>
                        </div>
                    </div>
                     <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-nexus-muted">THE DOJO</span>
                        <div className="flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-nexus-warning mr-2 animate-pulse"></span>
                            <span className="text-nexus-warning">ACTIVE</span>
                        </div>
                    </div>
                     <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-nexus-muted">CONTENT FACTORY</span>
                        <div className="flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2"></span>
                            <span className="text-purple-400">PROCESSING</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* LOWER DECK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         
         {/* BADGE CASE */}
         <div className="bg-nexus-panel/40 backdrop-blur-xl p-6 rounded-xl border border-nexus-border shadow-xl">
             <div className="flex items-center space-x-2 mb-4 border-b border-nexus-border/50 pb-2">
                 <Award className="w-4 h-4 text-nexus-gold" />
                 <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest">ACHIEVEMENTS</h3>
             </div>
             <div className="grid grid-cols-4 gap-3">
                 {[
                     { id: '1', icon: '🩸', label: 'First Blood', color: 'border-red-500/30 bg-red-900/10' },
                     { id: '2', icon: '🔥', label: 'Heating Up', color: 'border-orange-500/30 bg-orange-900/10' },
                     { id: '3', icon: '💎', label: 'Elite', color: 'border-cyan-500/30 bg-cyan-900/10' },
                     { id: '4', icon: '💀', label: 'Survivor', color: 'border-gray-500/30 bg-gray-900/10' },
                 ].map((badge) => (
                     <div key={badge.id} className={`aspect-square rounded-xl border ${badge.color} flex flex-col items-center justify-center hover:bg-nexus-panel cursor-pointer transition-all hover:scale-105 group shadow-lg`}>
                         <span className="text-2xl mb-1 filter drop-shadow-md group-hover:scale-110 transition-transform">{badge.icon}</span>
                     </div>
                 ))}
             </div>
         </div>

         {/* WORKSPACE UPLINK */}
         <div className="bg-nexus-panel/40 backdrop-blur-xl p-6 rounded-xl border border-nexus-border shadow-xl flex flex-col">
             <div className="flex items-center justify-between mb-4 border-b border-nexus-border/50 pb-2">
                 <div className="flex items-center space-x-2">
                    <Cloud className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest">WORKSPACE UPLINK</h3>
                 </div>
                 <button 
                    onClick={() => isEditingWorkspace ? saveLinks() : setIsEditingWorkspace(true)}
                    className="p-1 hover:bg-nexus-panel rounded text-nexus-muted hover:text-white transition-colors"
                 >
                    {isEditingWorkspace ? <Zap className="w-3 h-3 text-nexus-accent" /> : <Edit className="w-3 h-3" />}
                 </button>
             </div>
             
             <div className="space-y-3 flex-1">
                {isEditingWorkspace ? (
                    <div className="space-y-2">
                        <div className="space-y-1">
                            <label className="text-[10px] text-nexus-muted font-mono">DOCS URL</label>
                            <input 
                                value={workspaceLinks.docs} 
                                onChange={(e) => setWorkspaceLinks(p => ({...p, docs: e.target.value}))}
                                className="w-full bg-nexus-dark border border-nexus-border rounded p-1 text-xs text-nexus-text"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-nexus-muted font-mono">CALENDAR URL</label>
                            <input 
                                value={workspaceLinks.calendar} 
                                onChange={(e) => setWorkspaceLinks(p => ({...p, calendar: e.target.value}))}
                                className="w-full bg-nexus-dark border border-nexus-border rounded p-1 text-xs text-nexus-text"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-nexus-muted font-mono">DRIVE URL</label>
                            <input 
                                value={workspaceLinks.drive} 
                                onChange={(e) => setWorkspaceLinks(p => ({...p, drive: e.target.value}))}
                                className="w-full bg-nexus-dark border border-nexus-border rounded p-1 text-xs text-nexus-text"
                            />
                        </div>
                    </div>
                ) : (
                 <>
                    <WorkspaceButton 
                        href={workspaceLinks.docs} 
                        icon={FileText} 
                        label="CREATE STRATEGY DOC" 
                        sub="Google Docs"
                        color="blue"
                    />
                    <WorkspaceButton 
                        href={workspaceLinks.calendar} 
                        icon={Calendar} 
                        label="SCHEDULE PREP" 
                        sub="Google Calendar"
                        color="green"
                    />
                    <WorkspaceButton 
                        href={workspaceLinks.drive} 
                        icon={Database} 
                        label="ACCESS ASSETS" 
                        sub="Google Drive"
                        color="yellow"
                    />
                 </>
                )}
             </div>
             
             <div className="mt-4 flex justify-between items-center">
                 <div className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    INTEGRATED
                 </div>
                 {/* Launch Streamlit Button */}
                 <a 
                   href="https://basinnexusappapp-39k7ljzoseebgnrivt6oey.streamlit.app/"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-[10px] flex items-center text-nexus-muted hover:text-nexus-success transition-colors group"
                 >
                    LAUNCH INTERVIEW::NEXUS
                    <ExternalLink className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
                 </a>
             </div>
         </div>

         {/* DATA BRIDGE PANEL */}
         <div className="bg-nexus-panel/40 backdrop-blur-xl p-6 rounded-xl border border-nexus-border shadow-xl flex flex-col">
            <div className="flex items-center space-x-2 mb-4 border-b border-nexus-border/50 pb-2">
                <Database className="w-4 h-4 text-nexus-accent" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest">Data Bridge</h3>
            </div>
            
            <p className="text-[10px] text-nexus-muted mb-6 font-mono leading-relaxed bg-nexus-base/50 p-3 rounded border border-nexus-border/30">
              Sync React Dashboard with Python/Streamlit backend. <br/> <span className="text-nexus-success animate-pulse">● Secure Handshake Protocol Active.</span>
            </p>
            
            <div className="space-y-3 mt-auto">
              <button 
                onClick={onExport}
                className="w-full relative overflow-hidden flex items-center justify-center px-4 py-3 bg-nexus-dark border border-nexus-border rounded-lg text-xs font-mono font-bold text-nexus-text hover:border-nexus-accent hover:text-white transition-all group"
              >
                <div className="absolute inset-0 bg-nexus-accent/0 group-hover:bg-nexus-accent/10 transition-colors"></div>
                <Download className="w-4 h-4 mr-2 group-hover:text-nexus-accent transition-colors" />
                EXPORT TO STREAMLIT
              </button>
              
              <div className="relative">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="w-full relative overflow-hidden flex items-center justify-center px-4 py-3 bg-nexus-dark border border-nexus-border rounded-lg text-xs font-mono font-bold text-nexus-text hover:border-nexus-success hover:text-white transition-all group disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-nexus-success/0 group-hover:bg-nexus-success/10 transition-colors"></div>
                  {isImporting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin text-nexus-warning" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2 group-hover:text-nexus-success transition-colors" />
                  )}
                  {isImporting ? 'SYNCING DATA...' : 'IMPORT FROM STREAMLIT'}
                </button>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

// Helper for Workspace Buttons
const WorkspaceButton = ({ href, icon: Icon, label, sub, color }: any) => {
    const colorStyles: Record<string, string> = {
        blue: "text-blue-400 group-hover:text-blue-300 bg-blue-500/10 group-hover:bg-blue-500/20 group-hover:border-blue-500/50",
        green: "text-green-400 group-hover:text-green-300 bg-green-500/10 group-hover:bg-green-500/20 group-hover:border-green-500/50",
        yellow: "text-yellow-400 group-hover:text-yellow-300 bg-yellow-500/10 group-hover:bg-yellow-500/20 group-hover:border-yellow-500/50",
    };

    return (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center p-3 rounded-lg bg-nexus-dark/50 border border-nexus-border transition-all duration-300 group hover:scale-[1.02] ${colorStyles[color].split(' ').pop()}`}
        >
            <div className={`p-2 rounded-md mr-3 transition-colors ${colorStyles[color].split(' ').slice(0, 3).join(' ')}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <div className="text-xs font-bold text-white group-hover:text-white/90 font-mono tracking-tight">{label}</div>
                <div className="text-[10px] text-nexus-muted">{sub}</div>
            </div>
            <ArrowUpRight className="ml-auto w-3 h-3 text-nexus-border group-hover:text-white transition-colors opacity-50 group-hover:opacity-100" />
        </a>
    )
}

export default Dashboard;