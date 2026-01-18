# Spécifications - Polissage et Améliorations

## 1. Sécurité des Données
- **Export JSON :** Permettre à l'utilisateur de télécharger un fichier `.json` contenant toutes ses conversations et dossiers.
- **Import JSON :** Permettre de restaurer une sauvegarde (avec gestion des doublons ou écrasement).

## 2. Gestion Avancée des Dossiers
- **Sous-dossiers :** Structure arborescente (un dossier peut avoir un parent).
- **Interface Sidebar :**
    - Affichage hiérarchique récursif.
    - Bouton "+" au survol pour créer un sous-dossier rapidement.
    - Indicateur visuel (ou badge) s'il y a des liens non lus ou totaux (optionnel).
    - Actions globales : "Tout déplier" / "Tout replier".
- **Drag & Drop :** Déplacer un dossier dans un autre.

## 3. UI/UX & Tags
- **Animations :** Transitions fluides (framer-motion).
- **Gestion des Tags :** Page de paramètres pour renommer/supprimer/fusionner des tags.
- **Mode Sombre :** Vérification et amélioration des contrastes.

## 4. Extension Browser
- **Détection :** L'icône change si l'URL est déjà dans la base.
- **Popup Avancée :** Formulaire éditable (Titre, Tags, Résumé) avant de confirmer la sauvegarde.
