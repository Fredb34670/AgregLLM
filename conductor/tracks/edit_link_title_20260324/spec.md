# Specification: Édition du titre et amélioration de l'affichage du résumé

## Overview
Ce track vise à permettre aux utilisateurs de modifier le titre des discussions sauvegardées dans AgregLLM et d'améliorer la lisibilité des résumés dans la liste des conversations en affichant jusqu'à deux lignes de texte.

## Functional Requirements
1.  **Édition du titre du lien** :
    - Ajouter une icône "crayon" à côté de l'icône de suppression (corbeille) dans la liste des conversations.
    - Au clic sur l'icône, le titre de la conversation devient un champ de texte éditable.
    - L'utilisateur peut valider la modification en appuyant sur la touche "Entrée".
    - La modification doit être persistée dans le stockage local et synchronisée via Google Drive (si activé).
2.  **Affichage du résumé** :
    - La zone de résumé dans la liste des conversations doit afficher jusqu'à 2 lignes de texte.
    - Si le résumé est plus long que 2 lignes, il doit être tronqué avec une ellipse (`...`).
    - Si le résumé fait moins de 2 lignes, il s'affiche normalement (pas d'espace vide forcé).

## Non-Functional Requirements
- **Réactivité** : L'interface doit passer instantanément en mode édition.
- **Accessibilité** : Le champ d'édition doit être focalisé automatiquement au clic sur le crayon.
- **Robustesse** : Gérer les cas où le titre est vide (empêcher la sauvegarde ou restaurer le titre précédent).

## Acceptance Criteria
- [ ] Une icône crayon est visible pour chaque conversation dans la liste.
- [ ] Cliquer sur le crayon transforme le titre en `input`.
- [ ] Appuyer sur "Entrée" sauvegarde le nouveau titre et repasse en mode lecture.
- [ ] Appuyer sur "Échap" (Esc) annule la modification et restaure le titre original.
- [ ] Le résumé affiche 2 lignes maximum dans la liste (testable via CSS `line-clamp`).
- [ ] Les modifications de titre sont conservées après rechargement de la page.

## Out of Scope
- Édition du résumé lui-même.
- Édition du titre depuis une page de détail (si elle existe).
- Changement de l'icône ou de la couleur de la conversation (autres que le titre).
