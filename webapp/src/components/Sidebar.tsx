import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Folder, Conversation } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Home, 
  MessageSquare, 
  FolderPlus, 
  Folder as FolderIcon, 
  Trash2, 
  PlusCircle,
  Link as LinkIcon,
  FileText
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
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  
  // États pour l'ajout manuel
  const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualLlm, setManualLlm] = useState('');
  const [manualSummary, setManualSummary] = useState('');

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

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    storage.createFolder(newFolderName.trim());
    setNewFolderName('');
    setIsFolderDialogOpen(false);
    refreshData();
  };

  const handleDeleteFolder = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Voulez-vous supprimer ce dossier ? Les conversations seront déplacées à la racine.')) {
      storage.deleteFolder(id);
      refreshData();
      if (currentFolderId === id) {
        navigate('/conversations');
      }
    }
  };

  // Déduction automatique du LLM lors de la saisie de l'URL
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
      } catch (e) {
        // URL invalide, on ignore
      }
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
    
    setManualUrl('');
    setManualTitle('');
    setManualLlm('');
    setManualSummary('');
    setIsAddLinkDialogOpen(false);
    
    window.dispatchEvent(new Event('storage'));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-primary/10');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-primary/10');
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | undefined) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-primary/10');
    
    const conversationId = e.dataTransfer.getData('text/plain');
    if (conversationId) {
      storage.moveConversationToFolder(conversationId, targetFolderId);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('agregllm-sync-complete'));
    }
  };

  const isActive = (path: string, folderId?: string | null) => {
    if (folderId !== undefined) {
      return location.pathname === '/conversations' && currentFolderId === folderId;
    }
    return location.pathname === path && !currentFolderId;
  };

  const isConversationActive = (id: string) => {
     return location.pathname === `/conversations/${id}`;
  };

  const rootConversations = conversations.filter(c => !c.folderId);

  return (
    <aside className="w-64 border-r bg-muted/30 p-4 hidden md:flex flex-col h-full">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold italic">A</div>
        <h2 className="text-xl font-bold tracking-tight">AgregLLM</h2>
      </div>

      <nav className="space-y-6 flex-1 overflow-y-auto pr-2">
        {/* Navigation Principale */}
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-muted-foreground/60 px-3 mb-2 tracking-widest">Navigation</p>
          <Link to="/">
            <Button 
              variant={isActive('/') ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-3 text-sm h-9"
            >
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
        </div>

        {/* Discussions Racine (Non classées) */}
        {rootConversations.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-muted-foreground/60 px-3 mb-2 tracking-widest">Non classées</p>
            {rootConversations.map(conv => (
              <Link key={conv.id} to={`/conversations/${conv.id}`}>
                <Button 
                  variant={isConversationActive(conv.id) ? 'secondary' : 'ghost'} 
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
              </Link>
            ))}
          </div>
        )}

        {/* Dossiers */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-2 mt-4">
            <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Dossiers</p>
            <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
              <DialogTrigger asChild>
                <button className="hover:text-primary text-muted-foreground transition-colors" title="Créer un dossier">
                  <FolderPlus className="h-3.5 w-3.5" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau dossier</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateFolder} className="space-y-4 pt-4">
                  <Input 
                    placeholder="Nom du dossier..." 
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    autoFocus
                  />
                  <DialogFooter>
                    <Button type="submit">Créer</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-0.5">
            {folders.length > 0 ? (
              folders.map(folder => {
                const active = isActive('/conversations', folder.id);
                return (
                  <Link key={folder.id} to={`/conversations?folder=${folder.id}`}>
                    <Button 
                      variant={active ? 'secondary' : 'ghost'} 
                      className={`w-full justify-start gap-3 group h-9 text-sm transition-all duration-200
                        ${active ? 'translate-x-1 border-l-2 border-primary bg-primary/10 text-primary font-medium pl-3' : 'pl-4 hover:pl-5'}
                      `}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, folder.id)}
                    >
                      <FolderIcon className={`h-4 w-4 ${active ? 'text-primary fill-primary/20' : 'text-muted-foreground'}`} />
                      <span className="truncate flex-1">{folder.name}</span>
                      <Trash2 
                        className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:opacity-100 group-hover:text-destructive transition-all" 
                        onClick={(e) => handleDeleteFolder(e, folder.id)}
                      />
                    </Button>
                  </Link>
                );
              })
            ) : (
              <p className="text-[11px] text-muted-foreground/60 px-3 py-2 italic">Aucun dossier.</p>
            )}
          </div>
        </div>
      </nav>

      {/* Footer Sidebar / Ajout Manuel */}
      <div className="pt-4 border-t mt-auto">
        <Dialog open={isAddLinkDialogOpen} onOpenChange={setIsAddLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all text-xs h-8"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Ajouter un lien manuel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter une conversation</DialogTitle>
              <DialogDescription>
                Ajoutez manuellement un lien vers une discussion intéressante.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleManualAdd} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="url">URL de la discussion <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="url"
                    placeholder="https://chatgpt.com/c/..." 
                    value={manualUrl}
                    onChange={handleUrlChange}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input 
                    id="title"
                    placeholder="Titre de la discussion" 
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="llm">Source / LLM</Label>
                  <Input 
                    id="llm"
                    placeholder="Ex: ChatGPT" 
                    value={manualLlm}
                    onChange={(e) => setManualLlm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Résumé / Notes</Label>
                <Textarea 
                  id="summary"
                  placeholder="De quoi parle cette discussion ?" 
                  value={manualSummary}
                  onChange={(e) => setManualSummary(e.target.value)}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}
