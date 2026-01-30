// popup.js - Injection Directe Robuste (V2 & V3)
if (typeof browser === "undefined") {
    var browser = chrome;
}

// Logique de capture à injecter (doit être autonome)
function capturePageLogic() {
    try {
        const hostname = window.location.hostname;
        let llmName = "Inconnu";
        let title = document.title;
        let summary = "";

        // --- ChatGPT ---
        if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
            llmName = "ChatGPT";
            const titleEl = document.querySelector('div[class*="title"], h1'); 
            if (titleEl) title = titleEl.innerText;
            
            const userMsg = document.querySelector('[data-message-author-role="user"]');
            if (userMsg) summary = userMsg.innerText;
        } 
        
        // --- Claude ---
        else if (hostname.includes("claude.ai")) {
            llmName = "Claude";
            const titleEl = document.querySelector('h3, div[class*="truncate"]'); 
            if (titleEl && titleEl.innerText.length > 2) title = titleEl.innerText;
            const userMsg = document.querySelector('.font-user-message, [data-test-id="user-message"]');
            if (userMsg) summary = userMsg.innerText;
        } 
        
        // --- Gemini ---
        else if (hostname.includes("gemini.google.com")) {
            llmName = "Gemini";
            const titleEl = document.querySelector('h1[class*="title"], .conversation-title');
            if (titleEl) title = titleEl.innerText;
            const userMsg = document.querySelector('.user-query-text, user-query');
            if (userMsg) summary = userMsg.innerText;
        }

        // --- Mistral ---
        else if (hostname.includes("mistral.ai")) {
            llmName = "Mistral";
            const titleEl = document.querySelector('h1, h2, [class*="title"]');
            if (titleEl) title = titleEl.innerText;
        }

        // --- Perplexity ---
        else if (hostname.includes("perplexity.ai")) {
            llmName = "Perplexity";
            const titleEl = document.querySelector('h1, [class*="title"]');
            if (titleEl) title = titleEl.innerText;
        }

        // --- DeepSeek ---
        else if (hostname.includes("deepseek.com")) {
            llmName = "DeepSeek";
            const titleEl = document.querySelector('[class*="title"]');
            if (titleEl) title = titleEl.innerText;
        }

        // --- HuggingChat ---
        else if (hostname.includes("huggingface.co")) {
            llmName = "HuggingChat";
        }

        // --- Fallback Général ---
        else {
            const domainParts = hostname.split('.');
            if (domainParts.length >= 2) {
                llmName = domainParts[domainParts.length - 2].charAt(0).toUpperCase() + domainParts[domainParts.length - 2].slice(1);
            } else {
                llmName = hostname;
            }
            const h1 = document.querySelector('h1');
            if (h1) title = h1.innerText;
        }

        // Nettoyage
        title = title.trim();
        if (summary) {
            summary = summary.trim().substring(0, 300);
            if (summary.length === 300) summary += "...";
        } else {
            summary = document.body.innerText.substring(0, 300).replace(/\s+/g, ' ').trim() + "...";
        }

        // Auto-Tags
        const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'ce', 'cet', 'cette', 'ces', 'de', 'du', 'est', 'sont', 'avoir', 'être', 'faire', 'dire', 'aller'];
        const tagSource = (title + " " + summary).toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ").split(/\s+/);
        const suggestedTags = [...new Set(tagSource.filter(word => word.length > 4 && !stopWords.includes(word)))].slice(0, 3);

        return {
            title,
            llm: llmName,
            summary,
            tags: suggestedTags
        };
    } catch (e) {
        return { error: e.message };
    }
}

