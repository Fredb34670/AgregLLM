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

// Simuler localStorage
let localDataStore = {};
global.localStorage = {
  getItem: vi.fn((key) => localDataStore[key] || null),
  setItem: vi.fn((key, value) => { localDataStore[key] = value; }),
  clear: () => { localDataStore = {}; }
};

// Simuler window et CustomEvent
global.window = {
  dispatchEvent: vi.fn(),
  addEventListener: vi.fn()
};
global.CustomEvent = class { constructor(name) { this.name = name; } };

// Import de la fonction à tester (après avoir mocké l'environnement)
// On utilise require car l'export dans sync.js est au format CommonJS pour les tests
const { syncData } = require('./sync.js');

describe('syncData - Persistence Bug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('SHOULD NOT lose folderId and isFavorite status during sync', async () => {
    const url = "http://test-persist.com";
    
    // 1. Données déjà présentes dans la Webapp avec un dossier et favori
    const existingConv = {
      id: "web-123",
      title: "Old Title",
      url: url,
      llm: "ChatGPT",
      capturedAt: 1000,
      summary: "Old Summary",
      messages: [{ role: "user", content: "hello" }],
      folderId: "folder-456", // <--- Doit être préservé
      isFavorite: true        // <--- Doit être préservé
    };
    localStorage.setItem('agregllm_conversations', JSON.stringify([existingConv]));

    // 2. Nouvelle capture de l'extension pour la même URL (mais messages différents)
    const extConv = {
      title: "New Title",
      url: url,
      llm: "ChatGPT",
      date: new Date().toISOString(),
      summary: "New Summary",
      messages: [{ role: "user", content: "hello" }, { role: "assistant", content: "hi" }]
    };
    browser.storage.local.get.mockResolvedValue({ conversations: [extConv] });

    // 3. Exécuter la synchronisation
    await syncData();

    // 4. Vérifier les résultats
    const savedData = JSON.parse(localStorage.getItem('agregllm_conversations'));
    expect(savedData.length).toBe(1);
    
    const synced = savedData[0];
    expect(synced.url).toBe(url);
    expect(synced.messages.length).toBe(2); // Le contenu a bien été mis à jour
    
    // VÉRIFICATION DU BUG : Ces champs ne devraient pas être perdus
    expect(synced.folderId).toBe("folder-456");
    expect(synced.isFavorite).toBe(true);
  });
});
