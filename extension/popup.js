// popup.js - Gestion de la popup
if (typeof browser === "undefined") {
    var browser = chrome;
}

document.addEventListener('DOMContentLoaded', async () => {
  const titleInput = document.getElementById('title');
  const llmInput = document.getElementById('llm');
  const summaryInput = document.getElementById('summary');
  const tagsInput = document.getElementById('tags');
  const saveBtn = document.getElementById('save-btn');
  const statusDiv = document.getElementById('status');
  
  let currentTab = null;
  let capturedData = null;

  try {
    // 1. Récupérer l'onglet actif
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    currentTab = tabs[0];
    
    if (!currentTab || !currentTab.url) {
        statusDiv.textContent = "Impossible d'accéder à l'onglet.";
        saveBtn.disabled = true;
        return;
    }

    // 2. Essayer de communiquer avec le content script (si présent)
    try {
        const response = await browser.tabs.sendMessage(currentTab.id, { action: "capture" });
        if (response && response.data) {
            capturedData = response.data;
            titleInput.value = capturedData.title || currentTab.title;
            llmInput.value = capturedData.llm || detectLLM(currentTab.url);
            summaryInput.value = capturedData.summary || "";
            // Auto-tags from content script if available
            if (capturedData.tags) {
              tagsInput.value = capturedData.tags.join(', ');
            }
            statusDiv.textContent = "Données détectées automatiquement.";
            statusDiv.className = "status success";
        }
    } catch (e) {
        // Pas de content script ou erreur => Mode Fallback
        console.log("Mode Fallback (Pas de content script):", e);
        titleInput.value = currentTab.title;
        llmInput.value = detectLLM(currentTab.url);
        
        // Tentative de récupération sommaire du contenu (Fallback)
        try {
            let resultText = "";
            
            // Compatibilité V3 (Chrome)
            if (browser.scripting && browser.scripting.executeScript) {
                const results = await browser.scripting.executeScript({
                    target: { tabId: currentTab.id },
                    func: () => document.body.innerText.substring(0, 300).replace(/\s+/g, ' ').trim() + "..."
                });
                if (results && results[0] && results[0].result) resultText = results[0].result;
            } 
            // Compatibilité V2 (Firefox)
            else if (browser.tabs.executeScript) {
                const results = await browser.tabs.executeScript(currentTab.id, {
                    code: "document.body.innerText.substring(0, 300).replace(/\\s+/g, ' ').trim() + '...'"
                });
                if (results && results[0]) resultText = results[0];
            }

            if (resultText) {
                summaryInput.value = resultText;
                statusDiv.textContent = "Mode manuel (Auto-résumé activé).";
            } else {
                statusDiv.textContent = "Mode manuel (Script non détecté).";
            }
        } catch (scriptError) {
             console.log("Scripting error:", scriptError);
             statusDiv.textContent = "Mode manuel.";
        }
        
        statusDiv.className = "status";
    }

  } catch (err) {
    statusDiv.textContent = "Erreur: " + err.message;
    statusDiv.className = "status error";
  }

  // Fonction de détection basique du LLM
  function detectLLM(url) {
      if (!url) return "Web";
      const hostname = new URL(url).hostname;
      if (hostname.includes('openai') || hostname.includes('chatgpt')) return 'ChatGPT';
      if (hostname.includes('claude')) return 'Claude';
      if (hostname.includes('gemini') || hostname.includes('google')) return 'Gemini';
      if (hostname.includes('mistral')) return 'Mistral';
      if (hostname.includes('perplexity')) return 'Perplexity';
      
      const parts = hostname.split('.');
      if (parts.length >= 2) {
         const name = parts[parts.length - 2];
         return name.charAt(0).toUpperCase() + name.slice(1);
      }
      return hostname;
  }

  // Sauvegarde
  saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = "Sauvegarde en cours...";

      const dataToSave = {
          title: titleInput.value,
          url: currentTab.url,
          llm: llmInput.value,
          summary: summaryInput.value,
          tags: tagsInput.value.split(',').map(t => t.trim()).filter(t => t !== ""),
          date: new Date().toISOString(),
          messages: [] // Confidentiel
      };

      try {
          // Envoyer au background script pour stockage
          await browser.runtime.sendMessage({
              action: "save_conversation",
              data: dataToSave
          });
          
          statusDiv.textContent = "Sauvegardé avec succès !";
          statusDiv.className = "status success";
          saveBtn.textContent = "Sauvegardé";
          setTimeout(() => window.close(), 1000);

      } catch (e) {
          statusDiv.textContent = "Erreur de sauvegarde: " + e.message;
          statusDiv.className = "status error";
          saveBtn.disabled = false;
          saveBtn.textContent = "Réessayer";
      }
  });
});