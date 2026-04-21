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
            let accountEmail = undefined;

            // ChatGPT
            if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
              llmName = "ChatGPT";
              const titleEl = document.querySelector('div[class*="title"], h1');
              if (titleEl) title = titleEl.innerText;
              const userMsg = document.querySelector('[data-message-author-role="user"]');
              if (userMsg) summary = userMsg.innerText;

              // Capture de l'email
              const selectors = [
                'div[class*="text-token-text-tertiary"]', 
                '[data-testid="profile-button"] div.truncate',
                'div.user-menu-item div.truncate',
                'button[id="user-menu-button"] span.truncate',
                'div[class*="not-group-data-disabled:text-token-text-tertiary"]'
              ];
              for (const selector of selectors) {
                const el = document.querySelector(selector);
                if (el && el.innerText.includes('@')) {
                  accountEmail = el.innerText.trim();
                  break;
                }
              }

              // Fallback : recherche agressive dans tous les éléments susceptibles de contenir un email
              if (!accountEmail) {
                const allElements = document.querySelectorAll('div, span, button');
                for (let i = 0; i < allElements.length; i++) {
                  const text = allElements[i].innerText;
                  if (text && text.length < 50 && text.includes('@') && /[\\w.-]+@[\\w.-]+\\.\\w+/.test(text)) {
                    accountEmail = text.trim();
                    break;
                  }
                }
              }

              // Fallback 2 : Recherche dans __NEXT_DATA__ (spécifique à Next.js / ChatGPT)
              if (!accountEmail) {
                try {
                  const nextData = document.getElementById('__NEXT_DATA__');
                  if (nextData) {
                    const json = JSON.parse(nextData.textContent);
                    if (json.props && json.props.pageProps && json.props.pageProps.user) {
                      accountEmail = json.props.pageProps.user.email;
                    }
                  }
                } catch(e) {}
              }
            }
            // Claude
            else if (hostname.includes("claude.ai")) {
              llmName = "Claude";
              const titleEl = document.querySelector('h3, div[class*="truncate"]');
              if (titleEl && titleEl.innerText.length > 2) title = titleEl.innerText;
              const userMsg = document.querySelector('.font-user-message, [data-test-id="user-message"]');
              if (userMsg) summary = userMsg.innerText;

              const emailEl = document.querySelector('div[class*="text-slate-500"]');
              if (emailEl && emailEl.innerText.includes('@')) {
                accountEmail = emailEl.innerText.trim();
              }
            }
            // Gemini
            else if (hostname.includes("gemini.google.com")) {
              llmName = "Gemini";
              const titleEl = document.querySelector('h1[class*="title"], .conversation-title');
              if (titleEl) title = titleEl.innerText;
              const userMsg = document.querySelector('.user-query-text, user-query');
              if (userMsg) summary = userMsg.innerText;

              const emailEl = document.querySelector('div[class*="gb_Vb"], [aria-label^="Compte Google"]');
              if (emailEl) {
                const match = emailEl.getAttribute('aria-label')?.match(/[\\w.-]+@[\\w.-]+\\.\\w+/);
                if (match) accountEmail = match[0];
              }
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
              accountEmail: (typeof accountEmail !== 'undefined') ? accountEmail : undefined,
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
        
        // Notifier la Webapp qu'une synchronisation est nécessaire
        const tabs = await browser.tabs.query({ 
            url: ["https://fredb34670.github.io/AgregLLM/*", "*://localhost/*", "*://127.0.0.1/*"] 
        });
        
        tabs.forEach(async (tab) => {
            try {
                // Envoyer un message au script de contenu (sync.js) injecté dans la webapp
                await browser.tabs.sendMessage(tab.id, { action: "sync" });
                console.log("Sync message sent to webapp tab:", tab.id);
            } catch (e) {
                console.log("Could not send sync message to tab:", tab.id, e.message);
            }
        });
        
        return true;
    } catch (e) {
        console.error("Save Error:", e);
        throw e;
    }
}