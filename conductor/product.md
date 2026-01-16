# Initial Concept

**AgregLLM** est une interface centralisée permettant d'agréger, de répertorier et d'organiser les discussions provenant de plusieurs LLM (accessibles via un compte Google).

**Objectifs :**
- Répertorier toutes les discussions en un seul endroit.
- Retrouver facilement une discussion spécifique.
- Trier et catégoriser les discussions.

**Données par discussion :**
- LLM d'origine.
- Date de création.
- Intitulé.
- Bref descriptif.
- Lien vers la discussion.

**Design :**
- Interface claire et moderne.

# Vision du Produit

## 1. Concept Général
AgregLLM est une **application web** conçue pour centraliser, organiser et retrouver facilement les discussions de l'utilisateur avec divers modèles de langage (LLM). L'objectif est de fournir une interface unique, claire et moderne pour gérer un historique de conversation potentiellement dispersé sur plusieurs plateformes.

## 2. Acquisition des Données
- L'alimentation principale des données se fera via une **extension de navigateur** (compatible avec les navigateurs modernes comme Chrome, Firefox, Edge).
- L'extension détectera la navigation sur une page de discussion d'un LLM supporté.
- Une **confirmation de l'utilisateur** (via une notification ou un bouton discret) sera requise pour enregistrer la discussion dans AgregLLM, évitant ainsi toute sauvegarde non désirée.

## 3. Plateformes Supportées
- La version initiale se concentrera sur l'agrégation des discussions de **ChatGPT (OpenAI)**.
- Il est prévu de rendre la liste des LLM supportés **configurable par l'utilisateur** directement dans les paramètres de l'extension, permettant d'ajouter ou de désactiver des plateformes (comme Gemini, Claude, etc.) dans le futur.

## 4. Organisation et Gestion
L'application offrira un système d'organisation multi-facettes pour une flexibilité maximale :
- **Mots-clés / Tags** : Les utilisateurs pourront assigner un ou plusieurs tags personnalisés à chaque discussion.
- **Dossiers / Collections** : Les utilisateurs pourront créer des dossiers thématiques pour regrouper manuellement des discussions apparentées.
- **Catégorisation Automatique (Fonctionnalité Avancée)** : L'application pourra analyser le contenu des discussions pour suggérer intelligemment des catégories (ex: "Code", "Marketing", "Traduction"), que l'utilisateur pourra accepter ou modifier.

## 5. Interface et Expérience Utilisateur (UI/UX)
- Le design sera **clair, moderne et épuré**.
- La priorité absolue sera donnée à une **navigation intuitive et rapide**. L'utilisateur doit pouvoir trouver, filtrer et accéder à ses discussions en un minimum d'étapes.
- Les outils de recherche, de tri et de filtrage (par tag, par dossier, par date) seront facilement accessibles.