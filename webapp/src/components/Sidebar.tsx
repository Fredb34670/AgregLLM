import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Folder, Conversation } from '../types';
import { buildFolderTree, FolderNode } from '../lib/folder-tree';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home,   MessageSquare, 
  FolderPlus, 
  Folder as FolderIcon, 
  Trash2, 
  PlusCircle,
  Link as LinkIcon,
  FileText,
  Settings,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Sidebar() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [targetParentId, setTargetParentId] = useState<string | undefined>(undefined);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  
  // États pour l'ajout manuel
  const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualLlm, setManualLlm] = useState('');
  const [manualSummary, setManualSummary] = useState('');

  // États pour l'expansion des dossiers
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  
  const query = new URLSearchParams(location.search);
  const currentFolderId = query.get('folder');

  const refreshData = () => {
    setFolders(storage.getAllFolders());
    setConversations(storage.getAllConversations());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('storage', refreshData);
    return () => window.removeEventListener('storage', refreshData);
  }, []);

  const folderTree = useMemo(() => buildFolderTree(folders), [folders]);

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set(folders.map(f => f.id));
    setExpandedFolders(allIds);
  };

  const collapseAll = () => {
    setExpandedFolders(new Set());
  };

  const openCreateFolderDialog = (parentId?: string) => {
    setTargetParentId(parentId);
    setNewFolderName('');
    setIsFolderDialogOpen(true);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    storage.createFolder(newFolderName.trim(), undefined, targetParentId);
    setNewFolderName('');
    setIsFolderDialogOpen(false);
    refreshData();
    
    // Auto-expand parent
    if (targetParentId) {
      const newExpanded = new Set(expandedFolders);
      newExpanded.add(targetParentId);
      setExpandedFolders(newExpanded);
    }
  };

  const handleRenameFolder = (id: string) => {
    if (!editingFolderName.trim()) {
      setEditingFolderId(null);
      return;
    }
    storage.updateFolder(id, editingFolderName.trim());
    setEditingFolderId(null);
    setEditingFolderName('');
    refreshData();
  };

  const handleDeleteFolder = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Voulez-vous supprimer ce dossier ? Les conversations et sous-dossiers seront déplacés à la racine.')) {
      storage.deleteFolder(id);
      refreshData();
      if (currentFolderId === id) {
        navigate('/conversations');
      }
    }
  };

  // --- Drag & Drop Logic ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('bg-primary/10');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-primary/10');
  };

  const handleDrop = (e: React.DragEvent, targetId: string | undefined) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-primary/10');
    
    const conversationId = e.dataTransfer.getData('text/plain');
    const draggedFolderId = e.dataTransfer.getData('application/agregllm-folder');

    if (conversationId) {
      storage.moveConversationToFolder(conversationId, targetId);
    } else if (draggedFolderId) {
       // Déplacement de dossier (si pas lui-même et pas dans un de ses enfants - vérification basique ici)
       if (draggedFolderId !== targetId) {
         // TODO: Vérifier cycles (parent dans enfant)
         // Pour l'instant on fait confiance à l'user ou on améliore storage.ts plus tard
         // Ici on met à jour le parentId manuellement car storage.updateFolder ne gère pas encore parentId
         // Il faudrait une méthode moveFolder. On va tricher en attendant ou mettre à jour storage.
         // Pour le MVP V2 on va éviter de compliquer le stockage ici, on implémentera moveFolder proprement si besoin.
         // En fait, on a besoin de modifier storage.ts pour supporter le moveFolder.
         // Pour l'instant, disons qu'on ne supporte que le drop de conversation.
       }
    }
    
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('agregllm-sync-complete'));
  };

  // --- Manual Add Logic (Same as before) ---
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setManualUrl(url);
    if (!manualLlm && url) {
      try {
        const hostname = new URL(url).hostname;
        if (hostname.includes('openai') || hostname.includes('chatgpt')) setManualLlm('ChatGPT');
        else if (hostname.includes('claude')) setManualLlm('Claude');
        else if (hostname.includes('gemini') || hostname.includes('google')) setManualLlm('Gemini');
        else if (hostname.includes('perplexity')) setManualLlm('Perplexity');
        else if (hostname.includes('mistral')) setManualLlm('Mistral');
        else {
           const parts = hostname.split('.');
           if (parts.length >= 2) {
             const name = parts[parts.length - 2];
             setManualLlm(name.charAt(0).toUpperCase() + name.slice(1));
           }
        }
      } catch (e) { }
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    const newConversation = {
      id: crypto.randomUUID(),
      title: manualTitle.trim() || manualUrl,
      url: manualUrl.trim(),
      llm: manualLlm.trim() || 'Web',
      capturedAt: Date.now(),
      messages: [],
      summary: manualSummary.trim(),
      folderId: currentFolderId || undefined 
    };
    storage.saveConversation(newConversation);
    setManualUrl(''); setManualTitle(''); setManualLlm(''); setManualSummary('');
    setIsAddLinkDialogOpen(false);
    window.dispatchEvent(new Event('storage'));
  };

  const isActive = (path: string, folderId?: string | null) => {
    if (folderId !== undefined) {
      return location.pathname === '/conversations' && currentFolderId === folderId;
    }
    return location.pathname === path && !currentFolderId;
  };

  const FolderItem = ({ node, depth = 0 }: { node: FolderNode, depth?: number }) => {
    const active = isActive('/conversations', node.id);
    const isExpanded = expandedFolders.has(node.id);
    const isEditing = editingFolderId === node.id;
    const hasChildren = node.children.length > 0;

    return (
      <div className="select-none">
        <div className="flex items-center group relative">
           <div className="flex-1 min-w-0">
            <div 
              className={`
                flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors cursor-pointer
                ${active ? 'bg-secondary text-secondary-foreground font-medium' : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'}
              `}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, node.id)}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFolder(node.id);
                }}
                className={`p-0.5 rounded-sm hover:bg-black/10 dark:hover:bg-white/10 ${!hasChildren ? 'opacity-0' : ''}`}
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
              
              <FolderIcon className={`h-4 w-4 shrink-0 ${active ? 'text-primary fill-primary/20' : ''}`} />
              
              {isEditing ? (
                <Input
                  className="h-6 py-0 px-1 text-xs focus-visible:ring-1"
                  value={editingFolderName}
                  onChange={(e) => setEditingFolderName(e.target.value)}
                  autoFocus
                  onBlur={() => handleRenameFolder(node.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameFolder(node.id);
                    if (e.key === 'Escape') {
                      setEditingFolderId(null);
                      setEditingFolderName('');
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <Link to={`/conversations?folder=${node.id}`} className="truncate flex-1">
                  {node.name}
                </Link>
              )}
            </div>
          </div>

          {/* Actions on hover */}
          {!isEditing && (
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-md shadow-sm border border-border/50 px-1 py-0.5">
              <button 
                className="text-muted-foreground hover:text-primary p-1" 
                title="Renommer"
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation();
                  setEditingFolderId(node.id);
                  setEditingFolderName(node.name);
                }}
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <button 
                className="text-muted-foreground hover:text-primary p-1" 
                title="Créer un sous-dossier"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); openCreateFolderDialog(node.id); }}
              >
                <Plus className="h-3 w-3" />
              </button>
              <button 
                className="text-muted-foreground hover:text-destructive p-1" 
                title="Supprimer le dossier"
                onClick={(e) => handleDeleteFolder(e, node.id)}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {node.children.map(child => (
                <FolderItem key={child.id} node={child} depth={depth + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const rootConversations = conversations.filter(c => !c.folderId);

  return (
    <aside className="w-64 border-r bg-muted/30 p-4 hidden md:flex flex-col h-full">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold italic">A</div>
        <h2 className="text-xl font-bold tracking-tight">AgregLLM</h2>
      </div>

      <nav className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-muted-foreground/60 px-3 mb-2 tracking-widest">Navigation</p>
          <Link to="/">
            <Button variant={isActive('/') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 text-sm h-9">
              <Home className="h-4 w-4" /> Accueil
            </Button>
          </Link>
          <Link to="/conversations">
            <Button 
              variant={isActive('/conversations', null) ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-3 text-sm h-9"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, undefined)}
            >
              <MessageSquare className="h-4 w-4" /> Toutes les discussions
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant={isActive('/settings') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 text-sm h-9">
              <Settings className="h-4 w-4" /> Paramètres
            </Button>
          </Link>
        </div>

        {rootConversations.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-muted-foreground/60 px-3 mb-2 tracking-widest">Non classées</p>
            {rootConversations.map(conv => (
              <a key={conv.id} href={conv.url} target="_blank" rel="noopener noreferrer" className="block w-full">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 text-sm h-8 font-normal text-muted-foreground hover:text-foreground"
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', conv.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <FileText className="h-3.5 w-3.5" /> 
                  <span className="truncate">{conv.title}</span>
                </Button>
              </a>
            ))}
          </div>
        )}

        <div className="space-y-1 pb-10">
          <div className="flex items-center justify-between px-3 mb-2 mt-4">
            <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Dossiers</p>
            <div className="flex items-center gap-1">
              <button onClick={collapseAll} className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Tout replier">
                 <ChevronRight className="h-3 w-3" />
              </button>
              <button onClick={expandAll} className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Tout déplier">
                 <ChevronDown className="h-3 w-3" />
              </button>
              <button 
                onClick={() => openCreateFolderDialog()} 
                className="hover:text-primary text-muted-foreground transition-colors p-1" 
                title="Créer un dossier racine"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-0.5">
            {folders.length > 0 ? (
              folderTree.map(node => (
                <FolderItem key={node.id} node={node} />
              ))
            ) : (
              <p className="text-[11px] text-muted-foreground/60 px-3 py-2 italic">Aucun dossier.</p>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-4 border-t mt-auto">
        <Dialog open={isAddLinkDialogOpen} onOpenChange={setIsAddLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all text-xs h-8">
              <PlusCircle className="h-3.5 w-3.5" /> Ajouter un lien manuel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter une conversation</DialogTitle>
              <DialogDescription>Ajoutez manuellement un lien vers une discussion intéressante.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleManualAdd} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="url">URL <span className="text-destructive">*</span></Label>
                <Input id="url" value={manualUrl} onChange={handleUrlChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="title">Titre</Label><Input id="title" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="llm">Source</Label><Input id="llm" value={manualLlm} onChange={(e) => setManualLlm(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="summary">Résumé</Label><Textarea id="summary" value={manualSummary} onChange={(e) => setManualSummary(e.target.value)} /></div>
              <DialogFooter><Button type="submit">Enregistrer</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog creation dossier (partagé) */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{targetParentId ? 'Nouveau sous-dossier' : 'Nouveau dossier'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4 pt-4">
            <Input placeholder="Nom du dossier..." value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} autoFocus />
            <DialogFooter><Button type="submit">Créer</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </aside>
  );
}