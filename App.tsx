import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import NetworkCRM from './components/NetworkCRM';
import Journal from './components/Journal';
import Dojo from './components/Dojo';
import Pipeline from './components/Pipeline';
import Hunt from './components/Hunt';
import ResumeArchitect from './components/ResumeArchitect';
import { AppMode, NetworkContact, Deal, InterviewSession, JournalEntry } from './types';
import { exportToStreamlit, importFromStreamlit, NexusExport } from './services/dataBridge';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentMode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [isImporting, setIsImporting] = useState(false);
  
  // PRE-LOADED DATA FROM "WAR ROOM" DUMP
  const [contacts, setContacts] = useState<NetworkContact[]>([
    { id: '101', name: 'Samuel Burns', role: 'Hiring Manager', company: 'DepthFirst', date: '2025-11-19', stage: 'Hot', lastTopic: 'CRO Intro Pending', priority: 1 },
    { id: '102', name: 'Cyrus Akrami', role: 'CRO', company: 'DepthFirst', date: '2025-11-19', stage: 'Cold', lastTopic: 'Intro from Samuel', priority: 1 },
    { id: '103', name: 'Kyu Kim', role: 'Founder', company: 'Spray.io', date: '2025-11-17', stage: 'Hot', lastTopic: 'Micro-contract scope', priority: 2 },
    { id: '104', name: 'Asaph Wutawunashe', role: 'Chairman', company: 'FYM Africa', date: '2025-11-18', stage: 'Hot', lastTopic: 'Partner-track GTM', priority: 1 },
    { id: '105', name: 'Kayleigh', role: 'Recruiter', company: 'Aikido Security', date: '2025-11-15', stage: 'Warm', lastTopic: 'US Account Executive', priority: 1 },
    { id: '106', name: 'Jessica Lokumkiattikul', role: 'Sales Manager', company: 'Assort Health', date: '2025-11-18', stage: 'Warm', lastTopic: 'Inbound Reply', priority: 1 },
    { id: '107', name: 'Whitney Robbins', role: 'VP of Sales', company: 'ROLLER', date: '2025-11-17', stage: 'Warm', lastTopic: 'Early Interest', priority: 2 },
    { id: '108', name: 'Ryan Freeman', role: 'Head of Partnerships', company: 'Deel', date: '2025-12-02', stage: 'Cold', lastTopic: 'Workday Hook', priority: 1 },
    { id: '109', name: 'Adam Estoclet', role: 'Head of Ent. Sales', company: 'Deel', date: '2025-12-02', stage: 'Cold', lastTopic: 'SWAT Team Hook', priority: 1 },
    { id: '110', name: 'Tai Rattigan', role: 'Co-Founder', company: 'Partnership Leaders', date: '2025-12-02', stage: 'Cold', lastTopic: 'Influencer Outreach', priority: 2 },
  ]);

  const [deals, setDeals] = useState<Deal[]>([
     { id: '201', company: 'DepthFirst', role: 'Enterprise AE', stage: 'Interviewing', value: '$250k', contacts: ['Samuel Burns'], next_step: 'CRO Intro', date: '2025-11-19' },
     { id: '202', company: 'Ambient.ai', role: 'Head of RevOps', stage: 'Interviewing', value: '$220k', contacts: ['Nicole Ceranna', 'Noah Barr'], next_step: 'CFO Screen', date: '2025-12-04' },
     { id: '203', company: 'CRS Credit API', role: 'Enterprise AE', stage: 'Interviewing', value: '$200k', contacts: ['Michael Rosenberg'], next_step: 'Panel w/ Tyler', date: '2025-12-05' },
     { id: '204', company: 'Mistral AI', role: 'Account Executive US', stage: 'Applied', value: '$240k', contacts: ['Internal Recruiter'], next_step: 'Wait for Reply', date: '2025-11-18' },
     { id: '205', company: 'Hightouch', role: 'Mid Market AE', stage: 'Applied', value: '$180k', contacts: [], next_step: 'Under Review', date: '2025-11-18' },
     { id: '206', company: 'Aikido Security', role: 'AE US', stage: 'Applied', value: '$190k', contacts: ['Kayleigh'], next_step: 'Referral Check', date: '2025-11-18' },
  ]);
  
  const [interviewLog, setInterviewLog] = useState<InterviewSession[]>([]);

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    { 
        id: '1', 
        date: '2025-12-08', 
        title: 'V5.2 War Room Activation', 
        content: 'System fully integrated. Injected 15+ active leads into the Nexus. The "Builder\'s Path" narrative is starting to resonate with Founders (e.g. Kyu @ Spray.io). \n\nFocus for the week: Convert the DepthFirst CRO intro into a closed deal.', 
        tags: ['Strategy', 'Execution', 'DepthFirst'], 
        aiAnalysis: 'The DepthFirst opportunity is your highest leverage point (70% probability). Prioritize the "AE Pitch Kit" for Cyrus. Do not let the "Consulting" angle distract from the Full-Time goal unless the retainer >$10k/mo.'
    }
  ]);

  const handleAddContact = (contact: NetworkContact) => {
    setContacts(prev => [contact, ...prev]);
  };

  const handleUpdateDeals = (newDeals: Deal[]) => {
    setDeals(newDeals);
  };

  const handleSaveJournalEntry = (entry: JournalEntry) => {
    setJournalEntries(prev => {
        const exists = prev.find(e => e.id === entry.id);
        if (exists) {
            return prev.map(e => e.id === entry.id ? entry : e);
        }
        return [entry, ...prev];
    });
  };

  const handleAddDeal = (deal: Deal) => {
    setDeals(prev => [deal, ...prev]);
  }

  const handleExport = () => {
    exportToStreamlit({
      contacts,
      deals,
      interview_log: interviewLog,
    });
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    try {
      const data = await importFromStreamlit(file);
      if (data.contacts) setContacts(data.contacts);
      if (data.deals) setDeals(data.deals);
      if (data.interview_log) setInterviewLog(data.interview_log);
      alert(`Successfully imported data from ${data.source} (v${data.version})`);
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import data. Check file format.");
    } finally {
      setIsImporting(false);
    }
  };

  const renderContent = () => {
    switch (currentMode) {
      case AppMode.DASHBOARD:
        return (
          <Dashboard 
            activeDealsCount={deals.length}
            onExport={handleExport}
            onImport={handleImport}
            isImporting={isImporting}
          />
        );
      case AppMode.DOJO:
        return <Dojo />;
      case AppMode.PIPELINE:
        return <Pipeline deals={deals} onUpdateDeals={handleUpdateDeals} />;
      case AppMode.HUNT:
        return <Hunt onAddDeal={handleAddDeal} />;
      case AppMode.RESUME:
        return <ResumeArchitect />;
      case AppMode.ARCHITECT:
      case AppMode.SCRIBE:
      case AppMode.MIRROR:
        return <ChatInterface mode={currentMode} />;
      case AppMode.NETWORK:
        return <NetworkCRM contacts={contacts} onAddContact={handleAddContact} />;
      case AppMode.JOURNAL:
        return <Journal entries={journalEntries} onSaveEntry={handleSaveJournalEntry} />;
      default:
        return (
           <Dashboard 
            activeDealsCount={deals.length}
            onExport={handleExport}
            onImport={handleImport}
            isImporting={isImporting}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-nexus-base text-nexus-text font-sans selection:bg-nexus-accent selection:text-white overflow-hidden">
      <Sidebar currentMode={currentMode} setMode={setMode} />
      
      <main className="ml-20 md:ml-64 p-4 md:p-8 h-screen overflow-y-auto transition-all duration-300 relative custom-scrollbar">
        {/* Top Fade Overlay for Scroll */}
        <div className="fixed top-0 left-20 md:left-64 right-0 h-8 bg-gradient-to-b from-nexus-base to-transparent z-10 pointer-events-none"></div>

        <header className="mb-8 flex justify-between items-center relative z-20">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight font-mono">
                    {currentMode === AppMode.DASHBOARD ? 'EXECUTIVE COMMAND' : currentMode.replace('_', ' ')}
                </h1>
                <p className="text-nexus-muted text-xs font-mono mt-1 tracking-wider uppercase">
                    {currentMode === AppMode.DASHBOARD ? 'System Overview & Metrics' : 'Active Neural Interface'}
                </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
                <div className="px-3 py-1 rounded-full bg-nexus-dark border border-nexus-success/30 flex items-center shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <span className="w-1.5 h-1.5 bg-nexus-success rounded-full mr-2 animate-pulse"></span>
                    <span className="text-[10px] font-mono text-nexus-success font-bold">API CONNECTED</span>
                </div>
                <div className="text-[10px] font-mono text-nexus-muted opacity-70 bg-nexus-panel px-2 py-1 rounded border border-nexus-border">
                    Target Date: JAN 2026
                </div>
            </div>
        </header>

        <div className="fade-in-up pb-20">
            {renderContent()}
        </div>
      </main>
      
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
        .text-shadow-glow {
            text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #1e293b;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default App;