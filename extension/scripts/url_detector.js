// Fichier de logique pour la détection d'URL de ChatGPT

/**
 * Vérifie si une URL donnée est une URL de conversation ChatGPT valide.
 * Le format attendu est https://chat.openai.com/c/<UUID>
 * @param {string} url L'URL à vérifier.
 * @returns {boolean} True si l'URL est une URL de conversation ChatGPT valide, sinon false.
 */
function isChatGPTConversationURL(url) {
  if (!url) {
    return false;
  }
  // Support pour chat.openai.com et chatgpt.com avec format UUID
  const chatGPTPattern = /^https:\/\/(chat\.openai\.com|chatgpt\.com)\/c\/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
  return chatGPTPattern.test(url);
}
