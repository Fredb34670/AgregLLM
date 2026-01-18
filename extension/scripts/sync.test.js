// Fichier de test pour le script de synchronisation

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

async function testSyncData() {
  console.log("Running tests for syncData...");

  // Mock browser.storage.local
  const mockExtConversations = [
    { title: "Test Ext", url: "http://test.com", llm: "ChatGPT", date: new Date().toISOString() }
  ];
  
  global.browser = {
    storage: {
      local: {
        get: vi.fn().mockResolvedValue({ conversations: mockExtConversations }),
        set: vi.fn().mockResolvedValue(undefined)
      }
    },
    runtime: {
      onMessage: {
        addListener: vi.fn()
      }
    }
  };

  // Mock localStorage
  let localData = null;
  global.localStorage = {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn((key, val) => { localData = JSON.parse(val); })
  };

  // Mock CustomEvent et dispatchEvent
  global.CustomEvent = class { constructor(name) { this.name = name; } };
  global.window = {
    dispatchEvent: vi.fn(),
    addEventListener: vi.fn(),
    localStorage: global.localStorage
  };

  // Exécution de syncData (il faudrait l'exporter ou l'extraire pour le tester vraiment proprement)
  // Ici on simule ce qu'il devrait faire
  await syncData();

  assert(localData !== null, "Les données devraient être sauvegardées dans localStorage.");
  assert(localData.length === 1, "Il devrait y avoir une conversation synchronisée.");
  assert(localData[0].title === "Test Ext", "Le titre synchronisé est incorrect.");

  console.log("  PASS: syncData a synchronisé les données correctement.");
}

console.log("Ce fichier de test est descriptif (mocké pour illustrer la logique).");
