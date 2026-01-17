import { Conversation } from '../types';

const STORAGE_KEY = 'agregllm_conversations';

export const storage = {
  getAllConversations: (): Conversation[] => {
    const data = localStorage.getItem(STORAGE_KEY);
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
    
    if (index >= 0) {
      all[index] = conversation;
    } else {
      all.push(conversation);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  deleteConversation: (id: string): void => {
    const all = storage.getAllConversations();
    const filtered = all.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  updateTags: (id: string, tags: string[]): void => {
    const all = storage.getAllConversations();
    const index = all.findIndex(c => c.id === id);
    if (index >= 0) {
      all[index].tags = tags;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
  }
};
