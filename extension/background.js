// background.js - Version robuste

// Fonction pour mettre à jour l'icône selon si l'URL est sauvegardée
async function updateIcon(tabId, url) {
    const actionApi = browser.action || browser.browserAction;
    if (!url || !url.startsWith('http')) return;
    try {
        const res = await browser.storage.local.get("conversations");
        const list = res.conversations || [];
        const isSaved = list.some(c => c.url === url);
        
        if (isSaved) {
            actionApi.setBadgeText({ text: "✓", tabId });
            actionApi.setBadgeBackgroundColor({ color: "#4CAF50", tabId });
        } else {
            actionApi.setBadgeText({ text: "", tabId });
        }
    } catch (e) {
        console.error("Icon Update Error:", e);
    }
}

// Écouteur de changement d'URL/onglet
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        updateIcon(tabId, tab.url);
    }
});

browser.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await browser.tabs.get(activeInfo.tabId);
    if (tab && tab.url) {
        updateIcon(activeInfo.tabId, tab.url);
    }
});

browser.contextMenus.create({
  id: "save-to-agregllm",
  title: "Sauvegarder dans AgregLLM",
  contexts: ["all"]
}, () => {
  if (browser.runtime.lastError) {
    console.log("Menu Contextuel Erreur:", browser.runtime.lastError);
  } else {
    console.log("Menu Contextuel OK");
  }
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-agregllm") {
    console.log("Menu clicked on tab:", tab.url);
    try {
      // Essayer d'abord d'utiliser le content script existant
      let captured = null;
      
      try {
        console.log("Trying to send message to content script...");
        const response = await browser.tabs.sendMessage(tab.id, { action: "capture" });
        console.log("Content script response:", response);
        if (response && response.data) {
          captured = response.data;
        }
      } catch (e) {
        console.log("Content script not loaded, using direct injection:", e.message);
        
        // Injecter directement la fonction de capture (compatible Firefox Manifest V2)
        const captureCode = `
          (function() {
            const hostname = window.location.hostname;
            let llmName = "Inconnu";
            let title = document.title;
            let summary = "";

            // ChatGPT
            if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
              llmName = "ChatGPT";
              const titleEl = document.querySelector('div[class*="title"], h1');
              if (titleEl) title = titleEl.innerText;
              const userMsg = document.querySelector('[data-message-author-role="user"]');
              if (userMsg) summary = userMsg.innerText;
            }
            // Claude
            else if (hostname.includes("claude.ai")) {
              llmName = "Claude";
              const titleEl = document.querySelector('h3, div[class*="truncate"]');
              if (titleEl && titleEl.innerText.length > 2) title = titleEl.innerText;
              const userMsg = document.querySelector('.font-user-message, [data-test-id="user-message"]');
              if (userMsg) summary = userMsg.innerText;
            }
            // Gemini
            else if (hostname.includes("gemini.google.com")) {
              llmName = "Gemini";
              const titleEl = document.querySelector('h1[class*="title"], .conversation-title');
              if (titleEl) title = titleEl.innerText;
              const userMsg = document.querySelector('.user-query-text, user-query');
              if (userMsg) summary = userMsg.innerText;
            }
            // AI Studio
            else if (hostname.includes("aistudio.google.com")) {
              llmName = "AI Studio";
              const titleEl = document.querySelector('div[class*="title"]');
              if (titleEl) title = titleEl.innerText;
              const promptArea = document.querySelector('textarea, .prompt-text-area');
              if (promptArea) summary = promptArea.value;
            }
            // Mistral
            else if (hostname.includes("mistral.ai")) {
              llmName = "Mistral";
            }
            // Perplexity
            else if (hostname.includes("perplexity.ai")) {
              llmName = "Perplexity";
            }
            // DeepSeek
            else if (hostname.includes("deepseek.com")) {
              llmName = "DeepSeek";
            }
            // Générique
            else {
              const domainParts = hostname.split('.');
              if (domainParts.length >= 2) {
                llmName = domainParts[domainParts.length - 2].charAt(0).toUpperCase() + 
                          domainParts[domainParts.length - 2].slice(1);
              } else {
                llmName = hostname;
              }
            }

            title = title.trim();
            if (!title || title.toLowerCase() === llmName.toLowerCase()) {
              title = "Discussion " + llmName + " (" + new Date().toLocaleDateString() + ")";
            }

            if (summary) {
              summary = summary.trim().substring(0, 200);
              if (summary.length === 200) summary += "...";
            } else {
              summary = "Aperçu non disponible.";
            }

            const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'ce', 'cet', 'cette', 'ces', 'de', 'du', 'est', 'sont'];
            const tagSource = (title + " " + summary).toLowerCase().replace(/[.,/#!$%^&*;:{}=\\-_\`~()]/g, " ").split(/\\s+/);
            const suggestedTags = [...new Set(tagSource.filter(word => word.length > 4 && !stopWords.includes(word)))].slice(0, 3);

            return {
              title: title,
              url: window.location.href,
              llm: llmName,
              date: new Date().toISOString(),
              summary: summary,
              tags: suggestedTags,
              messages: []
            };
          })();
        `;
        
        // Utiliser executeScript pour Firefox Manifest V2
        console.log("Executing capture code in tab...");
        const results = await browser.tabs.executeScript(tab.id, { code: captureCode });
        console.log("Execution results:", results);
        if (results && results[0]) {
          captured = results[0];
          console.log("Captured data:", captured);
        }
      }
      
      if (captured) {
        console.log("Saving conversation:", captured);
        await saveConversation(captured);
        console.log("Conversation saved successfully!");
        
        // Notification de succès
        try {
          await browser.notifications.create({
            type: 'basic',
            iconUrl: 'icon-192.png',
            title: 'AgregLLM',
            message: '✓ Discussion sauvegardée avec succès !'
          });
        } catch (notifError) {
          console.log("Notification not supported:", notifError);
        }
      } else {
        console.error("Failed to capture data - no data returned");
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

    if (message.action === "google_login") {
        const CLIENT_ID = "895428232613-4p8st94hs6boa7k2j7ft13dglikdhs0f.apps.googleusercontent.com";
        const SCOPES = "https://www.googleapis.com/auth/drive.appdata";
        const redirectUri = "https://fredb34670.github.io/AgregLLM/";
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(SCOPES)}&prompt=consent`;

        // Créer une fenêtre séparée (popup) forçée
        browser.windows.create({
            url: authUrl,
            type: "popup",
            width: 500,
            height: 650
        }).then((window) => {
            const tabId = window.tabs[0].id;
            
            // Écouteur pour capturer le retour
            const onUpdated = async (updatedTabId, changeInfo, tab) => {
                if (updatedTabId === tabId && tab.url && tab.url.includes(redirectUri) && tab.url.includes("access_token=")) {
                    console.log("Token detected in background!");
                    const url = new URL(tab.url.replace("#", "?")); // Transformer hash en params
                    const token = url.searchParams.get("access_token");
                    const expiresIn = url.searchParams.get("expires_in");
                    
                    if (token) {
                        const expiry = Date.now() + (parseInt(expiresIn || "3600") * 1000);
                        await browser.storage.local.set({
                            gdrive_token: token,
                            gdrive_expiry: expiry.toString()
                        });
                        console.log("Token saved to background storage");
                        
                        // Fermer la fenêtre
                        browser.windows.remove(window.id);
                        browser.tabs.onUpdated.removeListener(onUpdated);
                        
                        // Notifier l'émetteur
                        sendResponse({ success: true });
                    }
                }
            };
            
            browser.tabs.onUpdated.addListener(onUpdated);
            
            // Nettoyage si la fenêtre est fermée manuellement
            browser.windows.onRemoved.addListener((windowId) => {
                if (windowId === window.id) {
                    browser.tabs.onUpdated.removeListener(onUpdated);
                }
            });
        });
        return true;
    }
});

// Fonction utilitaire de sauvegarde centralisée
async function saveConversation(data) {
    console.log("saveConversation called with data:", JSON.stringify(data));
    try {
        const res = await browser.storage.local.get("conversations");
        let list = res.conversations || [];
        console.log("Current conversations in storage:", list.length);
        
        // Mise à jour si existe déjà (basé sur l'URL), sinon ajout
        const existingIndex = list.findIndex(c => c.url === data.url);
        if (existingIndex >= 0) {
            console.log("Updating existing conversation at index:", existingIndex);
            // On préserve les tags et le dossier si existent, mais on merge avec les nouveaux
            data.tags = data.tags && data.tags.length > 0 ? data.tags : list[existingIndex].tags; 
            data.folderId = list[existingIndex].folderId;
            // On peut aussi préserver l'ID s'il est utilisé comme clé stable
            if (list[existingIndex].id) data.id = list[existingIndex].id;
            
            list[existingIndex] = data;
        } else {
            console.log("Adding new conversation");
            // Nouvel ID pour la nouvelle conversation
            if (!data.id) data.id = crypto.randomUUID();
            list.push(data);
        }
        
        console.log("Saving to storage:", JSON.stringify(data));
        await browser.storage.local.set({ conversations: list });
        console.log("Successfully saved to storage!");
        
        // Synchroniser aussi avec localStorage pour la webapp
        // Notification Webapp (GitHub Pages et localhost en dev)
        const tabs = await browser.tabs.query({ 
            url: [
                "https://fredb34670.github.io/AgregLLM/*", 
                "*://localhost/*", 
                "*://127.0.0.1/*",
                "moz-extension://*/index.html*"
            ] 
        });
        
        // Injecter un script pour mettre à jour le localStorage de la webapp
        tabs.forEach(async (tab) => {
            try {
                const code = `
                    (function() {
                        const extConversations = ${JSON.stringify(list)};
                        const currentData = localStorage.getItem('agregllm_conversations');
                        let webConversations = currentData ? JSON.parse(currentData) : [];
                        
                        const mergedConversations = extConversations.map(extConv => {
                            const existing = webConversations.find(w => w.url === extConv.url);
                            if (existing) {
                                return {
                                    ...extConv,
                                    id: existing.id,
                                    folderId: existing.folderId,
                                    isFavorite: existing.isFavorite,
                                    tags: extConv.tags && extConv.tags.length > 0 ? extConv.tags : existing.tags
                                };
                            }
                            return extConv;
                        });

                        localStorage.setItem('agregllm_conversations', JSON.stringify(mergedConversations));
                        console.log('AgregLLM: Conversations synchronized from extension', mergedConversations.length);
                        window.dispatchEvent(new Event('storage'));
                        window.dispatchEvent(new Event('agregllm-sync-complete'));
                    })();
                `;
                
                if (browser.scripting && browser.scripting.executeScript) {
                    await browser.scripting.executeScript({
                        target: { tabId: tab.id },
                        code: code
                    });
                } else if (browser.tabs.executeScript) {
                    await browser.tabs.executeScript(tab.id, { code: code });
                }
                
                console.log("Synchronized with webapp tab:", tab.id);
            } catch (e) {
                console.log("Could not sync with tab:", tab.id, e.message);
            }
        });
        
        return true;
    } catch (e) {
        console.error("Save Error:", e);
        throw e;
    }
}