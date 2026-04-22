// sync.js - Synchronisation Finale Robuste

async function syncData() {
  try {
    const res = await browser.storage.local.get("conversations");
    const extConversations = res.conversations || [];
    if (extConversations.length === 0) return;

    const currentStorage = localStorage.getItem('agregllm_conversations');
    let webConversations = currentStorage ? JSON.parse(currentStorage) : [];
    let hasChanges = false;

    extConversations.forEach(extConv => {
      const existingIndex = webConversations.findIndex(web => web.url === extConv.url);
      const existing = existingIndex >= 0 ? webConversations[existingIndex] : null;
      
      const newData = {
        id: existing ? existing.id : `ext-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: extConv.title,
        url: extConv.url,
        llm: extConv.llm,
        capturedAt: new Date(extConv.date).getTime(),
        summary: extConv.summary || "",
        messages: extConv.messages || [],
        accountEmail: extConv.accountEmail,
        // On préserve les métadonnées existantes de la Webapp
        tags: existing ? (existing.tags || []) : (extConv.tags || []),
        folderId: existing ? existing.folderId : undefined,
        isFavorite: existing ? existing.isFavorite : false
      };

      // Si la discussion existe déjà, on vérifie si le contenu a changé
      if (existing) {
        // On compare l'objet complet sans les métadonnées spécifiques à la webapp
        const currentData = webConversations[existingIndex];
        const hasStructuralChanges = 
          currentData.title !== newData.title ||
          currentData.summary !== newData.summary ||
          JSON.stringify(currentData.messages) !== JSON.stringify(newData.messages);

        if (hasStructuralChanges) {
          webConversations[existingIndex] = newData;
          hasChanges = true;
        }
      } else {
        // Nouvelle discussion
        webConversations.push(newData);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      localStorage.setItem('agregllm_conversations', JSON.stringify(webConversations));
      window.dispatchEvent(new CustomEvent('agregllm-sync-complete'));
      console.log("AgregLLM Sync: Données synchronisées.");
    }
  } catch (e) {
    console.error("AgregLLM Sync Error", e);
  }
}

// Gestion de la suppression définitive depuis la Webapp
window.addEventListener('agregllm-delete-request', async (event) => {
  const { url } = event.detail;
  try {
    const res = await browser.storage.local.get("conversations");
    let list = res.conversations || [];
    const newList = list.filter(c => c.url !== url);
    if (list.length !== newList.length) {
      await browser.storage.local.set({ conversations: newList });
      console.log("AgregLLM: Supprimé du stockage extension.");
    }
  } catch (e) {
    console.error("AgregLLM: Erreur suppression", e);
  }
});

browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "sync") syncData();
});

// Synchro initiale au chargement de la page
syncData();

// Export pour les tests
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  module.exports = { syncData };
}
