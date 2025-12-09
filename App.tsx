
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import NetworkCRM from './components/NetworkCRM';
import Journal from './components/Journal';
import { AppMode, NetworkContact, Deal, InterviewSession, JournalEntry } from './types';
import { exportToStreamlit, importFromStreamlit, NexusExport } from './services/dataBridge';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentMode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [isImporting, setIsImporting] = useState(false);
  
  // Lifted state for Data Bridge Sync
  const [contacts, setContacts] = useState<NetworkContact[]>([
    { id: '1', name: 'John Smith', role: 'VP Sales', company: 'Tebra', date: '2024-12-08', stage: 'Hot', lastTopic: 'AI SDRs' },
    { id: '2', name: 'Sarah Chen', role: 'Head of GTM', company: 'Adobe', date: '2024-12-07', stage: 'Warm', lastTopic: 'Partner Ecosystems' },
    { id: '3', name: 'Mike Ross', role: 'Founder', company: 'Stealth', date: '2024-12-06', stage: 'Cold', lastTopic: 'Zero Trust Security' },
  ]);

  const [deals, setDeals] = useState<Deal[]>([
     { id: '1', company: 'Tebra', role: 'Director, GTM', stage: 'Interview', value: '$250k', contacts: ['John Smith'], next_step: 'Panel Prep' },
     { id: '2', company: 'Adobe', role: 'Sr Mgr, Partners', stage: 'Offer', value: '$220k', contacts: ['Sarah Chen'], next_step: 'Negotiation' },
     { id: '3', company: 'Fudo', role: 'Alumni', stage: 'Closed Won', value: 'N/A', contacts: [], next_step: 'N/A' }
  ]);
  
  const [interviewLog, setInterviewLog] = useState<InterviewSession[]>([]);

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    { 
        id: '1', 
        date: '2024-12-08', 
        title: 'V5.0 Deployment Strategy', 
        content: 'Shifted mindset from "Candidate" to "Ecosystem Owner". The V5 flywheel is live. Need to test the Content Factory with the Tebra conversation.', 
        tags: ['Strategy', 'Identity'], 
        aiAnalysis: 'The shift to Ecosystem Owner is the leverage point. \n\n**The Leverage**: Stop selling yourself. Sell the System (Basin::Nexus). \n\n**The Prophecy**: Document the build. "How I built an AI GTM OS to get hired" is the viral hook.'
    }
  ]);

  const handleAddContact = (contact: NetworkContact) => {
    setContacts(prev => [contact, ...prev]);
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

  const handleExport = () => {
    exportToStreamlit({
      contacts,
      deals,
      interview_log: interviewLog,
      // Note: DataBridge types need update for full Journal support in future, 
      // but for now we keep it compatible with V5.0 spec
    });
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    try {
      const data = await importFromStreamlit(file);
      // Merge strategy: Overwrite or Append? 
      // For simplicity in V5.0, we will replace state with imported data to ensure sync.
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
    <div className="min-h-screen bg-nexus-dark text-nexus-text font-sans selection:bg-nexus-accent selection:text-white">
      <Sidebar currentMode={currentMode} setMode={setMode} />
      
      <main className="ml-20 md:ml-64 p-4 md:p-8 min-h-screen transition-all duration-300">
        <header className="mb-8 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    {currentMode === AppMode.DASHBOARD ? 'EXECUTIVE COMMAND' : currentMode.replace('_', ' ')}
                </h1>
                <p className="text-nexus-muted text-sm font-mono mt-1">
                    {currentMode === AppMode.DASHBOARD ? 'System Overview & Metrics' : 'Active Neural Interface'}
                </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
                <div className="px-3 py-1 rounded-full bg-nexus-panel border border-nexus-border flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    <span className="text-xs font-mono text-nexus-muted">API CONNECTED</span>
                </div>
                <div className="text-xs font-mono text-nexus-muted opacity-50">
                    {new Date().toLocaleDateString()} // {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        </header>

        <div className="fade-in-up">
            {renderContent()}
        </div>
      </main>
      
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
        .animate-blink {
            animation: blink 1s infinite;
        }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default App;
