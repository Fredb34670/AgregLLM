export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string; // ID du dossier parent (pour sous-dossiers)
  color?: string; // Code couleur hex ou nom de classe CSS
  createdAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  url: string;
  llm: string;
  capturedAt: number;
  date?: string; // Date réelle de la discussion (ISO)
  messages: Message[];
  summary?: string;
  tags?: string[];
  folderId?: string; // ID du dossier parent (optionnel, si à la racine = undefined)
}
