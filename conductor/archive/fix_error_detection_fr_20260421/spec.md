# Spécification : Correction de la détection d'erreur et capture de compte (FR)

## Aperçu
L'implémentation initiale ne détecte pas les erreurs ChatGPT en français et échoue souvent à capturer l'e-mail du compte. Ce track vise à fiabiliser la détection (notamment pour les erreurs de chargement de discussion inter-comptes) et à capturer le nom d'utilisateur si l'e-mail est introuvable.

## Exigences Fonctionnelles
1.  **Détection multilingue** : Ajouter le support des messages d'erreur en français dans `detectError` :
    - "Impossible de charger la conversation"
    - "Impossible de charger la discussion" (souvent lié à un accès via un autre compte).
2.  **Identifiant de secours** : Lors de la capture, si l'e-mail est introuvable, capturer le nom d'utilisateur (ex: "Adocart") présent dans le bouton de profil en bas à gauche.
3.  **Interface d'aide mise à jour** : La modale doit afficher l'identifiant disponible (Email ou Nom) pour aider l'utilisateur à identifier quel compte utiliser.

## Critères d'Acceptation
- [ ] La modale s'affiche sur une page ChatGPT affichant "Impossible de charger la conversation" ou "Impossible de charger la discussion".
- [ ] La capture enregistre soit l'e-mail, soit le nom du profil.
- [ ] Les tests unitaires couvrent les nouveaux messages d'erreur en français.
