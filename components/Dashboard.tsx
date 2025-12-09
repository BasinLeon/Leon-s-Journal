
import React, { useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import NexusVisualizer from './NexusVisualizer';
import { TrendingUp, Target, Network, Zap, Database, Upload, Download, RefreshCw } from 'lucide-react';

const data = [
  { name: 'W1', pipeline: 20 },
  { name: 'W2', pipeline: 35 },
  { name: 'W3', pipeline: 45 },
  { name: 'W4', pipeline: 80 },
  { name: 'W5', pipeline: 110 },
  { name: 'W6', pipeline: 160 },
];

const MetricCard = ({ title, value, sub, icon: Icon, trend }: any) => (
  <div className="bg-nexus-panel p-5 rounded-xl border border-nexus-border hover:border-nexus-accent/50 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-nexus-muted text-xs font-mono uppercase tracking-wider">{title}</h3>
        <div className="text-2xl font-bold text-nexus-text mt-1">{value}</div>
      </div>
      <div className="p-2 bg-nexus-dark rounded-lg border border-nexus-border">
        <Icon className="w-5 h-5 text-nexus-accent" />
      </div>
    </div>
    <div className="flex items-center">
        <span className={`text-xs font-bold ${trend === 'up' ? 'text-nexus-success' : 'text-nexus-muted'}`}>
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
            title="Pipeline Velocity" 
            value="160%" 
            sub="+24% vs Target" 
            icon={TrendingUp} 
            trend="up" 
        />
        <MetricCard 
            title="Content Flywheel" 
            value="Active" 
            sub="Signal Processing" 
            icon={Network} 
            trend="up" 
        />
        <MetricCard 
            title="System Status" 
            value="V5.0" 
            sub="Ecosystem Owner" 
            icon={Zap} 
            trend="up" 
        />
         <MetricCard 
            title="Active Deals" 
            value={`${activeDealsCount} High Value`} 
            sub="Tebra, Adobe, Fudo" 
            icon={Target} 
            trend="neutral" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-nexus-panel p-6 rounded-xl border border-nexus-border">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-nexus-text font-mono">GROWTH TRAJECTORY // FUDO</h3>
             <select className="bg-nexus-dark text-nexus-muted text-xs border border-nexus-border rounded px-2 py-1 font-mono">
                <option>Q3 2024</option>
                <option>Q4 2024</option>
             </select>
           </div>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                 <defs>
                   <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                 <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#3b82f6' }}
                 />
                 <Area type="monotone" dataKey="pipeline" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPipeline)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-nexus-panel p-6 rounded-xl border border-nexus-border flex flex-col">
            <h3 className="text-lg font-bold text-nexus-text font-mono mb-4">SYSTEM ARCHITECTURE</h3>
            <div className="flex-1 flex flex-col justify-center">
                <NexusVisualizer />
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-nexus-muted font-mono border-b border-nexus-border/50 pb-2">
                        <span>SIGNAL ENGINE</span>
                        <span className="text-nexus-success">ONLINE</span>
                    </div>
                     <div className="flex justify-between text-xs text-nexus-muted font-mono border-b border-nexus-border/50 pb-2">
                        <span>THE DOJO</span>
                        <span className="text-nexus-warning">ACTIVE</span>
                    </div>
                     <div className="flex justify-between text-xs text-nexus-muted font-mono">
                        <span>CONTENT FACTORY</span>
                        <span className="text-purple-500 animate-pulse">PROCESSING</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="bg-nexus-panel p-6 rounded-xl border border-nexus-border">
            <h3 className="text-sm font-bold text-nexus-muted font-mono mb-4 uppercase">Latest Intel</h3>
            <ul className="space-y-3">
                <li className="flex items-start">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-nexus-danger mr-3 shrink-0"></span>
                    <div>
                        <p className="text-sm text-nexus-text font-medium">Tebra Interview Prep</p>
                        <p className="text-xs text-nexus-muted mt-1">Status: PROPOSAL PHASE. "I am not a candidate; I am a System Installer."</p>
                    </div>
                </li>
                <li className="flex items-start">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-nexus-success mr-3 shrink-0"></span>
                    <div>
                        <p className="text-sm text-nexus-text font-medium">V5.0 Flywheel Deployed</p>
                        <p className="text-xs text-nexus-muted mt-1">Network CRM + Content Factory active. Conversation → Gravity loop initialized.</p>
                    </div>
                </li>
            </ul>
         </div>

          <div className="bg-nexus-panel p-6 rounded-xl border border-nexus-border relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-24 h-24 text-nexus-accent" />
            </div>
            <h3 className="text-sm font-bold text-nexus-muted font-mono mb-2 uppercase">V5.0 Identity</h3>
            <blockquote className="text-lg font-serif italic text-nexus-text leading-relaxed border-l-4 border-nexus-accent pl-4 py-2">
                "Turn every conversation into gravity. The system is the leverage. The operator is the bottleneck."
            </blockquote>
            <p className="text-right text-xs text-nexus-muted mt-4 font-mono">- BASIN::NEXUS // ECOSYSTEM OWNER</p>
         </div>

         {/* DATA BRIDGE PANEL */}
         <div className="bg-nexus-panel p-6 rounded-xl border border-nexus-border flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Database className="w-5 h-5 text-nexus-accent" />
                <h3 className="text-sm font-bold text-nexus-text font-mono uppercase">Data Bridge</h3>
              </div>
              <p className="text-xs text-nexus-muted mb-4">
                Sync React Dashboard with Python/Streamlit backend. Import/Export JSON data.
              </p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={onExport}
                className="w-full flex items-center justify-center px-4 py-2 bg-nexus-dark border border-nexus-border rounded-lg text-xs font-mono text-nexus-text hover:bg-nexus-border hover:text-white transition-colors group"
              >
                <Download className="w-4 h-4 mr-2 group-hover:text-nexus-accent" />
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
                  className="w-full flex items-center justify-center px-4 py-2 bg-nexus-dark border border-nexus-border rounded-lg text-xs font-mono text-nexus-text hover:bg-nexus-border hover:text-white transition-colors group disabled:opacity-50"
                >
                  {isImporting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin text-nexus-warning" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2 group-hover:text-nexus-success" />
                  )}
                  {isImporting ? 'SYNCING...' : 'IMPORT FROM STREAMLIT'}
                </button>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