document.addEventListener('DOMContentLoaded', async () => {
  const titleInput = document.getElementById('title');
  const llmInput = document.getElementById('llm');
  const dateInput = document.getElementById('date');
  const dateWrapper = document.getElementById('date-wrapper');
  const summaryInput = document.getElementById('summary');
  const tagsInput = document.getElementById('tags');
  const saveBtn = document.getElementById('save-btn');
  const openAppBtn = document.getElementById('open-app-btn');
  const statusDiv = document.getElementById('status');

  // Ouvrir l'application
  if (openAppBtn) {
    openAppBtn.addEventListener('click', () => {
      // Ouvrir l'application web hébergée (localhost en dev, GitHub Pages en prod)
      const webappUrl = "http://localhost:5173"; // Changez par votre URL de prod si nécessaire
      browser.tabs.create({ url: webappUrl });
    });
  }
  
  // Par défaut, date du jour
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Ouvrir le calendrier au clic sur le champ ou l'icône
  if (dateWrapper && dateInput) {
    dateWrapper.addEventListener('click', () => {
      try {
        if (dateInput.showPicker) {
          dateInput.showPicker();
        } else {
          dateInput.focus();
        }
      } catch (e) {
        dateInput.focus();
      }
    });
  }
  
  let currentTab = null;

  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    currentTab = tabs[0];
    console.log("URL de l'onglet actif:", currentTab.url);
    
    if (!currentTab || !currentTab.url) {
        statusDiv.textContent = "Impossible d'accéder à l'onglet.";
        saveBtn.disabled = true;
        return;
    }

    // Vérifier si l'URL est injectable avant de continuer
    if (!currentTab.url.startsWith('http:') && !currentTab.url.startsWith('https:')) {
        if (titleInput) titleInput.value = currentTab.title || "";
        if (llmInput) llmInput.value = "Web";
        statusDiv.textContent = "Page non-standard. Mode manuel.";
        return; 
    }

    // Injection Directe (Compatible V2/V3)
    let extracted = null;
    
    try {
        if (browser.scripting && browser.scripting.executeScript) {
            const results = await browser.scripting.executeScript({
                target: { tabId: currentTab.id },
                func: capturePageLogic
            });
            if (results && results[0] && results[0].result) extracted = results[0].result;
        } else if (browser.tabs.executeScript) {
            const code = `(${capturePageLogic.toString()})();`;
            const results = await browser.tabs.executeScript(currentTab.id, { code });
            if (results && results[0]) extracted = results[0];
        }
    } catch (injectionError) {
        console.error("Erreur injection:", injectionError);
    }

    if (extracted) {
        if (extracted.error) console.error("Erreur capture:", extracted.error);
        
        if (titleInput) titleInput.value = extracted.title || currentTab.title;
        if (llmInput) llmInput.value = extracted.llm || "Web";
        if (summaryInput) summaryInput.value = extracted.summary || "";
        if (tagsInput && extracted.tags) tagsInput.value = extracted.tags.join(', ');
        
        statusDiv.textContent = "Données récupérées.";
        statusDiv.className = "status success";
    } else {
        if (titleInput) titleInput.value = currentTab.title;
        if (llmInput) llmInput.value = detectLLM(currentTab.url);
        statusDiv.textContent = "Mode manuel.";
    }

  } catch (err) {
    statusDiv.textContent = "Erreur: " + err.message;
    statusDiv.className = "status error";
  }

  function detectLLM(url) {
      if (!url) return "Web";
      try {
          const hostname = new URL(url).hostname;
          if (hostname.includes('openai') || hostname.includes('chatgpt')) return 'ChatGPT';
          if (hostname.includes('claude')) return 'Claude';
          if (hostname.includes('gemini') || hostname.includes('google')) return 'Gemini';
          if (hostname.includes('mistral')) return 'Mistral';
          if (hostname.includes('perplexity')) return 'Perplexity';
          if (hostname.includes('deepseek')) return 'DeepSeek';
          
          const parts = hostname.split('.');
          if (parts.length >= 2) {
             const name = parts[parts.length - 2];
             return name.charAt(0).toUpperCase() + name.slice(1);
          }
          return hostname;
      } catch (e) {
          return "Web";
      }
  }

  saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = "Sauvegarde...";

      const dataToSave = {
          title: titleInput.value,
          url: currentTab.url,
          llm: llmInput.value,
          summary: summaryInput.value,
          tags: tagsInput.value.split(',').map(t => t.trim()).filter(t => t !== ""),
          date: new Date(dateInput.value).toISOString(),
          messages: []
      };

      try {
          await browser.runtime.sendMessage({ action: "save_conversation", data: dataToSave });
          statusDiv.textContent = "Sauvegardé !";
          statusDiv.className = "status success";
          setTimeout(() => window.close(), 1000);
      } catch (e) {
          statusDiv.textContent = "Erreur: " + e.message;
          statusDiv.className = "status error";
          saveBtn.disabled = false;
          saveBtn.textContent = "Réessayer";
      }
  });
});