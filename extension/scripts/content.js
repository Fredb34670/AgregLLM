// content.js - Version Metadonnées Uniquement
console.log("AgregLLM: Content script chargé sur", window.location.href);

function capture() {
  console.log("AgregLLM: Exécution de capture()...");
  try {
    const hostname = window.location.hostname;
    let llmName = "Inconnu";
    let title = document.title;
    let summary = "";

    console.log("AgregLLM: Hostname détecté:", hostname);

    // --- ChatGPT ---
    if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
      llmName = "ChatGPT";
      try {
          const titleEl = document.querySelector('div[class*="title"], h1'); 
          if (titleEl) title = titleEl.innerText;
          console.log("AgregLLM: Titre ChatGPT trouvé:", title);
      } catch (e) { console.error("AgregLLM: Erreur titre ChatGPT", e); }
      
      try {
          const userMsg = document.querySelector('[data-message-author-role="user"]');
          if (userMsg) summary = userMsg.innerText;
          console.log("AgregLLM: Résumé ChatGPT trouvé:", summary ? "Oui" : "Non");
      } catch (e) { console.error("AgregLLM: Erreur résumé ChatGPT", e); }
    } 
    
    // --- Claude ---
    else if (hostname.includes("claude.ai")) {
      llmName = "Claude";
      // Claude met souvent le titre dans l'URL ou le titre de la page est générique "Claude".
      // On essaie de trouver le titre dans l'interface
      const titleEl = document.querySelector('h3, div[class*="truncate"]'); 
      if (titleEl && titleEl.innerText.length > 2) title = titleEl.innerText;

      // Résumé: Premier message utilisateur
      // Les classes de Claude sont souvent obfusquées, on cherche un conteneur de message user
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
    
    // --- AI Studio ---
    else if (hostname.includes("aistudio.google.com")) {
      llmName = "AI Studio";
      const titleEl = document.querySelector('div[class*="title"]');
      if (titleEl) title = titleEl.innerText;

      const promptArea = document.querySelector('textarea, .prompt-text-area');
      if (promptArea) summary = promptArea.value;
    }

    // --- Générique / Fallback ---
    else {
      // Pour tout autre site, on utilise le domaine comme nom de LLM par défaut
      const domainParts = hostname.split('.');
      if (domainParts.length >= 2) {
        llmName = domainParts[domainParts.length - 2].charAt(0).toUpperCase() + domainParts[domainParts.length - 2].slice(1);
      } else {
        llmName = hostname;
      }
      
      // On essaie de prendre le premier paragraphe ou h1 comme résumé par défaut si rien d'autre
      const h1 = document.querySelector('h1');
      if (h1) summary = h1.innerText;
    }

    // Nettoyage du titre et résumé
    title = title.trim();
    // Si le titre est trop générique ou vide, on remet l'URL ou un défaut
    if (!title || title.toLowerCase() === "claude" || title.toLowerCase() === "chatgpt") {
      title = "Discussion " + llmName + " (" + new Date().toLocaleDateString() + ")";
    }

    if (summary) {
      summary = summary.trim().substring(0, 200); // Limite à 200 caractères
      if (summary.length === 200) summary += "...";
    } else {
      summary = "Aperçu non disponible.";
    }

    // --- Auto-Tags ---
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'ce', 'cet', 'cette', 'ces', 'de', 'du', 'est', 'sont', 'avoir', 'être', 'faire', 'dire', 'aller'];
    const tagSource = (title + " " + summary).toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ").split(/\s+/);
    const suggestedTags = [...new Set(tagSource.filter(word => word.length > 4 && !stopWords.includes(word)))].slice(0, 3);

    console.log("AgregLLM: Capture réussie", title, llmName);

    return {
      data: {
        title: title,
        url: window.location.href,
        llm: llmName,
        date: new Date().toISOString(),
        summary: summary,
        tags: suggestedTags,
        messages: [] 
      }
    };

  } catch (e) {
    return { error: e.message };
  }
}


// Écouteur de messages du background script (ou popup)
if (typeof browser === "undefined") {
    var browser = chrome;
}

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("AgregLLM: Message reçu", msg);
  
  if (msg.action === "capture") {
    // On retourne une promesse ou on appelle sendResponse directement
    // Pour Firefox/Chrome compatibilité, le return true est important pour l'asynchrone
    // Mais ici capture() est synchrone.
    const result = capture();
    console.log("AgregLLM: Envoi réponse", result);
    sendResponse(result);
  }
  
  // Important pour la compatibilité Firefox si on voulait faire de l'async
  // return true; 
});