c## Cahier des Charges : Application "BentoFlow" - Tableau de Bord Personnel Interactif

**1. Introduction**
L'application "BentoFlow" (nom suggéré) est un tableau de bord personnel conçu pour offrir une expérience utilisateur optimisée et un accès rapide aux applications, fichiers et outils système. Elle vise à remplacer l'interface de bureau traditionnelle au démarrage de l'ordinateur, offrant une vue centralisée et personnalisable pour améliorer la productivité et la gestion de l'environnement numérique de l'utilisateur.
l'application, les commentaires dans le code ainsi que la documentation,  doivent être en français.

**2. Objectifs de l'Application**
*   Fournir un point d'accès unique et centralisé aux ressources de l'ordinateur.
*   Améliorer la rapidité d'exécution des tâches courantes (lancement d'applications, ouverture de fichiers).
*   Permettre une personnalisation facile et intuitive de l'interface par l'utilisateur.
*   Offrir une expérience utilisateur fluide et agréable.
*   Démarrer automatiquement avec le système d'exploitation.

**3. Fonctionnalités Détaillées**

**3.1. Interface Utilisateur (UI)**
*   **Design "Bento" :** Interface modulaire composée de blocs ("tiles" ou "widgets") personnalisables.
*   **Thèmes :** Possibilité de choisir entre différents thèmes (clair, sombre, personnalisé) et couleurs d'accentuation.
*   **Redimensionnement des Blocs :** Les blocs doivent pouvoir être redimensionnés par l'utilisateur (ex: 1x1, 1x2, 2x2) pour optimiser l'espace.
*   **Positionnement des Blocs :** Les blocs doivent pouvoir être glissés-déposés pour réorganiser leur agencement sur le tableau de bord.

**3.2. Catégories / Blocs Fonctionnels (avec support Drag & Drop pour ajout/réorganisation)**

*   **Bloc "Accès Rapide aux Applications" :**
    *   Liste d'icônes d'applications fréquemment utilisées ou épinglées par l'utilisateur.
    *   **Drag & Drop :** Glisser une application (depuis le bureau, menu Démarrer, explorateur) pour l'ajouter. Glisser hors du bloc pour la supprimer.
    *   **Barre de Recherche Intelligente :** Champ de recherche pour lancer des applications, fichiers, ou effectuer une recherche web (configurable).

*   **Bloc "Gestion de Fichiers Courants" :**
    *   Liste des fichiers récemment ouverts/modifiés.
    *   Section pour épingler des dossiers favoris (ex: Documents, Téléchargements, Projets).
    *   Raccourcis vers des services de stockage Cloud (OneDrive, Google Drive, Dropbox).
    *   **Drag & Drop :** Glisser un fichier/dossier pour l'ajouter aux favoris.

*   **Bloc "Outils Système Rapides" :**
    *   Boutons d'action : Redémarrer, Arrêter, Mettre en veille.
    *   Raccourcis vers les paramètres système clés (Affichage, Son, Réseau, Bluetooth, Gestionnaire de Périphériques).
    *   Bouton de capture d'écran.
    *   Bouton pour lancer un outil de nettoyage de disque (configurable).
    *   Possibilité d'ajouter des raccourcis vers d'autres outils système via Drag & Drop.

*   **Bloc "Notes & Rappels" :**
    *   Mini-éditeur de texte pour des notes rapides, sauvegardées automatiquement.
    *   Liste de tâches/To-Do avec cases à cocher.
    *   Mini-calendrier avec affichage des événements à venir (intégration avec calendrier système ou Google Calendar/Outlook Calendar).
    *   **Drag & Drop :** Glisser du texte externe pour créer une nouvelle note/tâche.

*   **Bloc "Multimédia & Divertissement" :**
    *   Contrôles multimédia (Lecture/Pause, Précédent, Suivant, Volume) pour l'application multimédia en cours.
    *   Raccourcis vers les jeux préférés ou plateformes de jeu (Steam, Epic Games, GOG).
    *   Raccourcis vers des services de streaming vidéo/musique.
    *   **Drag & Drop :** Glisser un jeu ou un lien web pour l'ajouter.

*   **Bloc "Informations Essentielles" (Widgets) :**
    *   Météo locale avec prévisions.
    *   Horloge mondiale.
    *   Indicateur de statut réseau (connecté/déconnecté, nom du réseau).

**3.3. Comportement au Démarrage**
*   L'application doit se lancer automatiquement au démarrage du système d'exploitation.
*   Elle doit apparaître comme l'interface principale, potentiellement masquant le bureau traditionnel (mode "kiosk" léger).
*   Option configurable dans les paramètres pour activer/désactiver le lancement automatique.

**3.4. Gestion des Paramètres**
*   Interface de configuration facile d'accès pour :
    *   Gérer les blocs (ajouter, supprimer, activer/désactiver).
    *   Personnaliser les thèmes et les couleurs.
    *   Configurer les applications par défaut pour certaines actions (ex: quel navigateur pour la recherche web).
    *   Gérer les intégrations (calendrier, services cloud).

**4. Exigences Techniques**

*   **Compatibilité OS :**
    *   Priorité : Windows 10/11
    *   Optionnel : macOS, Linux (distrib. populaires comme Ubuntu, Fedora)
*   **Performance :** L'application doit être légère et réactive, sans impacter significativement les performances du système.
*   **Sécurité :** Ne doit pas collecter de données personnelles sans consentement explicite. Les intégrations doivent utiliser des protocoles sécurisés (OAuth 2.0 pour les services cloud/calendrier).
*   **Persistance des Données :** La configuration de l'utilisateur (agencement des blocs, raccourcis épinglés, notes) doit être sauvegardée localement et automatiquement et restaurée au redémarrage de l'application.
*   **Notifications :** Possibilité d'intégrer des notifications système (ex: rappels de tâches).

**5. Langages et Technologies Suggerées**

Pour construire une telle application, qui combine une interface graphique riche, une interaction avec le système d'exploitation et une bonne performance, voici quelques options viables :

**Technologies Web (Cross-Platform) avec un framework Desktop**
C'est souvent le choix le plus flexible pour des applications modernes avec une belle UI.

*   **Frontend (UI/UX) :**
    *   **HTML, CSS, JavaScript :** Les bases du web pour la structure, le style et l'interactivité.
    *   **Utilisation du MCP server Shadcn :** pour le style de l'interface utilisateur. voir maquette dans \docs\ui\Model_Dashboard.png
    *   **Framework JS (React) :** Pour gérer des interfaces complexes, les états des composants et le rendu dynamique. React ou Vue.js sont d'excellents choix pour des applications interactives.
*   **Backend (pour l'intégration Desktop) :**
    *   **Tauri :** Une alternative plus légère et performante à Electron, utilisant Rust pour le backend et des technologies web pour l'interface. Offre une meilleure empreinte mémoire et des binaires plus petits.

