# Spécification : Correction de la détection d'erreur et capture de compte (FR)

## Aperçu
L'implémentation initiale ne détecte pas les erreurs ChatGPT en français et échoue souvent à capturer l'e-mail du compte. Ce track vise à fiabiliser la détection et à capturer le nom d'utilisateur si l'e-mail est introuvable.

## Exigences Fonctionnelles
1.  **Détection multilingue** : Ajouter le support des messages d'erreur en français ("Impossible de charger la conversation") dans `detectError`.
2.  **Identifiant de secours** : Lors de la capture, si l'e-mail est introuvable, capturer le nom d'utilisateur (ex: "Adocart") présent dans le bouton de profil en bas à gauche.
3.  **Interface d'aide mise à jour** : La modale doit afficher l'identifiant disponible (Email ou Nom).

## Critères d'Acceptation
- [ ] La modale s'affiche sur une page ChatGPT affichant "Impossible de charger la conversation".
- [ ] La capture enregistre soit l'e-mail, soit le nom du profil.
- [ ] Les tests unitaires couvrent les messages d'erreur en français.
