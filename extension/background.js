// background.js - Version native Firefox

console.log("AgregLLM: Script de fond actif.");

// Création du menu
browser.contextMenus.create({
  id: "save-to-agregllm",
  title: "Sauvegarder dans AgregLLM",
  contexts: ["all"]
}, () => {
  if (browser.runtime.lastError) {
    console.error("Erreur création menu:", browser.runtime.lastError);
  } else {
    console.log("Menu contextuel créé.");
  }
});

// Écouteur de clic
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-agregllm") {
    console.log("Clic détecté sur onglet:", tab.id);
    try {
      // Envoi du message via l'API Firefox
      const response = await browser.tabs.sendMessage(tab.id, { action: "capture" });
      console.log("Réponse reçue du script de contenu:", response);
      
      if (response && response.data) {
        const res = await browser.storage.local.get("conversations");
        const list = res.conversations || [];
        list.push(response.data);
        await browser.storage.local.set({ conversations: list });
        console.log("AgregLLM: SAUVEGARDE RÉUSSIE !");
      }
    } catch (e) {
      console.error("Erreur fatale communication:", e);
    }
  }
});