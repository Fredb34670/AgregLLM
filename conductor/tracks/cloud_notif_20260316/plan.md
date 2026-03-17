# Implementation Plan: Cloud Connection Notification

## Phase 1: Authentication State Detection Logic
L'objectif est de s'assurer que l'application détecte correctement l'état de connexion cloud/Google de l'utilisateur.

- [x] Task: Créer un hook ou utilitaire `useCloudStatus` pour vérifier l'état de synchronisation cloud via Supabase ou Google Drive.
- [x] Task: Ajouter des tests unitaires pour `useCloudStatus` (états connectés et non connectés).
- [x] Task: Conductor - User Manual Verification 'Authentication State Detection Logic' (Protocol in workflow.md) [6ca1e32]

## Phase 2: UI Component: Cloud Notification Banner
L'objectif est de créer le composant visuel de l'alerte informative.

- [x] Task: Développer le composant `CloudNotificationBanner` avec le message synthétisé et le bouton de connexion.
- [x] Task: Ajouter des tests unitaires pour `CloudNotificationBanner` (affichage correct, interaction avec le bouton).
- [x] Task: Conductor - User Manual Verification 'UI Component: Cloud Notification Banner' (Protocol in workflow.md) [3ba2ab5]

## Phase 3: Integration and Visibility Logic
L'objectif est d'intégrer le bandeau dans la liste principale des conversations.

- [x] Task: Insérer `CloudNotificationBanner` dans `ConversationsList.tsx` au-dessus des filtres.
- [x] Task: Ajouter des tests d'intégration pour vérifier l'apparition/disparition du bandeau selon l'état de connexion.
- [x] Task: Conductor - User Manual Verification 'Integration and Visibility Logic' (Protocol in workflow.md) [471ffee]
