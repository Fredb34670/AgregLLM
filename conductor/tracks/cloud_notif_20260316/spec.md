# Specification: Cloud Connection Notification Track

## Overview
Ce track consiste à informer l'utilisateur de l'état de sa synchronisation cloud au sein de l'application AgregLLM. Si l'utilisateur n'est pas connecté à son compte Google/Cloud, un bandeau d'avertissement permanent s'affichera en haut de l'interface pour lui signaler que ses discussions ne sont sauvegardées que localement et ne seront pas disponibles sur d'autres appareils.

## Functional Requirements
- **Détection de l'état de connexion** : Vérifier si l'utilisateur est authentifié via Supabase ou Google Drive.
- **Affichage du bandeau d'information** :
    - Emplacement : En haut de la liste principale des conversations (au-dessus du filtre/tri).
    - Contenu : "Attention : discussions sauvegardées localement. Connectez-vous à votre compte Google pour les retrouver partout."
    - Style : Alerte informative (ex: fond coloré doux, icône d'avertissement).
- **Action de connexion** : Intégrer un bouton "Se connecter" au sein même du bandeau pour faciliter l'authentification.
- **Persistance** : Le bandeau doit rester visible tant que l'utilisateur n'est pas connecté (pas de bouton "fermer").

## Non-Functional Requirements
- **Réactivité** : Le bandeau doit apparaître ou disparaître instantanément lors d'un changement d'état de connexion.
- **Accessibilité** : Assurer un contraste suffisant pour le texte et le bouton.

## Acceptance Criteria
- [ ] Le bandeau s'affiche correctement lorsque l'utilisateur n'est pas connecté.
- [ ] Le texte correspond exactement à l'option choisie.
- [ ] Le bouton "Se connecter" déclenche le flux d'authentification.
- [ ] Le bandeau disparaît automatiquement dès que l'utilisateur est connecté.
- [ ] Le bandeau est visible sur toutes les vues de la liste principale.

## Out of Scope
- Modification du flux d'authentification lui-même.
- Synchronisation automatique déclenchée par la simple vue du bandeau.
