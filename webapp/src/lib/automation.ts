// Utilitaires pour l'automatisation (Tags, Dossiers)

const STOP_WORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'ce', 'cet', 'cette', 'ces',
  'de', 'du', 'des', 'à', 'au', 'aux', 'en', 'par', 'pour', 'sur', 'dans',
  'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car',
  'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
  'est', 'sont', 'avoir', 'être', 'faire', 'dire', 'aller',
  'comment', 'pourquoi', 'quand', 'qui', 'quoi', 'quel', 'quelle',
  'avec', 'sans', 'sous', 'vers', 'chez',
  'chatgpt', 'claude', 'gemini', 'discussion', 'conversation'
]);

export function generateTags(text: string): string[] {
  if (!text) return [];

  // Nettoyage basique
  const cleanText = text.toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .replace(/\s{2,}/g, " ");

  const words = cleanText.split(' ');
  
  // Filtrage
  const candidates = words.filter(word => 
    word.length > 3 && !STOP_WORDS.has(word) && !/^\d+$/.test(word)
  );

  // Comptage de fréquence (optionnel, ici on prend juste les uniques)
  const uniqueWords = [...new Set(candidates)];

  // On retourne les 4 premiers mots significatifs
  return uniqueWords.slice(0, 4);
}

export function findBestFolder(text: string, folders: { id: string, name: string }[]): string | undefined {
  if (!text || folders.length === 0) return undefined;

  const lowerText = text.toLowerCase();
  
  // Cherche si le nom d'un dossier apparaît dans le texte
  const bestMatch = folders.find(folder => 
    lowerText.includes(folder.name.toLowerCase())
  );

  return bestMatch ? bestMatch.id : undefined;
}
