# Spécification du Track : Persistance des Dossiers et Environnement Local

## Aperçu
Ce track vise à corriger un bug critique où les conversations perdent leur affectation à un dossier lors du redémarrage de l'extension ou de la synchronisation. Parallèlement, l'environnement sera configuré pour fonctionner exclusivement en local pour faciliter les tests et la validation avant un déploiement futur sur GitHub.

## Objectifs
1.  **Corriger la perte de dossiers** : S'assurer que le champ `folderId` (et `isFavorite`) est préservé lors de la synchronisation entre l'extension et la Webapp.
2.  **Ciblage Local** : Configurer l'extension et la Webapp pour fonctionner sans dépendances externes (GitHub Pages, Google Drive) durant cette phase.
3.  **Validation en Local** : Utiliser un environnement de test local (Vite dev server) pour confirmer la résolution du bug.

## Exigences Fonctionnelles
-   **Mise à jour de `sync.js`** : Modifier la logique de fusion des données pour inclure systématiquement les métadonnées existantes dans la Webapp (`folderId`, `isFavorite`, `tags`, etc.) lorsqu'une conversation capturée par l'extension est mise à jour.
-   **Désactivation des Sync Externes** : Commenter ou désactiver via une variable d'environnement/paramètre les appels à Google Drive dans la Webapp.
-   **Focus sur le stockage local** : Privilégier `browser.storage.local` pour l'extension et `localStorage` pour la Webapp comme sources de vérité.

## Critères d'Acceptation
-   [ ] Créer un dossier dans la Webapp et y placer un lien capturé par l'extension.
-   [ ] Redémarrer l'extension ou rafraîchir la Webapp.
-   [ ] Le lien doit rester à l'intérieur du dossier.
-   [ ] Le statut "Favori" doit également être préservé après synchronisation.
-   [ ] Aucune tentative de connexion à un service externe (GitHub, Drive) ne doit être observée dans la console durant les tests.

## Hors de portée
-   Déploiement sur GitHub Pages (fera l'objet d'un track ultérieur).
-   Correction d'autres bugs non liés à la structure des dossiers ou à la synchronisation de base.
