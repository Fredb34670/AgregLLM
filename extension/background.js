// background.js - Version robuste

browser.contextMenus.create({
  id: "save-to-agregllm",
  title: "Sauvegarder dans AgregLLM",
  contexts: ["all"]
}, () => {
  if (browser.runtime.lastError) console.log("Menu OK");
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-agregllm") {
    try {
      const response = await browser.tabs.sendMessage(tab.id, { action: "capture" });
      if (response && response.data) {
        await saveConversation(response.data);
      }
    } catch (e) {
      console.error("Background Context Menu Error:", e);
    }
  }
});

// Gestionnaire de messages (venant de la popup ou content script)
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "save_conversation" && message.data) {
        saveConversation(message.data)
            .then(() => sendResponse({ success: true }))
            .catch((e) => sendResponse({ success: false, error: e.message }));
        return true; // Indique une réponse asynchrone
    }
});

// Fonction utilitaire de sauvegarde centralisée
async function saveConversation(data) {
    try {
        const res = await browser.storage.local.get("conversations");
        let list = res.conversations || [];
        
        // Mise à jour si existe déjà (basé sur l'URL), sinon ajout
        const existingIndex = list.findIndex(c => c.url === data.url);
        if (existingIndex >= 0) {
            // On préserve les tags et le dossier si existent
            data.tags = list[existingIndex].tags; 
            data.folderId = list[existingIndex].folderId;
            // On peut aussi préserver l'ID s'il est utilisé comme clé stable
            if (list[existingIndex].id) data.id = list[existingIndex].id;
            
            list[existingIndex] = data;
        } else {
            // Nouvel ID pour la nouvelle conversation
            if (!data.id) data.id = crypto.randomUUID();
            list.push(data);
        }
        
        await browser.storage.local.set({ conversations: list });
        
        // Notification Webapp
        const tabs = await browser.tabs.query({ url: ["*://localhost/*", "*://127.0.0.1/*"] });
        tabs.forEach(t => browser.tabs.sendMessage(t.id, { action: "sync" }).catch(()=>{}));
        
        return true;
    } catch (e) {
        console.error("Save Error:", e);
        throw e;
    }
}