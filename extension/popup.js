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

        // --- Fallback Général ---
        else {
            const domainParts = hostname.split('.');
            if (domainParts.length >= 2) {
                llmName = domainParts[domainParts.length - 2].charAt(0).toUpperCase() + domainParts[domainParts.length - 2].slice(1);
            } else {
                llmName = hostname;
            }
            const h1 = document.querySelector('h1');
            if (h1) summary = h1.innerText;
        }

        // Nettoyage
        title = title.trim();
        if (summary) {
            summary = summary.trim().substring(0, 300);
            if (summary.length === 300) summary += "...";
        } else {
            // Fallback résumé brutal si rien trouvé
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
  
  // Par défaut, date du jour
  dateInput.value = new Date().toISOString().split('T')[0];

  // Ouvrir le calendrier au clic sur le champ ou l'icône
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
  
  let currentTab = null;

  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    currentTab = tabs[0];
    
    if (!currentTab || !currentTab.url) {
        statusDiv.textContent = "Impossible d'accéder à l'onglet.";
        saveBtn.disabled = true;
        return;
    }

    // Injection Directe (Compatible V2/V3)
    let extracted = null;
    
    try {
        if (browser.scripting && browser.scripting.executeScript) {
            // V3 (Chrome)
            const results = await browser.scripting.executeScript({
                target: { tabId: currentTab.id },
                func: capturePageLogic
            });
            if (results && results[0] && results[0].result) extracted = results[0].result;
        } else if (browser.tabs.executeScript) {
            // V2 (Firefox)
            // On convertit la fonction en chaîne de caractères pour l'injecter
            const code = `(${capturePageLogic.toString()})();`;
            const results = await browser.tabs.executeScript(currentTab.id, { code });
            if (results && results[0]) extracted = results[0];
        }
    } catch (injectionError) {
        console.error("Erreur injection:", injectionError);
        statusDiv.textContent = "Erreur accès page : " + injectionError.message;
    }

            if (extracted && !extracted.error) {
                titleInput.value = extracted.title || currentTab.title;
                llmInput.value = extracted.llm || "Web";
                summaryInput.value = extracted.summary || "";
                if (extracted.tags) tagsInput.value = extracted.tags.join(', ');
                if (extracted.date) dateInput.value = extracted.date.split('T')[0];
                
                statusDiv.textContent = "Données récupérées.";        statusDiv.className = "status success";
    } else {
        // Fallback ultime si l'injection échoue totalement (ex: page restreinte)
        titleInput.value = currentTab.title;
        llmInput.value = new URL(currentTab.url).hostname;
        statusDiv.textContent = "Mode manuel (Accès page bloqué).";
    }

  } catch (err) {
    statusDiv.textContent = "Erreur: " + err.message;
    statusDiv.className = "status error";
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
      }
  });
});
