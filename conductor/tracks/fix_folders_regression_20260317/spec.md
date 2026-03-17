# Spécification du Track : Correction de l'Écrasement des Dossiers par l'Extension

## Aperçu
Le bug de repositionnement des liens à la racine est causé par un conflit de synchronisation. Le script d'arrière-plan (`background.js`) de l'extension écrase le stockage de la Webapp avec une liste de conversations ne contenant pas les informations de dossiers, annulant ainsi l'organisation faite par l'utilisateur dans la Webapp.

## Objectifs
1.  **Empêcher l'écrasement aveugle** : Supprimer la logique dans `background.js` qui injecte la liste complète des conversations directement dans le `localStorage` de la Webapp.
2.  **Centraliser la synchronisation** : Utiliser `sync.js` (injecté dans la Webapp) comme seul responsable de la fusion des données entre le stockage de l'extension et celui de la Webapp.
3.  **Préserver l'intégrité des données** : Garantir que les métadonnées spécifiques à la Webapp (`folderId`, `isFavorite`, `tags` manuels) ne sont jamais perdues lors d'une capture par l'extension.

## Exigences Fonctionnelles
-   **Mise à jour de `background.js`** :
    -   Retirer le bloc d'injection de code qui fait `localStorage.setItem('agregllm_conversations', ...)` dans les onglets de la Webapp.
    -   Remplacer par un simple message envoyé à l'onglet Webapp via `browser.tabs.sendMessage(tab.id, { action: "sync" })` pour notifier `sync.js` qu'une nouvelle donnée est disponible.
-   **Mise à jour de `sync.js`** :
    -   S'assurer qu'il réagit bien au message `sync`.
    -   Améliorer la logique de comparaison pour mettre à jour l'entrée dans `webConversations` même si seuls les messages ont changé (ou d'autres champs bruts), tout en gardant les métadonnées Webapp.

## Critères d'Acceptation
-   [ ] Classer un lien dans un dossier dans la Webapp.
-   [ ] Capturer un nouveau lien (ou le même lien mis à jour) via l'extension.
-   [ ] Vérifier que le lien précédemment classé est TOUJOURS dans son dossier dans la Webapp.
-   [ ] Vérifier que le nouveau lien apparaît bien dans la Webapp (à la racine ou auto-classé par la Webapp).
