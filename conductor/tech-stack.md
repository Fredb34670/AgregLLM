# Stack Technologique - AgregLLM

Ce document détaille la stack technologique choisie pour le développement de l'application AgregLLM.

## 1. Frontend (Application Web)
- **Framework Principal :** **React**. Un choix robuste et populaire pour construire des interfaces utilisateur dynamiques et complexes.
- **Langage :** L'utilisation de **TypeScript** est fortement recommandée avec React pour la robustesse et la maintenabilité du code.
- **Styling et Composants UI :** **Shadcn UI**. Cette bibliothèque fournit des composants accessibles et personnalisables, basés sur Tailwind CSS, ce qui est parfait pour créer un design "clair et moderne" rapidement.

## 2. Backend (Synchronisation Optionnelle)
- **Framework Principal :** **Node.js** avec un framework comme **Express.js** ou **NestJS**. Cela permet une intégration fluide avec le frontend JavaScript et une grande flexibilité pour créer l'API.
- **Langage :** TypeScript.
- **Authentification :** Une bibliothèque comme **Passport.js** avec une stratégie JWT (JSON Web Tokens) sera utilisée pour sécuriser les comptes utilisateurs pour la synchronisation.

## 3. Base de Données
- **Service :** **Supabase**.
- **Technologie sous-jacente :** **PostgreSQL**.
- **Justification :** Supabase a été choisi pour son généreux **niveau gratuit**, sa facilité de mise en place, et parce qu'il fournit non seulement une base de données PostgreSQL mais aussi des services d'authentification prêts à l'emploi.

## 4. Extension de Navigateur
- **Technologie :** **Vanilla JavaScript (JS pur)**, HTML et CSS.
- **Justification :** Cette approche est privilégiée pour garantir que l'extension reste **légère, rapide et performante**, minimisant son impact sur les performances du navigateur.
- **Manifest :** L'extension sera développée en suivant les standards du **Manifest V3**.

## 5. Hébergement et Déploiement (Suggestion)
- **Frontend :** Vercel ou Netlify, qui offrent d'excellents niveaux gratuits pour les applications React.
- **Backend :** Render ou Heroku pour héberger l'application Node.js, qui proposent également des niveaux gratuits.
- **Base de Données :** Gérée directement par Supabase.
