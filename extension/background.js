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
        const res = await browser.storage.local.get("conversations");
        let list = res.conversations || [];
        
        // Remplacement forcé pour corriger l'ordre si nécessaire
        list = list.filter(c => c.url !== response.data.url);
        list.push(response.data);
        
        await browser.storage.local.set({ conversations: list });
        
        // Notification Webapp
        const tabs = await browser.tabs.query({ url: ["*://localhost/*", "*://127.0.0.1/*"] });
        tabs.forEach(t => browser.tabs.sendMessage(t.id, { action: "sync" }).catch(()=>{}));
      }
    } catch (e) {
      console.error("Background Error:", e);
    }
  }
});