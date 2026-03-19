# Specification: Automatic Synchronization and Tooltip Track

## Overview
Ce track vise à rendre la synchronisation avec Google Drive totalement transparente pour l'utilisateur. Il automatise le chargement des données lors de la connexion et la sauvegarde immédiate lors de chaque modification locale. De plus, il améliore l'interface des paramètres en ajoutant une info-bulle explicative au bouton de synchronisation manuelle.

## Functional Requirements
- **Chargement automatique au login** : Dès qu'un événement de connexion réussie (`agregllm-gdrive-auth-success`) est détecté, l'application doit déclencher un `autoLoad` pour récupérer les conversations et dossiers depuis le cloud.
- **Auto-Sync réactivé** : Réactiver l'appel à `gdrive.autoSync` dans `webapp/src/lib/storage.ts` qui avait été désactivé lors des phases de test local. La sauvegarde doit être immédiate après chaque modification locale (ajout, suppression, renommage, favori, etc.).
- **Info-bulle explicative (Tooltip)** :
    - Emplacement : Bouton "Sync" dans la page des paramètres.
    - Contenu : "Synchronisation manuelle forcée, Mettre à jour maintenant"
    - Comportement : S'affiche au survol (hover) du bouton.
    - Style : Utiliser le composant Tooltip de Shadcn UI (basé sur Radix UI).

## Non-Functional Requirements
- **Robustesse** : La synchronisation automatique ne doit pas bloquer l'interface utilisateur.
- **UX** : L'utilisateur ne doit plus avoir à se soucier de cliquer sur "Sync" pour que ses données soient en sécurité sur le cloud.

## Acceptance Criteria
- [ ] Une connexion réussie déclenche immédiatement le chargement des données distantes.
- [ ] Toute modification locale (ex: créer un dossier) déclenche un appel réseau vers Google Drive.
- [ ] Le bouton "Sync" affiche un tooltip stylisé au survol avec le texte correct.
- [ ] La synchronisation manuelle via le bouton "Sync" reste fonctionnelle comme solution de secours.

## Out of Scope
- Gestion complexe des conflits de fusion (on garde la logique actuelle de fusion par ID/URL).
- Synchronisation en temps réel entre plusieurs onglets via le cloud (on se limite à la sauvegarde/chargement au login et aux actions).
