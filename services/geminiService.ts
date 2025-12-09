
import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_PERSONAS, AppMode } from "../types";

const apiKey = process.env.API_KEY || '';

let client: GoogleGenAI | null = null;

if (apiKey) {
  client = new GoogleGenAI({ apiKey });
}

export const getClient = () => {
  if (!client && apiKey) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

// Map AppMode to System Instruction
const getSystemInstruction = (mode: AppMode): string => {
  switch (mode) {
    case AppMode.DOJO:
      return SYSTEM_PERSONAS.DOJO;
    case AppMode.ARCHITECT:
      return SYSTEM_PERSONAS.ARCHITECT;
    case AppMode.SCRIBE:
      return SYSTEM_PERSONAS.SCRIBE;
    case AppMode.MIRROR:
      return SYSTEM_PERSONAS.MIRROR;
    case AppMode.NETWORK:
      return SYSTEM_PERSONAS.NETWORK;
    case AppMode.JOURNAL:
      return SYSTEM_PERSONAS.JOURNAL;
    case AppMode.HUNT:
      return SYSTEM_PERSONAS.HUNT;
    case AppMode.PIPELINE:
      return SYSTEM_PERSONAS.PIPELINE;
    case AppMode.RESUME:
      return SYSTEM_PERSONAS.RESUME;
    default:
      return "You are a helpful assistant.";
  }
};

// Map AppMode to Model
const getModelName = (mode: AppMode): string => {
  // Use Pro for complex reasoning (Architect/Mirror/Network/Journal/Resume), Flash for speed (Dojo/Scribe)
  switch (mode) {
    case AppMode.ARCHITECT:
    case AppMode.MIRROR:
    case AppMode.NETWORK:
    case AppMode.JOURNAL:
    case AppMode.RESUME:
    case AppMode.HUNT:
      return 'gemini-3-pro-preview';
    default:
      return 'gemini-2.5-flash';
  }
};

export const createChatSession = (mode: AppMode) => {
  const ai = getClient();
  if (!ai) throw new Error("API Key not found");

  const systemInstruction = getSystemInstruction(mode);
  const modelName = getModelName(mode);

  return ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7, // Balance creativity and precision
    },
  });
};

export const sendMessageStream = async (
  chat: Chat,
  message: string,
  onChunk: (text: string) => void
) => {
  try {
    const result = await chat.sendMessageStream({ message });
    
    for await (const chunk of result) {
       if (chunk.text) {
         onChunk(chunk.text);
       }
    }
  } catch (error) {
    console.error("Error in stream:", error);
    onChunk("\n[SYSTEM ERROR: Connection Interrupted]");
  }
};
