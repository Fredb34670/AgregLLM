# Plan d'Implémentation - Track "Polissage et Améliorations"

## Phase 1 : Sécurité des Données (Export/Import)

- [x] Task: Créer la page "Paramètres" et le service d'Export JSON
    - Créer un composant `Settings.tsx`.
    - Implémenter la fonction `exportData()` dans `storage.ts` qui génère un Blob JSON.
    - Ajouter le bouton "Exporter" dans l'UI.
- [x] Task: Implémenter le service d'Import JSON
    - Ajouter un input file pour charger le JSON.
    - Implémenter la logique de validation et de fusion/restauration dans `storage.ts`.
    - Gérer les erreurs (fichier invalide).
- [~] Task: Conductor - User Manual Verification 'Sécurité des Données' (Protocol in workflow.md)

## Phase 2 : Refonte des Dossiers (Arborescence)

- [x] Task: Mise à jour du modèle de données (Support des sous-dossiers)
    - Ajouter `parentId` au type `Folder`.
    - Mettre à jour `storage.ts` pour gérer la création de sous-dossiers.
- [x] Task: Composant Sidebar Récursif
    - Refactorer `Sidebar.tsx` pour utiliser un composant `FolderItem` récursif.
    - Implémenter le dépliage/repliage (état local).
    - Ajouter les boutons globaux "Expand/Collapse All".
- [x] Task: Drag & Drop des Dossiers
    - Permettre de glisser un dossier sur un autre pour le déplacer.
    - Gérer les cycles (empêcher de déplacer un parent dans son enfant).
- [~] Task: Conductor - User Manual Verification 'Refonte des Dossiers'

## Phase 3 : Améliorations UI/UX et Tags

- [x] Task: Page de Gestion des Tags
    - Créer une section dans "Paramètres" pour lister tous les tags.
    - Permettre l'édition (renommage) et la suppression.
- [x] Task: Animations et Polissage Visuel
    - Intégrer `framer-motion`.
    - Ajouter des transitions sur les listes et les modales.
- [~] Task: Conductor - User Manual Verification 'UI/UX et Tags'

## Phase 4 : Extension Avancée

- [x] Task: Détection d'URL existante (Extension)
    - Mettre à jour `content.js` pour vérifier si l'URL est déjà stockée (via message au background/webapp).
    - Changer l'état visuel du bouton ou de l'icône.
- [x] Task: Édition pré-sauvegarde (Popup)
    - Modifier la popup pour afficher un formulaire pré-rempli au lieu de sauvegarder immédiatement.
- [x] Task: Conductor - User Manual Verification 'Extension Avancée' [05b20d8]
