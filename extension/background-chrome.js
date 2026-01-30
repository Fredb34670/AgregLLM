// background-chrome.js - Version pour Chrome Manifest V3 (Service Worker)

// Fonction pour mettre à jour l'icône selon si l'URL est sauvegardée
async function updateIcon(tabId, url) {
    if (!url || !url.startsWith('http')) return;
    try {
        const res = await chrome.storage.local.get("conversations");
        const list = res.conversations || [];
        const isSaved = list.some(c => c.url === url);
        
        if (isSaved) {
            chrome.action.setBadgeText({ text: "✓", tabId });
            chrome.action.setBadgeBackgroundColor({ color: "#4CAF50", tabId });
        } else {
            chrome.action.setBadgeText({ text: "", tabId });
        }
    } catch (e) {
        console.error("Icon Update Error:", e);
    }
}

// Écouteur de changement d'URL/onglet
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        updateIcon(tabId, tab.url);
    }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab && tab.url) {
        updateIcon(activeInfo.tabId, tab.url);
    }
});

// Supprimer le menu existant s'il existe, puis le recréer
chrome.contextMenus.remove("save-to-agregllm", () => {
  chrome.contextMenus.create({
    id: "save-to-agregllm",
    title: "Sauvegarder dans AgregLLM",
    contexts: ["all"]
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Menu Contextuel Erreur:", chrome.runtime.lastError.message);
    } else {
      console.log("Menu Contextuel OK");
    }
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-agregllm") {
    console.log("Menu clicked on tab:", tab.url);
    try {
      let captured = null;
      
      // Chrome Manifest V3 utilise scripting.executeScript
      const captureCode = `
        (function() {
          const hostname = window.location.hostname;
          let llmName = "Inconnu";
          let title = document.title;
          let summary = "";

          if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
            llmName = "ChatGPT";
            const titleEl = document.querySelector('div[class*="title"], h1');
            if (titleEl) title = titleEl.innerText;
            const userMsg = document.querySelector('[data-message-author-role="user"]');
            if (userMsg) summary = userMsg.innerText;
          } else if (hostname.includes("claude.ai")) {
            llmName = "Claude";
            const titleEl = document.querySelector('h3, div[class*="truncate"]');
            if (titleEl && titleEl.innerText.length > 2) title = titleEl.innerText;
            const userMsg = document.querySelector('.font-user-message, [data-test-id="user-message"]');
            if (userMsg) summary = userMsg.innerText;
          } else if (hostname.includes("gemini.google.com")) {
            llmName = "Gemini";
            const titleEl = document.querySelector('h1[class*="title"], .conversation-title');
            if (titleEl) title = titleEl.innerText;
            const userMsg = document.querySelector('.user-query-text, user-query');
            if (userMsg) summary = userMsg.innerText;
          } else if (hostname.includes("aistudio.google.com")) {
            llmName = "AI Studio";
            const titleEl = document.querySelector('div[class*="title"]');
            if (titleEl) title = titleEl.innerText;
            const promptArea = document.querySelector('textarea, .prompt-text-area');
            if (promptArea) summary = promptArea.value;
          } else if (hostname.includes("mistral.ai")) {
            llmName = "Mistral";
          } else if (hostname.includes("perplexity.ai")) {
            llmName = "Perplexity";
          } else if (hostname.includes("deepseek.com")) {
            llmName = "DeepSeek";
          } else {
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
      
      console.log("Executing capture code in tab...");
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function() {
          const hostname = window.location.hostname;
          let llmName = "Inconnu";
          let title = document.title;
          let summary = "";

          if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
            llmName = "ChatGPT";
            const titleEl = document.querySelector('div[class*="title"], h1');
            if (titleEl) title = titleEl.innerText;
            const userMsg = document.querySelector('[data-message-author-role="user"]');
            if (userMsg) summary = userMsg.innerText;
          } else if (hostname.includes("claude.ai")) {
            llmName = "Claude";
            const titleEl = document.querySelector('h3, div[class*="truncate"]');
            if (titleEl && titleEl.innerText.length > 2) title = titleEl.innerText;
            const userMsg = document.querySelector('.font-user-message, [data-test-id="user-message"]');
            if (userMsg) summary = userMsg.innerText;
          } else if (hostname.includes("gemini.google.com")) {
            llmName = "Gemini";
            const titleEl = document.querySelector('h1[class*="title"], .conversation-title');
            if (titleEl) title = titleEl.innerText;
            const userMsg = document.querySelector('.user-query-text, user-query');
            if (userMsg) summary = userMsg.innerText;
          } else if (hostname.includes("aistudio.google.com")) {
            llmName = "AI Studio";
            const titleEl = document.querySelector('div[class*="title"]');
            if (titleEl) title = titleEl.innerText;
            const promptArea = document.querySelector('textarea, .prompt-text-area');
            if (promptArea) summary = promptArea.value;
          } else if (hostname.includes("mistral.ai")) {
            llmName = "Mistral";
          } else if (hostname.includes("perplexity.ai")) {
            llmName = "Perplexity";
          } else if (hostname.includes("deepseek.com")) {
            llmName = "DeepSeek";
          } else {
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
          const tagSource = (title + " " + summary).toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ").split(/\s+/);
          const suggestedTags = [...new Set(tagSource.filter(word => word.length > 4 && !stopWords.includes(word)))].slice(0, 3);
          console.log('DEBUG tags:', { title, summary, tagSource: tagSource.slice(0, 10), suggestedTags });

          return {
            title: title,
            url: window.location.href,
            llm: llmName,
            date: new Date().toISOString(),
            summary: summary,
            tags: suggestedTags,
            messages: []
          };
        }
      });
      
      if (results && results[0] && results[0].result) {
        captured = results[0].result;
        console.log("Captured data:", captured);
      }
      
      if (captured) {
        console.log("Saving conversation:", captured);
        await saveConversation(captured);
        console.log("Conversation saved successfully!");
        
        try {
          await chrome.notifications.create({
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

// Gestionnaire de messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "save_conversation" && message.data) {
        saveConversation(message.data)
            .then(() => sendResponse({ success: true }))
            .catch((e) => sendResponse({ success: false, error: e.message }));
        return true;
    }
});

// Fonction de sauvegarde
async function saveConversation(data) {
    console.log("saveConversation called with data:", JSON.stringify(data));
    try {
        const res = await chrome.storage.local.get("conversations");
        let list = res.conversations || [];
        console.log("Current conversations in storage:", list.length);
        
        const existingIndex = list.findIndex(c => c.url === data.url);
        if (existingIndex >= 0) {
            console.log("Updating existing conversation at index:", existingIndex);
            data.tags = data.tags && data.tags.length > 0 ? data.tags : list[existingIndex].tags; 
            data.folderId = list[existingIndex].folderId;
            if (list[existingIndex].id) data.id = list[existingIndex].id;
            list[existingIndex] = data;
        } else {
            console.log("Adding new conversation");
            if (!data.id) data.id = crypto.randomUUID();
            list.push(data);
        }
        
        console.log("Saving to storage:", JSON.stringify(data));
        await chrome.storage.local.set({ conversations: list });
        console.log("Successfully saved to storage!");
        
        // Synchroniser avec localStorage de la webapp
        const tabs = await chrome.tabs.query({ 
            url: ["https://fredb34670.github.io/AgregLLM/*", "*://localhost/*", "*://127.0.0.1/*"] 
        });
        
        tabs.forEach(async (tab) => {
            try {
                const code = `
                    (function() {
                        const conversations = ${JSON.stringify(list)};
                        localStorage.setItem('agregllm_conversations', JSON.stringify(conversations));
                        console.log('AgregLLM: Conversations synchronized from extension', conversations.length);
                        window.dispatchEvent(new Event('storage'));
                        window.dispatchEvent(new Event('agregllm-sync-complete'));
                    })();
                `;
                
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: function(conversationsList) {
                        localStorage.setItem('agregllm_conversations', JSON.stringify(conversationsList));
                        console.log('AgregLLM: Conversations synchronized from extension', conversationsList.length);
                        window.dispatchEvent(new Event('storage'));
                        window.dispatchEvent(new Event('agregllm-sync-complete'));
                    },
                    args: [list]
                });
                
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
