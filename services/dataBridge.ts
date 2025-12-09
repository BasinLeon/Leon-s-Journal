
import { NetworkContact, Deal, InterviewSession } from '../types';

export interface NexusExport {
  version: string;
  exported_at: string;
  source: string;
  contacts: NetworkContact[];
  deals: Deal[];
  outreach_log: any[]; // keeping as any for now
  interview_log: InterviewSession[];
  resume_text: string;
  jd_text: string;
}

// Export for Streamlit import
export const exportToStreamlit = (data: Partial<NexusExport>) => {
  const exportData: NexusExport = {
    version: "5.0",
    exported_at: new Date().toISOString(),
    source: "gemini_react",
    contacts: data.contacts || [],
    deals: data.deals || [],
    outreach_log: data.outreach_log || [],
    interview_log: data.interview_log || [],
    resume_text: data.resume_text || "",
    jd_text: data.jd_text || ""
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nexus_export.json';
  a.click();
};

// Import from Streamlit
export const importFromStreamlit = (file: File): Promise<NexusExport> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};
