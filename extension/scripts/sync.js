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
      
      const newData = {
        id: existingIndex >= 0 ? webConversations[existingIndex].id : `ext-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: extConv.title,
        url: extConv.url,
        llm: extConv.llm,
        capturedAt: new Date(extConv.date).getTime(),
        summary: extConv.summary || "",
        messages: extConv.messages || [],
        tags: existingIndex >= 0 ? (webConversations[existingIndex].tags || []) : []
      };

      // Si la discussion existe déjà, on vérifie si le contenu a changé
      if (existingIndex >= 0) {
        if (JSON.stringify(webConversations[existingIndex].messages) !== JSON.stringify(newData.messages)) {
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
