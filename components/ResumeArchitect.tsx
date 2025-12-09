
import React, { useState, useRef } from 'react';
import { AppMode, RESUME_CONTEXT } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { Chat } from '@google/genai';
import { FileText, Search, Loader2, CheckCircle, AlertTriangle, ArrowRight, Save, Target } from 'lucide-react';

const ResumeArchitect: React.FC = () => {
  const [resumeText, setResumeText] = useState(RESUME_CONTEXT.trim());
  const [jdText, setJdText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);

  const handleAnalyze = async () => {
    if (!jdText.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysis('');

    try {
      if (!chatSessionRef.current) {
        chatSessionRef.current = createChatSession(AppMode.RESUME);
      }

      const prompt = `
        TARGET JOB DESCRIPTION:
        ${jdText}

        CURRENT RESUME CONTEXT:
        ${resumeText}

        Perform a gap analysis and rewrite suggestions.
      `;

      await sendMessageStream(chatSessionRef.current, prompt, (chunk) => {
        setAnalysis(prev => prev + chunk);
      });
    } catch (e) {
      setAnalysis("Error: Analysis failed. Check API connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left Column: Resume & JD Input */}
      <div className="w-1/2 flex flex-col gap-4">
        <div className="flex-1 bg-nexus-panel rounded-xl border border-nexus-border p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-nexus-text font-mono flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-nexus-accent" />
                    RESUME CONTEXT
                </h3>
            </div>
            <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="flex-1 bg-nexus-dark border border-nexus-border rounded p-3 text-xs font-mono text-nexus-text focus:outline-none focus:border-nexus-accent resize-none"
                placeholder="Paste your resume here..."
            />
        </div>
        
        <div className="flex-1 bg-nexus-panel rounded-xl border border-nexus-border p-4 flex flex-col">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-nexus-text font-mono flex items-center">
                    <Target className="w-4 h-4 mr-2 text-nexus-danger" />
                    TARGET JD
                </h3>
            </div>
            <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="flex-1 bg-nexus-dark border border-nexus-border rounded p-3 text-xs font-mono text-nexus-text focus:outline-none focus:border-nexus-danger resize-none mb-4"
                placeholder="Paste Job Description here..."
            />
             <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !jdText.trim()}
                className="w-full py-2 bg-nexus-accent hover:bg-blue-600 text-white font-bold rounded text-sm transition-all flex items-center justify-center disabled:opacity-50"
            >
                {isAnalyzing ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ANALYZING FIT...
                </>
                ) : (
                <>
                    <Search className="w-4 h-4 mr-2" />
                    RUN GAP ANALYSIS
                </>
                )}
            </button>
        </div>
      </div>

      {/* Right Column: AI Analysis */}
      <div className="w-1/2 bg-nexus-panel rounded-xl border border-nexus-border p-6 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-nexus-border">
          <h3 className="font-bold text-nexus-text font-mono flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-nexus-success" />
            OPTIMIZATION REPORT
          </h3>
          {analysis && !isAnalyzing && (
              <button className="text-xs flex items-center bg-nexus-dark border border-nexus-border px-3 py-1 rounded hover:text-nexus-accent transition-colors">
                  <Save className="w-3 h-3 mr-1" />
                  SAVE AS VERSION
              </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto bg-nexus-dark rounded-lg p-4 border border-nexus-border">
            {analysis ? (
            <div className="prose prose-invert prose-sm max-w-none font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                {analysis}
            </div>
            ) : (
            <div className="h-full flex flex-col items-center justify-center text-nexus-muted opacity-50 text-center p-8">
                <AlertTriangle className="w-12 h-12 mb-4" />
                <p className="font-mono text-sm">NO ANALYSIS DATA</p>
                <p className="text-xs mt-2">Input JD and Run Analysis to see Match Score and Suggestions.</p>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResumeArchitect;
