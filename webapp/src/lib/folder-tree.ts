import { Folder } from '../types';

export interface FolderNode extends Folder {
  children: FolderNode[];
}

export function buildFolderTree(folders: Folder[]): FolderNode[] {
  const map = new Map<string, FolderNode>();
  const roots: FolderNode[] = [];

  // 1. Initialiser tous les noeuds
  folders.forEach(f => {
    map.set(f.id, { ...f, children: [] });
  });

  // 2. Construire l'arbre
  folders.forEach(f => {
    const node = map.get(f.id);
    if (node) {
      if (f.parentId && map.has(f.parentId)) {
        map.get(f.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
  });

  return roots;
}
