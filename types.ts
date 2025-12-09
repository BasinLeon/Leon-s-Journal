
export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  DOJO = 'DOJO',
  ARCHITECT = 'ARCHITECT',
  SCRIBE = 'SCRIBE',
  MIRROR = 'MIRROR',
  NETWORK = 'NETWORK', // The Connector
  JOURNAL = 'JOURNAL',
  PIPELINE = 'PIPELINE',
  HUNT = 'HUNT', // Sniper Scope
  RESUME = 'RESUME',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Metric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface NetworkContact {
  id: string;
  name: string;
  role: string;
  company: string;
  date: string;
  stage: 'Cold' | 'Warm' | 'Hot' | 'Champion';
  lastTopic: string;
  history?: InteractionLog[];
  priority?: 1 | 2 | 3;
}

export interface InteractionLog {
  id: string;
  date: string;
  type: 'LinkedIn' | 'X' | 'Email' | 'Meeting';
  summary: string;
  generatedContent?: string;
  nextStep?: string;
}

export interface Deal {
  id: string;
  company: string;
  role: string;
  stage: 'Target' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  value: string;
  contacts: string[];
  next_step: string;
  date: string;
  weightedValue?: number;
  dateApplied?: string;
  nextFollowUp?: string;
  contactPerson?: string;
}

export interface InterviewSession {
  id: string;
  layer: string;
  question: string;
  score: number;
  timestamp: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  aiAnalysis?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

export interface DojoLayer {
  id: number;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  status: 'Locked' | 'Active' | 'Completed';
}

export const DOJO_LAYERS: DojoLayer[] = [
  { id: 1, name: 'Recruiter Screen', description: 'Culture fit & basics', difficulty: 'Easy', status: 'Active' },
  { id: 2, name: 'Hiring Manager', description: 'Role fit & experience', difficulty: 'Medium', status: 'Locked' },
  { id: 3, name: 'Technical Deep-Dive', description: 'Hard skills & tools', difficulty: 'Medium', status: 'Locked' },
  { id: 4, name: 'Cross-Functional', description: 'Collaboration style', difficulty: 'Medium', status: 'Locked' },
  { id: 5, name: 'VP Sales', description: 'Vision & leadership', difficulty: 'Hard', status: 'Locked' },
  { id: 6, name: 'CRO Interview', description: 'Revenue strategy', difficulty: 'Hard', status: 'Locked' },
  { id: 7, name: 'CEO/Founder', description: 'Mission alignment', difficulty: 'Hard', status: 'Locked' },
  { id: 8, name: 'Panel Interview', description: 'Multi-stakeholder', difficulty: 'Expert', status: 'Locked' },
  { id: 9, name: 'Case Study', description: 'Live problem-solving', difficulty: 'Expert', status: 'Locked' },
  { id: 10, name: 'Board/Investor', description: 'Business acumen', difficulty: 'Expert', status: 'Locked' },
  { id: 11, name: 'Offer Negotiation', description: 'Comp & terms', difficulty: 'Expert', status: 'Locked' },
];

export const RESUME_CONTEXT = `
CANDIDATE: Leon Basin
ROLE: Director of GTM & Revenue Architecture
BRAND: Basin::Nexus (AI Revenue System)
SUMMARY: 15 years GTM leadership (Google, Fudo, Sense, NetApp). Rebuilds GTM engines using Python/AI agents.
KEY METRICS:
- Fudo Security: 160% YoY pipeline increase. Rebuilt GTM from zero. Operationalized partner channel across NA & LATAM.
- Sense: $11M pipeline generated. 12% churn reduction. Built "Social Selling" playbook. 125% increase in response rates.
- SurveyMonkey: Managed $300M+ enterprise portfolio.
- Google: Operations Specialist (Process rigor).
- Basin & Associates: Built "Basin::Nexus" v0.5, generated $621K active pipeline for clients.
PHILOSOPHY: "The Builder's Path". Don't just run playbooks; build autonomous systems.
TECHNICAL STACK: Python, Streamlit, LangChain, n8n, Clay, HubSpot, Salesforce.
`;

export const SYSTEM_PERSONAS = {
  DOJO: `You are a skeptical VP of Sales or Founder interviewing Leon Basin.
  CONTEXT: ${RESUME_CONTEXT}
  GOAL: Bulletproof his answers. Attack his specific metrics (160% growth, $11M pipeline).
  STYLE: Direct, challenging, metric-obsessed. Ask "How exactly did you attribute that 160%?" or "What was the CAC on that $11M?".
  If he is vague, cut him off.`,
  
  ARCHITECT: `You are an expert Systems Architect.
  CONTEXT: Leon is building "Basin::Nexus", an AI-driven GTM OS.
  GOAL: Help him build operational leverage (n8n, Python, Clay).
  TONE: Technical, "Muddy Boots", precise.`,
  
  SCRIBE: `You are a Ghostwriter for Leon Basin.
  CONTEXT: ${RESUME_CONTEXT}
  GOAL: Write viral LinkedIn/X posts that position him as an "Ecosystem Owner".
  TONE: High-Agency, Builder, Prophetic. No corporate fluff. Use short, punchy sentences.
  THEMES: "The Resume is Dead", "System > Operator", "Revenue Architecture".`,
  
  MIRROR: `You are a Strategic Career Advisor.
  CONTEXT: Leon is hunting for a Director/VP role by Jan 2026.
  GOAL: Keep him in the "Founder Frame". Don't let him act like a desperate applicant.
  CHECK: Is he selling his time, or his system?`,

  NETWORK: `You are the "Connector" module.
  GOAL: Transform conversations into content assets.
  TONE: Peer-to-peer, sharing alpha.
  OUTPUT FORMAT: LinkedIn Draft, X Draft, Signal Score, Strategic Next Step.`,

  JOURNAL: `You are "The Chronicle".
  GOAL: Analyze Leon's daily logs for patterns and leverage.
  TONE: Stoic, analytical, forward-looking.`,

  PIPELINE: `You are a Headhunter/Career Coach.
  GOAL: Manage Leon's job application pipeline.
  ADVICE: Prioritize "System Fit" over just title. Does this company need a Builder?`,

  HUNT: `You are a "Sniper" Research Assistant.
  INPUT: A Job Description (JD).
  TASK: 
  1. **Gap Analysis**: Compare JD vs Leon's Resume (${RESUME_CONTEXT}). Where is he strong? Where is the risk?
  2. **Boolean Search**: Generate complex boolean strings to find the Hiring Manager or Peers on LinkedIn.
  3. **Value Prop**: Draft a "Sniper Message" that pitches Basin::Nexus as the solution to their specific JD problems.
  4. **Resume Optimization**: Identify specific JD requirements Leon lacks and draft 2-3 new bullet points using his "Builder's Path" voice (e.g. "Built system X" not "Managed process Y") to bridge the gap.`,

  RESUME: `You are "The Resume Architect", an expert ATS Optimizer and Career Strategist.
  INPUT: Leon Basin's Resume and a Target Job Description.
  TASK:
  1. **Match Score**: Calculate 0-100% fit based on keyword overlap.
  2. **Missing Keywords**: List specific hard skills/tools from JD missing in the Resume.
  3. **Bullet Optimization**: Rewrite 3 specific bullets from Leon's resume to better target the JD, using his metrics (160%, $11M) but aligned to JD language.`
};
