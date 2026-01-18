# Agrégateur de discussions LLM

## 📌 Présentation

Ce projet vise à créer une interface unique, claire et moderne permettant d’agréger et d’organiser des discussions issues de plusieurs LLM, accessibles via un compte Google.

L’objectif n’est pas de stocker ou copier le contenu des conversations, mais de fournir un répertoire centralisé permettant de retrouver facilement une discussion grâce à des métadonnées et un lien direct vers le LLM d’origine.

---

## 🎯 Objectifs

* Centraliser les discussions provenant de différents LLM
* Faciliter la recherche et la navigation dans l’historique des échanges
* Offrir une vue structurée et cohérente, indépendante des interfaces natives des LLM
* Garantir l’intégrité des données en ne dupliquant aucun contenu de discussion

---

## 🧠 LLM pris en charge

Le projet est conçu pour être extensible et compatible avec plusieurs LLM accessibles via Google (exemples non exhaustifs) :

* ChatGPT
* Gemini
* Autres LLM accessibles via un compte Google

Chaque discussion est identifiée par son LLM d’origine.

---

## 🗂️ Fonctionnalités principales

### 📋 Répertoire des discussions

Chaque discussion est représentée par les métadonnées suivantes :

* LLM d’origine
* Date de création de la discussion
* Intitulé de la discussion
* Bref descriptif / résumé
* Lien direct vers la discussion originale

---

### 🔎 Recherche & tri

L’interface permet :

* Le tri par :

  * LLM
  * Date de création
  * Intitulé
* La recherche textuelle (titre, descriptif)
* La catégorisation des discussions (tags, thèmes, statuts, etc.)

---

### 🎨 Interface utilisateur

* Design **clair, moderne et épuré**
* Navigation fluide
* Vue tableau et/ou cartes
* Responsive (desktop / mobile)

---

## 🔐 Gestion des données

* ❌ Aucune copie ou sauvegarde du contenu des conversations
* ✅ Uniquement des métadonnées et des liens
* 🔗 Redirection vers l’interface officielle du LLM pour consulter la discussion

---

## 🛠️ Stack technique (prévisionnelle)

> À adapter selon l’implémentation finale

* **Frontend** : React / Next.js / Vue
* **UI** : Tailwind CSS / Shadcn / Material UI
* **Backend** : Node.js / API serverless
* **Authentification** : Google OAuth
* **Stockage** : Base de données légère (SQLite / Firestore / Supabase)

---

## 🚀 Roadmap

* [ ] Définition du modèle de données
* [ ] Authentification Google
* [ ] Récupération des métadonnées des discussions
* [ ] Interface de listing des discussions
* [ ] Recherche, tri et filtres
* [ ] Système de catégories / tags
* [ ] Améliorations UI/UX

---

## 🧩 Évolutions possibles

* Statistiques d’utilisation des LLM
* Favoris / discussions épinglées
* Export des métadonnées
* Support d’autres fournisseurs de LLM

---

## ✨ Auteur

Développé par BARANES frédéric

N’hésitez pas à contribuer, proposer des idées ou ouvrir une issue 🚀
