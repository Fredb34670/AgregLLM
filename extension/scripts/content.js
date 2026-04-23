// content.js - Version Metadonnées Uniquement
console.log("AgregLLM: Content script chargé sur", window.location.href);

function showLoginHelper() {
  if (document.getElementById('agregllm-login-helper')) return;

  const div = document.createElement('div');
  div.id = 'agregllm-login-helper';
  div.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    z-index: 999999;
    padding: 20px;
    border: 1px solid #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #333;
    animation: slideIn 0.3s ease-out;
  `;

  div.innerHTML = `
    <style>
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      #agregllm-login-helper h3 { margin: 0 0 10px 0; font-size: 16px; color: #d32f2f; }
      #agregllm-login-helper p { margin: 0 0 10px 0; font-size: 14px; line-height: 1.5; color: #555; }
      #agregllm-login-helper .btn-close { background: #444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; width: 100%; font-weight: 500; margin-top: 10px; }
      #agregllm-login-helper .btn-close:hover { background: #222; }
    </style>
    <h3>AgregLLM : Discussion liée</h3>
    <p>Cette discussion n'est pas accessible avec votre compte actuel.</p>
    <p style="font-size: 13px; color: #666; background: #fffde7; padding: 10px; border-radius: 6px; border: 1px solid #fff9c4; margin-top: 10px;">
      <b>Pourquoi ce message ?</b><br>
      ChatGPT affiche une erreur car vous tentez d'ouvrir un lien appartenant à un autre compte utilisateur. Veuillez changer de compte sur ce LLM pour y accéder.
    </p>
    <button class="btn-close">J'ai compris</button>
  `;

  div.querySelector('.btn-close').onclick = () => div.remove();

  document.body.appendChild(div);
}

function detectError() {
  const hostname = window.location.hostname;
  const pageText = (document.body.innerText || document.body.textContent || "").toLowerCase();
  
  if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
    const errorEl = document.querySelector('div[class*="text-token-text-secondary"]');
    const errorText = errorEl ? (errorEl.innerText || errorEl.textContent || "").toLowerCase() : "";
    
    const hasError = pageText.includes("404") || 
           pageText.includes("conversation not found") || 
           pageText.includes("unable to load conversation") ||
           pageText.includes("impossible de charger la conversation") ||
           pageText.includes("impossible de charger la discussion") ||
           errorText.includes("not found");

    if (hasError) console.log("AgregLLM: Erreur ChatGPT détectée !");
    return hasError;
  }
  
  if (hostname.includes("claude.ai")) {
    return pageText.includes("Conversation not found") || 
           pageText.includes("404") ||
           !!document.querySelector('h1')?.innerText.includes("Not Found");
  }
  
  if (hostname.includes("gemini.google.com")) {
    return pageText.includes("échec du chargement") || 
           pageText.includes("introuvable") ||
           pageText.includes("not found");
  }
  
  return false;
}

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

    // --- Capture de l'email du compte ---
    let accountEmail = undefined;
    try {
      if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
        // Sélecteurs plus robustes pour ChatGPT
        const selectors = [
          'div[class*="text-token-text-tertiary"]', 
          '[data-testid="profile-button"] div.truncate',
          'div.user-menu-item div.truncate',
          'button[id="user-menu-button"] span.truncate'
        ];

        for (const selector of selectors) {
          const el = document.querySelector(selector);
          const text = el ? (el.innerText || el.textContent || "") : "";
          if (text.includes('@')) {
            accountEmail = text.trim();
            break;
          }
        }

        // Secours : Si aucun email trouvé, on prend le texte du bouton de profil comme nom d'utilisateur
        if (!accountEmail) {
          accountEmail = getCurrentIdentity();
        }
      }
 else if (hostname.includes("gemini.google.com")) {
        const emailEl = document.querySelector('div[class*="gb_Vb"], [aria-label^="Compte Google"]');
        if (emailEl) {
          const match = emailEl.getAttribute('aria-label')?.match(/[\w.-]+@[\w.-]+\.\w+/);
          if (match) accountEmail = match[0];
        }
      } else if (hostname.includes("claude.ai")) {
        const emailEl = document.querySelector('div[class*="text-slate-500"]');
        if (emailEl && emailEl.innerText.includes('@')) {
          accountEmail = emailEl.innerText.trim();
        }
      }
    } catch (e) { console.error("AgregLLM: Erreur capture email", e); }

    // Tentative d'extraction de date (très basique, à affiner selon les LLM)
    let displayDate = new Date().toISOString();
    // Sur ChatGPT, on pourrait chercher des éléments spécifiques, mais new Date() reste le plus sûr
    // si on ne veut pas casser le script à chaque mise à jour d'interface.

    return {
      data: {
        title: title,
        url: window.location.href,
        llm: llmName,
        date: displayDate,
        summary: summary,
        tags: suggestedTags,
        accountEmail: accountEmail,
        messages: [] 
      }
    };

  } catch (e) {
    return { error: e.message };
  }
}


// Écouteur de messages du background script (ou popup)
if (typeof browser === "undefined") {
    var browser = (typeof chrome !== "undefined") ? chrome : undefined;
}

if (browser && browser.runtime && browser.runtime.onMessage) {
  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("AgregLLM: Message reçu", msg);

    if (msg.action === "capture") {
      const result = capture();
      console.log("AgregLLM: Envoi réponse", result);
      sendResponse(result);
    }
  });
}

// Export pour les tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { capture, detectError, showLoginHelper, getCurrentIdentity };
} else if (typeof exports !== 'undefined') {
  exports.capture = capture;
  exports.detectError = detectError;
  exports.showLoginHelper = showLoginHelper;
  exports.getCurrentIdentity = getCurrentIdentity;
}

function getCurrentIdentity() {
  const hostname = window.location.hostname;
  if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
    const profileBtn = document.querySelector('[data-testid="profile-button"]');
    if (profileBtn) {
      const truncates = Array.from(profileBtn.querySelectorAll('.truncate'));
      // Log pour diagnostic utilisateur
      console.log("AgregLLM Debug: Truncates found:", truncates.map(el => el.innerText.trim()));
      
      const forbidden = ["free", "plus", "team", "enterprise", "ctrl", "shift", "+", "gratuit", "personal", "pro", "student", "edu"];
      
      const isIdentity = (text) => {
        if (!text || text.length < 2) return false;
        const t = text.toLowerCase().trim();
        const forbidden = ["free", "plus", "team", "enterprise", "ctrl", "shift", "+", "gratuit", "personal", "pro", "student", "edu"];
        // Exclusion stricte
        if (forbidden.includes(t)) return false;
        // Exclusion si commence par un mot interdit suivi d'un espace (ex: "Free Plan")
        if (forbidden.some(f => t.startsWith(f + " "))) return false;
        return true;
      };

      // 1. Chercher dans un conteneur 'grow' (structure fournie par l'utilisateur)
      for (const el of truncates) {
        let parent = el.parentElement;
        while (parent && parent !== profileBtn) {
          if (parent.classList.contains('grow')) {
            const text = el.innerText.trim();
            if (isIdentity(text)) {
               console.log("AgregLLM Debug: Identity found in grow container:", text);
               return text;
            }
          }
          parent = parent.parentElement;
        }
      }

      // 2. Fallback : premier qui n'est pas interdit
      for (const el of truncates) {
        const text = el.innerText.trim();
        if (isIdentity(text)) {
           console.log("AgregLLM Debug: Identity found in fallback:", text);
           return text;
        }
      }
    }
  }
  return undefined;
}

// --- Auto-exécution au chargement ---
function init() {
  if (detectError()) {
    console.log("AgregLLM: Erreur détectée sur la page, vérification du compte...");
    if (browser && browser.runtime && browser.runtime.sendMessage) {
      browser.runtime.sendMessage({ action: "get_account_email", url: window.location.href }, (response) => {
        const stored = (response && response.accountEmail) ? response.accountEmail : undefined;
        console.log("AgregLLM: Aide à la reconnexion. Propriétaire attendu:", stored);
        showLoginHelper(stored);
      });
    }
  }
}

// On attend un peu que le DOM soit chargé et les scripts du LLM exécutés (pour les erreurs asynchrones)
function startDetection() {
  init();
  // Observer les changements du DOM pour les erreurs qui apparaissent après le chargement initial
  const observer = new MutationObserver((mutations) => {
    if (detectError()) {
      init();
      observer.disconnect(); // On a trouvé l'erreur, on arrête d'observer
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Timeout de sécurité pour arrêter l'observation après 10 secondes
  setTimeout(() => observer.disconnect(), 10000);
}

setTimeout(startDetection, 2000);
