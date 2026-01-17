// content.js - Version 14.0 (Restauration ChatGPT + Omni-LLM)
const turndownService = new window.TurndownService();

function capture() {
  try {
    const hostname = window.location.hostname;
    let llmName = "ChatGPT";
    if (hostname.includes("claude.ai")) llmName = "Claude";
    if (hostname.includes("gemini.google.com")) llmName = "Gemini";
    if (hostname.includes("aistudio.google.com")) llmName = "AI Studio";

    const titleEl = document.querySelector('h1, [class*="title"], title');
    const title = titleEl.innerText.split('\n')[0].trim();
    let messages = [];

    // --- LOGIQUE SPÉCIFIQUE CHATGPT (Restauration) ---
    if (llmName === "ChatGPT") {
      const turns = Array.from(document.querySelectorAll('[data-testid^="conversation-turn-"]'));
      turns.forEach(turn => {
        const userEl = turn.querySelector('[data-message-author-role="user"]');
        const assistantEl = turn.querySelector('[data-message-author-role="assistant"]');
        if (userEl) messages.push({ role: 'user', content: turndownService.turndown(userEl.innerHTML), y: userEl.getBoundingClientRect().top });
        if (assistantEl) {
          const content = assistantEl.querySelector('.markdown, .prose') || assistantEl;
          messages.push({ role: 'assistant', content: turndownService.turndown(content.innerHTML), y: assistantEl.getBoundingClientRect().top });
        }
      });
    } 
    // --- LOGIQUE GEMINI & AI STUDIO ---
    else {
      // Pour AI Studio, on cherche aussi le prompt initial
      if (llmName === "AI Studio") {
        const initialPrompt = document.querySelector('textarea, .prompt-text-area');
        if (initialPrompt && initialPrompt.value) {
          messages.push({ role: 'user', content: initialPrompt.value.trim(), y: -10000 });
        }
      }

      const selectors = [
        'user-query', 'model-response', // Gemini
        '.user-query-container', '.model-response-container', // AI Studio
        '.request-container', '.response-container', // Legacy
        'article', '.message-content' // Fallbacks
      ];

      const elements = Array.from(document.querySelectorAll(selectors.join(', ')));
      elements.forEach(el => {
        const isUser = el.tagName.toLowerCase().includes('user') || 
                       el.classList.contains('user-query-container') ||
                       el.classList.contains('request-container') ||
                       el.querySelector('.user-query-text') !== null;

        const contentEl = el.querySelector('.markdown, .prose, .message-content, .model-response-text, .user-query-text') || el;
        const markdown = turndownService.turndown(contentEl.innerHTML);

        if (markdown && markdown.length > 1) {
          messages.push({
            role: isUser ? 'user' : 'assistant',
            content: markdown,
            y: el.getBoundingClientRect().top + window.scrollY
          });
        }
      });
    }

    // Tri vertical pour tout le monde
    messages.sort((a, b) => a.y - b.y);

    // Déduplication
    const finalMessages = [];
    const seen = new Set();
    messages.forEach(m => {
      const fingerprint = m.role + m.content.substring(0, 50).replace(/\s/g, '');
      if (fingerprint && !seen.has(fingerprint)) {
        finalMessages.push({ role: m.role, content: m.content });
        seen.add(fingerprint);
      }
    });

    if (finalMessages.length > 0) {
      return {
        data: {
          title: title + " [" + new Date().toLocaleTimeString() + "]",
          url: window.location.href,
          llm: llmName,
          date: new Date().toISOString(),
          summary: finalMessages[0].content.substring(0, 200),
          messages: finalMessages
        }
      };
    }
    return { error: `Aucun message trouvé sur ${llmName}.` };
  } catch (e) {
    return { error: e.message };
  }
}

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "capture") {
    const result = capture();
    if (result.data) alert(`AgregLLM : ${result.data.messages.length} messages capturés.`);
    else alert(`Erreur : ${result.error}`);
    sendResponse(result);
  }
  return true;
});