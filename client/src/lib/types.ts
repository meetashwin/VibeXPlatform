// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  preferences?: {
    darkMode: boolean;
    notifications: boolean;
    aiProvider?: "openai" | "ollama" | "none";
    aiModel?: string;
    ollamaEndpoint?: string;
  };
}

// Project related types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  technologies: string[];
  collaborators: User[];
  createdAt: string;
  updatedAt: string;
  activities: Activity[];
}

// Activity related types
export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  projectId?: string;
  projectName?: string;
  userId?: string;
}

// Message related types
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date | string;
}

// Code related types
export interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
  projectId?: string;
}

export interface AiSuggestion {
  id?: string;
  type: 'improvement' | 'warning' | 'error';
  line?: number;
  description: string;
  code?: string;
}

// Documentation related types
export interface Document {
  id: string;
  title: string;
  description: string;
  content?: string;
  category: string;
  isAiGenerated: boolean;
  isUpdated: boolean;
  createdAt: string;
  updatedAt: string;
}
