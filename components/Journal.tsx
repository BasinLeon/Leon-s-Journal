
import React, { useState, useRef } from 'react';
import { AppMode, JournalEntry } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { Chat } from '@google/genai';
import { Book, Save, Sparkles, Loader2, Plus, Calendar, Hash } from 'lucide-react';

interface JournalProps {
  entries: JournalEntry[];
  onSaveEntry: (entry: JournalEntry) => void;
}

const Journal: React.FC<JournalProps> = ({ entries, onSaveEntry }) => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', tags: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);

  const selectedEntry = entries.find(e => e.id === selectedEntryId);

  const handleNewEntry = () => {
    setSelectedEntryId(null);
    setFormData({ title: '', content: '', tags: '' });
    setIsEditing(true);
  };

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntryId(entry.id);
    setFormData({ 
      title: entry.title, 
      content: entry.content, 
      tags: entry.tags.join(', ') 
    });
    setIsEditing(false);
  };

  const handleSave = () => {
    const newEntry: JournalEntry = {
      id: selectedEntryId || Date.now().toString(),
      date: selectedEntry ? selectedEntry.date : new Date().toISOString().split('T')[0],
      title: formData.title || 'Untitled Log',
      content: formData.content,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      aiAnalysis: selectedEntry?.aiAnalysis // Preserve existing analysis if just editing content
    };
    onSaveEntry(newEntry);
    setSelectedEntryId(newEntry.id);
    setIsEditing(false);
  };

  const handleAnalyze = async () => {
    if (!formData.content) return;
    setIsAnalyzing(true);
    
    // Save current state first if it's new
    if (!selectedEntryId) {
        handleSave();
    }

    try {
      if (!chatSessionRef.current) {
        chatSessionRef.current = createChatSession(AppMode.JOURNAL);
      }

      let analysisText = "";
      await sendMessageStream(chatSessionRef.current, formData.content, (chunk) => {
        analysisText += chunk;
      });

      // Update the entry with analysis
      const updatedEntry: JournalEntry = {
        id: selectedEntryId || Date.now().toString(), // Should exist after handleSave, but safe fallback
        date: selectedEntry?.date || new Date().toISOString().split('T')[0],
        title: formData.title,
        content: formData.content,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        aiAnalysis: analysisText
      };
      onSaveEntry(updatedEntry);
      
    } catch (e) {
      console.error("Analysis failed", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left Panel: Entry List */}
      <div className="w-1/3 min-w-[250px] bg-nexus-panel rounded-xl border border-nexus-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-nexus-border flex justify-between items-center bg-nexus-dark/50">
          <h2 className="text-sm font-bold text-nexus-text font-mono flex items-center">
            <Book className="w-4 h-4 mr-2" />
            CHRONICLE
          </h2>
          <button 
            onClick={handleNewEntry}
            className="p-1.5 bg-nexus-accent text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {entries.length === 0 && (
            <div className="text-center p-8 text-nexus-muted text-xs font-mono">
              NO LOGS FOUND.
              <br/>START THE CHRONICLE.
            </div>
          )}
          {entries.map(entry => (
            <div 
              key={entry.id}
              onClick={() => handleSelectEntry(entry)}
              className={`p-3 rounded-lg cursor-pointer border transition-all ${
                selectedEntryId === entry.id 
                  ? 'bg-nexus-accent/10 border-nexus-accent text-nexus-text' 
                  : 'bg-nexus-dark border-transparent hover:bg-nexus-dark/80 text-nexus-muted hover:text-nexus-text'
              }`}
            >
              <div className="font-bold text-sm truncate">{entry.title}</div>
              <div className="flex items-center text-[10px] mt-1 opacity-70 font-mono">
                <Calendar className="w-3 h-3 mr-1" />
                {entry.date}
                {entry.aiAnalysis && <Sparkles className="w-3 h-3 ml-auto text-nexus-warning" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Editor/Viewer */}
      <div className="flex-1 bg-nexus-panel rounded-xl border border-nexus-border flex flex-col overflow-hidden">
        {(isEditing || selectedEntryId) ? (
          <>
            {/* Toolbar */}
            <div className="p-4 border-b border-nexus-border bg-nexus-dark/50 flex justify-between items-center">
               <div className="flex-1 mr-4">
                 {isEditing ? (
                   <input 
                     value={formData.title}
                     onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                     placeholder="Entry Title..."
                     className="w-full bg-transparent text-lg font-bold text-nexus-text focus:outline-none placeholder-nexus-muted/50"
                   />
                 ) : (
                   <h2 className="text-lg font-bold text-nexus-text">{selectedEntry?.title}</h2>
                 )}
               </div>
               <div className="flex items-center space-x-2">
                 {isEditing ? (
                   <button 
                     onClick={handleSave}
                     className="flex items-center px-3 py-1.5 bg-nexus-success/20 text-nexus-success border border-nexus-success/50 rounded text-xs font-bold hover:bg-nexus-success/30"
                   >
                     <Save className="w-3 h-3 mr-2" />
                     SAVE LOG
                   </button>
                 ) : (
                   <button 
                     onClick={() => { setIsEditing(true); }}
                     className="flex items-center px-3 py-1.5 bg-nexus-dark text-nexus-muted border border-nexus-border rounded text-xs font-bold hover:text-nexus-text"
                   >
                     EDIT
                   </button>
                 )}
                 
                 <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!isEditing && !selectedEntry?.content)}
                    className="flex items-center px-3 py-1.5 bg-purple-500/20 text-purple-400 border border-purple-500/50 rounded text-xs font-bold hover:bg-purple-500/30 disabled:opacity-50"
                 >
                    {isAnalyzing ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
                    SYNTHESIZE
                 </button>
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor */}
                <div className={`flex-1 flex flex-col p-6 ${selectedEntry?.aiAnalysis && !isEditing ? 'w-1/2 border-r border-nexus-border' : 'w-full'}`}>
                    {isEditing ? (
                        <>
                            <textarea 
                                value={formData.content}
                                onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
                                placeholder="Log your war room notes, strategy ideas, or raw thoughts..."
                                className="flex-1 bg-transparent resize-none focus:outline-none text-nexus-text font-mono text-sm leading-relaxed placeholder-nexus-muted/30"
                            />
                            <div className="mt-4 pt-4 border-t border-nexus-border">
                                <div className="flex items-center">
                                    <Hash className="w-4 h-4 text-nexus-muted mr-2" />
                                    <input 
                                        value={formData.tags}
                                        onChange={(e) => setFormData(prev => ({...prev, tags: e.target.value}))}
                                        placeholder="Tags (comma separated)..."
                                        className="flex-1 bg-transparent text-xs text-nexus-text focus:outline-none"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none font-mono text-nexus-text whitespace-pre-wrap leading-relaxed overflow-y-auto">
                            {selectedEntry?.content}
                             <div className="mt-8 flex flex-wrap gap-2">
                                {selectedEntry?.tags.map((tag, i) => (
                                    <span key={i} className="px-2 py-1 bg-nexus-dark rounded text-[10px] text-nexus-muted border border-nexus-border">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Analysis Panel (Only visible if analysis exists and not full-screen editing) */}
                {selectedEntry?.aiAnalysis && !isEditing && (
                    <div className="w-1/2 bg-nexus-dark/30 p-6 overflow-y-auto border-l border-nexus-border">
                        <div className="flex items-center mb-4 text-purple-400">
                            <Sparkles className="w-4 h-4 mr-2" />
                            <h3 className="text-sm font-bold font-mono">STRATEGIC SYNTHESIS</h3>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none font-sans text-gray-300">
                            <div className="whitespace-pre-wrap">
                                {selectedEntry.aiAnalysis}
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-nexus-muted opacity-50">
            <Book className="w-16 h-16 mb-4 opacity-50" />
            <p className="font-mono text-sm">SELECT AN ENTRY OR START A NEW LOG</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
