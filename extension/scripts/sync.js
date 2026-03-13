// sync.js - Synchronisation Finale Robuste

async function syncData() {
  console.log("AgregLLM Debug: syncData starting...");
  try {
    const api = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : null);
    if (!api || !api.storage || !api.storage.local) {
      console.error("AgregLLM Debug: extension storage API not found");
      return;
    }

    const res = await api.storage.local.get("conversations");
    const extConversations = res.conversations || [];
    console.log("AgregLLM Debug: found discussions in extension storage:", extConversations.length);
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
        capturedAt: existingIndex >= 0 && webConversations[existingIndex].capturedAt ? webConversations[existingIndex].capturedAt : new Date(extConv.date).getTime(),
        summary: extConv.summary || "",
        messages: extConv.messages || [],
        tags: existingIndex >= 0 ? (webConversations[existingIndex].tags || []) : [],
        folderId: existingIndex >= 0 ? webConversations[existingIndex].folderId : undefined,
        isFavorite: existingIndex >= 0 ? webConversations[existingIndex].isFavorite : false
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

    // Synchronisation des tokens d'authentification GDrive
    const isExtensionPage = window.location.protocol.includes('-extension:');
    
    if (isExtensionPage) {
        // Mode Extension Dashboard : On récupère le token depuis le stockage extension
        const auth = await api.storage.local.get(["gdrive_token", "gdrive_expiry", "gdrive_user"]);
        if (auth.gdrive_token && auth.gdrive_token !== localStorage.getItem('agregllm_gdrive_token')) {
            console.log("AgregLLM Sync: Récupération du token depuis l'extension");
            localStorage.setItem('agregllm_gdrive_token', auth.gdrive_token);
            localStorage.setItem('agregllm_gdrive_expiry', auth.gdrive_expiry);
            if (auth.gdrive_user) localStorage.setItem('agregllm_gdrive_user', auth.gdrive_user);
            window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
        }
    } else {
        // Mode Content Script (sur le site web) : On envoie le token vers le stockage extension
        const token = localStorage.getItem('agregllm_gdrive_token');
        if (token) {
            const expiry = localStorage.getItem('agregllm_gdrive_expiry');
            const user = localStorage.getItem('agregllm_gdrive_user');
            await api.storage.local.set({ 
                gdrive_token: token,
                gdrive_expiry: expiry,
                gdrive_user: user
            });
        }
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
