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

  it('peut gérer les dossiers', () => {
    const folder = storage.createFolder('Mon Dossier');
    expect(folder.name).toBe('Mon Dossier');
    
    const folders = storage.getAllFolders();
    expect(folders).toHaveLength(1);
    expect(folders[0].name).toBe('Mon Dossier');

    storage.deleteFolder(folder.id);
    expect(storage.getAllFolders()).toHaveLength(0);
  });

  it('peut déplacer une conversation dans un dossier', () => {
    storage.saveConversation(mockConversation);
    const folder = storage.createFolder('Dossier Test');
    
    storage.moveConversationToFolder(mockConversation.id, folder.id);
    const updated = storage.getConversationById(mockConversation.id);
    expect(updated?.folderId).toBe(folder.id);

    storage.moveConversationToFolder(mockConversation.id, undefined);
    const movedBack = storage.getConversationById(mockConversation.id);
    expect(movedBack?.folderId).toBeUndefined();
  });

  it('peut mettre à jour les tags d\'une conversation', () => {
    storage.saveConversation(mockConversation);
    storage.updateTags(mockConversation.id, ['react', 'ts']);
    
    const updated = storage.getConversationById(mockConversation.id);
    expect(updated?.tags).toContain('react');
    expect(updated?.tags).toContain('ts');
  });

  it('peut mettre à jour un dossier', () => {
    const folder = storage.createFolder('Ancien Nom');
    storage.updateFolder(folder.id, 'Nouveau Nom', '#ff0000');
    
    const folders = storage.getAllFolders();
    expect(folders[0].name).toBe('Nouveau Nom');
    expect(folders[0].color).toBe('#ff0000');
  });

  it('gère les erreurs de parsing JSON', () => {
    localStorage.setItem('agregllm_conversations', 'invalid json');
    const convs = storage.getAllConversations();
    expect(convs).toEqual([]);
  });
});