# Plan d'implémentation : Édition du titre et affichage résumé

Ce plan détaille les étapes pour permettre l'édition du titre des conversations et ajuster l'affichage des résumés.

## Phase 1 : Logique de Stockage et Tests
- [ ] Task: Écrire les tests pour la modification du titre dans `storage.test.ts`
- [ ] Task: Implémenter `updateConversationTitle` dans `webapp/src/lib/storage.ts`
- [ ] Task: Vérifier que la modification déclenche bien l'auto-synchronisation
- [ ] Task: Conductor - User Manual Verification 'Phase 1 : Logique de Stockage' (Protocol in workflow.md)

## Phase 2 : Interface Utilisateur (UI)
- [ ] Task: Mettre à jour `ConversationsList.tsx` pour inclure l'icône `Pencil` et l'état d'édition
- [ ] Task: Implémenter le basculement en mode édition au clic sur le crayon
- [ ] Task: Implémenter la sauvegarde sur la touche "Entrée" et l'annulation sur "Échap"
- [ ] Task: Ajuster le style du résumé pour utiliser `line-clamp-2` au lieu de `line-clamp-3`
- [ ] Task: Conductor - User Manual Verification 'Phase 2 : Interface Utilisateur' (Protocol in workflow.md)

## Phase 3 : Finalisation et Polissage
- [ ] Task: Vérifier l'accessibilité (focus automatique sur le champ lors de l'édition)
- [ ] Task: Tester sur mobile pour s'assurer que l'icône et le champ d'édition sont utilisables
- [ ] Task: Conductor - User Manual Verification 'Phase 3 : Finalisation' (Protocol in workflow.md)
