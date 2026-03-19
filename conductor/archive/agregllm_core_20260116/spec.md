# Spécification Technique - Track "Construire le cœur d'AgregLLM"

## 1. Objectif de la Track
L'objectif de cette track est de développer le Produit Minimum Viable (MVP) d'AgregLLM. Cela inclut la création d'une extension de navigateur fonctionnelle pour capturer les conversations ChatGPT, ainsi qu'une application web de base permettant de lister et de visualiser ces conversations.

## 2. Portée Fonctionnelle
### 2.1 Extension de Navigateur (pour ChatGPT)
- Détection automatique de la page de conversation ChatGPT.
- Affichage d'une option de confirmation à l'utilisateur pour enregistrer la discussion.
- Capture et enregistrement des données clés de la conversation : URL, titre (auto-généré ou page title), date de création, LLM d'origine (ChatGPT).
- Communication sécurisée avec l'application web pour le stockage local des données.
- Technologie : Vanilla JavaScript, HTML, CSS (Manifest V3).

### 2.2 Application Web AgregLLM
- Affichage d'une liste paginée des conversations enregistrées.
- Possibilité de visualiser le contenu (lien vers ChatGPT) et les métadonnées de chaque conversation.
- Fonctionnalité de recherche plein texte sur les titres et descriptions des conversations.
- Fonctionnalité de tri des conversations par date de création ou par titre.
- Technologie : React, Shadcn UI, TypeScript.

## 3. Portée Non-Fonctionnelle
- **Expérience Utilisateur :** Design clair, moderne, navigation intuitive et rapide. L'enregistrement des conversations doit être asynchrone (enregistrer maintenant, organiser plus tard).
- **Performance :** L'extension doit être légère et ne pas impacter les performances du navigateur. L'application web doit être réactive.
- **Gestion des Données :** Stockage local des données dans le navigateur de l'utilisateur.

## 4. Hors de Portée pour cette Track (pour les tracks futures)
- Backend de synchronisation optionnelle (Node.js, Supabase).
- Fonctionnalités d'organisation avancée (tags, dossiers, catégorisation automatique).
- Prise en charge d'autres LLM (Gemini, Claude, etc.).
- Fonctionnalités bonus (résumé IA, export, partage, statistiques).
