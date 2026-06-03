export type ComponentCategory = 'routing' | 'compute' | 'storage' | 'realtime' | 'queue' | 'security' | 'monitoring';

export interface ArchitectureNode {
  id: string;
  label: string;
  category: ComponentCategory;
  description: string;
  details: string;
  codeSnippet?: string;
  codeLanguage?: string;
  interfaces?: string[];
  connections: string[];
}

export interface SimulationLog {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'redis' | 'bullmq' | 'postgres' | 's3' | 'websocket' | 'security';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
