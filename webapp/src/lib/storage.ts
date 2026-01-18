import { Conversation, Folder } from '../types';
import { generateTags, findBestFolder } from './automation';

const STORAGE_KEY_CONVERSATIONS = 'agregllm_conversations';
const STORAGE_KEY_FOLDERS = 'agregllm_folders';

export const storage = {
  // --- Conversations ---
  getAllConversations: (): Conversation[] => {
    const data = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse conversations from storage', e);
      return [];
    }
  },

  getConversationById: (id: string): Conversation | undefined => {
    const all = storage.getAllConversations();
    return all.find(c => c.id === id);
  },

  saveConversation: (conversation: Conversation): void => {
    const all = storage.getAllConversations();
    const index = all.findIndex(c => c.id === conversation.id);
    
    // Logique d'automatisation (si nouvelle conversation ou champs manquants)
    const contentText = (conversation.title + " " + (conversation.summary || "")).trim();
    
    // 1. Auto-tagging
    if (!conversation.tags || conversation.tags.length === 0) {
      conversation.tags = generateTags(contentText);
    }

    // 2. Auto-classification (si pas déjà dans un dossier)
    if (!conversation.folderId) {
      const folders = storage.getAllFolders();
      const bestFolderId = findBestFolder(contentText, folders);
      if (bestFolderId) {
        conversation.folderId = bestFolderId;
      }
    }

    if (index >= 0) {
      all[index] = conversation;
    } else {
      all.push(conversation);
    }
    
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(all));
  },

  deleteConversation: (id: string): void => {
    const all = storage.getAllConversations();
    const filtered = all.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(filtered));
  },

  updateTags: (id: string, tags: string[]): void => {
    const all = storage.getAllConversations();
    const index = all.findIndex(c => c.id === id);
    if (index >= 0) {
      all[index].tags = tags;
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(all));
    }
  },

  moveConversationToFolder: (conversationId: string, folderId: string | undefined): void => {
    const all = storage.getAllConversations();
    const index = all.findIndex(c => c.id === conversationId);
    if (index >= 0) {
      all[index].folderId = folderId;
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(all));
    }
  },

  // --- Folders ---
  getAllFolders: (): Folder[] => {
    const data = localStorage.getItem(STORAGE_KEY_FOLDERS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse folders from storage', e);
      return [];
    }
  },

  createFolder: (name: string, color?: string): Folder => {
    const folders = storage.getAllFolders();
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      color,
      createdAt: Date.now()
    };
    folders.push(newFolder);
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
    return newFolder;
  },

  deleteFolder: (id: string): void => {
    const folders = storage.getAllFolders();
    const filtered = folders.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(filtered));

    // Déplacer les conversations de ce dossier vers la racine
    const conversations = storage.getAllConversations();
    let convChanged = false;
    conversations.forEach(c => {
      if (c.folderId === id) {
        c.folderId = undefined;
        convChanged = true;
      }
    });
    if (convChanged) {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
    }
  },

  updateFolder: (id: string, name: string, color?: string): void => {
    const folders = storage.getAllFolders();
    const index = folders.findIndex(f => f.id === id);
    if (index >= 0) {
      folders[index].name = name;
      if (color !== undefined) folders[index].color = color;
      localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
    }
  }
};
