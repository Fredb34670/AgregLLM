import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from './storage';
import { Conversation } from '../types';

const mockConversation: Conversation = {
  id: '1',
  title: 'Test Conversation',
  url: 'https://chatgpt.com/c/1',
  llm: 'ChatGPT',
  capturedAt: Date.now(),
  messages: [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi there!' }
  ]
};

describe('Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('peut ajouter et récupérer une conversation', () => {
    storage.saveConversation(mockConversation);
    const all = storage.getAllConversations();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('1');
    expect(all[0].title).toBe('Test Conversation');
  });

  it('peut supprimer une conversation', () => {
    storage.saveConversation(mockConversation);
    storage.deleteConversation('1');
    const all = storage.getAllConversations();
    expect(all).toHaveLength(0);
  });

  it('peut récupérer une conversation par son ID', () => {
    storage.saveConversation(mockConversation);
    const conv = storage.getConversationById('1');
    expect(conv).toEqual(mockConversation);
  });
});
