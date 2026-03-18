import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storage } from './storage';
import { gdrive } from './google-drive';

// Mock gdrive
vi.mock('./google-drive', () => ({
  gdrive: {
    autoSync: vi.fn(),
    isAuthenticated: vi.fn().mockReturnValue(true),
    exportData: vi.fn(),
  }
}));

describe('Storage Auto-Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('devrait déclencher autoSync lors de la sauvegarde d\'une conversation', async () => {
    const mockConv = {
      id: 'test-sync',
      title: 'Test',
      url: 'http://test.com',
      llm: 'ChatGPT',
      capturedAt: Date.now(),
      messages: []
    };

    storage.saveConversation(mockConv);

    // On attend un court instant car l\'import est dynamique et asynchrone
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(gdrive.autoSync).toHaveBeenCalled();
  });

  it('devrait déclencher autoSync lors de la création d\'un dossier', async () => {
    storage.createFolder('Nouveau Dossier');

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(gdrive.autoSync).toHaveBeenCalled();
  });
});
