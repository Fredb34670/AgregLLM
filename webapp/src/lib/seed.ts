import { storage } from './storage';

export const seedData = () => {
  // Les données de démonstration ont été supprimées à la demande de l'utilisateur.
  const existing = storage.getAllConversations();
  if (existing.length > 0) return;
  
  // On laisse vide pour un démarrage propre.
};