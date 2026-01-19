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

  toggleFavorite: (id: string): void => {
    const all = storage.getAllConversations();
    const index = all.findIndex(c => c.id === id);
    if (index >= 0) {
      all[index].isFavorite = !all[index].isFavorite;
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(all));
    }
  },

  updateTags: (id: string, tags: string[]): void => {
    const all = storage.getAllConversations();
    const index = all.findIndex(c => c.id === id);
    if (index >= 0) {
      all[index].tags = tags;
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(all));
    }
  },

  renameTag: (oldName: string, newName: string): void => {
    if (!newName.trim() || oldName === newName) return;
    const all = storage.getAllConversations();
    let changed = false;
    all.forEach(c => {
      if (c.tags && c.tags.includes(oldName)) {
        c.tags = c.tags.map(t => t === oldName ? newName.trim() : t);
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(all));
    }
  },

  deleteTag: (tagName: string): void => {
    const all = storage.getAllConversations();
    let changed = false;
    all.forEach(c => {
      if (c.tags && c.tags.includes(tagName)) {
        c.tags = c.tags.filter(t => t !== tagName);
        changed = true;
      }
    });
    if (changed) {
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

  createFolder: (name: string, color?: string, parentId?: string): Folder => {
    const folders = storage.getAllFolders();
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      parentId,
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
    
    // Mettre à jour les sous-dossiers pour qu'ils remontent à la racine
    filtered.forEach(f => {
      if (f.parentId === id) {
        f.parentId = undefined;
      }
    });

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
  },

  // --- Export / Import ---
  exportData: (): string => {
    const data = {
      version: 1,
      exportedAt: Date.now(),
      conversations: storage.getAllConversations(),
      folders: storage.getAllFolders()
    };
    return JSON.stringify(data, null, 2);
  },

  importData: (json: string): void => {
    try {
      const data = JSON.parse(json);
      if (!data.conversations || !Array.isArray(data.conversations)) {
        throw new Error("Format invalide : conversations manquantes");
      }
      
      const currentConvs = storage.getAllConversations();
      const currentFolders = storage.getAllFolders();
      
      data.conversations.forEach((newConv: Conversation) => {
        const index = currentConvs.findIndex(c => c.id === newConv.id);
        if (index >= 0) {
          currentConvs[index] = newConv;
        } else {
          currentConvs.push(newConv);
        }
      });
      
      if (data.folders && Array.isArray(data.folders)) {
        data.folders.forEach((newFolder: Folder) => {
           const index = currentFolders.findIndex(f => f.id === newFolder.id);
           if (index >= 0) {
             currentFolders[index] = newFolder;
           } else {
             currentFolders.push(newFolder);
           }
        });
      }
      
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(currentConvs));
      localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(currentFolders));
      
    } catch (e) {
      console.error("Import failed", e);
      throw e;
    }
  }
};