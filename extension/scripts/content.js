// content.js - Script injecté dans les pages ChatGPT

/**
 * Crée et injecte le bouton "Sauvegarder dans AgregLLM" dans la page.
 */
function injectAgregLLMButton() {
  // Vérifier si le bouton existe déjà pour ne pas le dupliquer
  if (document.getElementById('agregllm-save-button')) {
    return;
  }

  const saveButton = document.createElement('button');
  saveButton.id = 'agregllm-save-button';
  saveButton.innerText = 'Sauvegarder dans AgregLLM';
  saveButton.style.position = 'fixed';
  saveButton.style.top = '20px';
  saveButton.style.right = '20px';
  saveButton.style.zIndex = '9999';
  saveButton.style.padding = '10px';
  saveButton.style.backgroundColor = '#7159c1';
  saveButton.style.color = 'white';
  saveButton.style.border = 'none';
  saveButton.style.borderRadius = '5px';
  saveButton.style.cursor = 'pointer';

  saveButton.addEventListener('click', async () => {
    console.log('Save button clicked!');
    const conversationData = captureConversationData();
    try {
      await saveConversationData(conversationData);
      console.log('Conversation data saved successfully!');
      // On pourrait ici changer l'état du bouton (ex: "Sauvegardé ✓")
      saveButton.innerText = 'Sauvegardé ✓';
      saveButton.disabled = true;
    } catch (error) {
      console.error('Failed to save conversation data:', error);
      // Afficher une erreur à l'utilisateur
    }
  });

  document.body.appendChild(saveButton);

  console.log('AgregLLM save button injected.');
}

/**
 * Sauvegarde les données d'une conversation dans le stockage local de l'extension.
 * @param {object} dataToSave - L'objet de données de la conversation à sauvegarder.
 * @returns {Promise<void>}
 */
function saveConversationData(dataToSave) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('conversations', (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      const conversations = result.conversations || [];
      // Ajoute un ID unique pour une gestion future
      dataToSave.id = `agregllm-${Date.now()}`;
      conversations.push(dataToSave);
      chrome.storage.local.set({ conversations }, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    });
  });
}

/**
 * Capture les données de la conversation depuis la page.
 * @returns {object} Un objet contenant les données de la conversation.
 */
function captureConversationData() {
  // C'est une estimation. L'élément réel du titre peut changer.
  const titleElement = document.querySelector('h1');
  const title = titleElement ? titleElement.innerText : 'Titre non trouvé';

  return {
    title: title,
    url: window.location.href,
    llm: 'ChatGPT',
    savedAt: new Date().toISOString()
  };
}

/**
 * Point d'entrée principal du script de contenu.
 */
function main() {
  // Importer la logique de détection d'URL
  // Note: Dans une extension, les scripts partagent le contexte,
  // ou il faudrait charger le script via le manifest. Pour l'instant, on suppose l'accès.
  if (typeof isChatGPTConversationURL === 'function' && isChatGPTConversationURL(window.location.href)) {
    console.log('ChatGPT conversation URL detected. Injecting UI...');
    injectAgregLLMButton();
  }
}

// Lancer le script principal.
// Il faut aussi gérer les navigations côté client de ChatGPT qui ne rechargent pas la page.
// On utilisera un MutationObserver pour cela dans une future tâche.
main();

