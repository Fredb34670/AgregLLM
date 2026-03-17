import { describe, it, expect, vi, beforeEach } from 'vitest';

// Simuler browser
global.browser = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn()
    }
  },
  runtime: {
    onMessage: {
      addListener: vi.fn()
    }
  }
};

// Simuler window et CustomEvent
global.window = {
  dispatchEvent: vi.fn(),
  addEventListener: vi.fn()
} as any;
global.CustomEvent = class { constructor(name: string) { (this as any).name = name; } } as any;

// Import de la fonction à tester
const { syncData } = require('./sync.js');

describe('syncData - Persistence and Metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('SHOULD NOT lose folderId when messages are identical but other metadata changes', async () => {
    const url = "http://test-metadata.com";
    
    // 1. Données déjà présentes dans la Webapp
    const existingConv = {
      id: "web-123",
      title: "Old Title",
      url: url,
      llm: "ChatGPT",
      capturedAt: 1000,
      summary: "Old Summary",
      messages: [{ role: "user", content: "hello" }],
      folderId: "folder-important",
      isFavorite: true
    };
    localStorage.setItem('agregllm_conversations', JSON.stringify([existingConv]));

    // 2. Capture extension avec un titre mis à jour mais les mêmes messages
    const extConv = {
      title: "Updated Title",
      url: url,
      llm: "ChatGPT",
      date: new Date().toISOString(),
      summary: "Updated Summary",
      messages: [{ role: "user", content: "hello" }]
    };
    (browser.storage.local.get as any).mockResolvedValue({ conversations: [extConv] });

    // 3. Exécuter la synchronisation
    await syncData();

    // 4. Vérifier les résultats
    const savedData = JSON.parse(localStorage.getItem('agregllm_conversations') || '[]');
    const synced = savedData[0];
    
    expect(synced.title).toBe("Updated Title");
    expect(synced.folderId).toBe("folder-important");
    expect(synced.isFavorite).toBe(true);
  });
});
