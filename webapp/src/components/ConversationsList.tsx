import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Conversation, Folder } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, 
    Trash2, 
    Folder as FolderIcon,
    Star
  } from 'lucide-react';

export function ConversationsList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const currentFolderId = query.get('folder');

  const refreshData = () => {
    setConversations(storage.getAllConversations());
    setFolders(storage.getAllFolders());
  };

  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return folders.find(f => f.id === currentFolderId);
  }, [folders, currentFolderId]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    conversations.forEach(c => {
      (c.tags || []).forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [conversations]);

  const getFolderName = (id?: string) => {
    if (!id) return null;
    return folders.find(f => f.id === id)?.name;
  };

  const handleDelete = (e: React.MouseEvent, conversation: Conversation) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Voulez-vous vraiment supprimer cette discussion ?')) {
      storage.deleteConversation(conversation.id);
      window.dispatchEvent(new CustomEvent('agregllm-delete-request', { 
        detail: { url: conversation.url } 
      }));
      refreshData();
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    storage.toggleFavorite(id);
    refreshData();
  };

  const handleDragStart = (e: React.DragEvent | any, conversationId: string) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', conversationId);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('storage', refreshData);
    window.addEventListener('agregllm-sync-complete', refreshData);
    return () => {
      window.removeEventListener('storage', refreshData);
      window.removeEventListener('agregllm-sync-complete', refreshData);
    };
  }, []);

  const filteredAndSortedConversations = useMemo(() => {
    return conversations
      .filter(conv => {
        const matchesFolder = !currentFolderId || conv.folderId === currentFolderId;
        const matchesSearch = conv.title.toLowerCase().includes(search.toLowerCase()) ||
          conv.llm.toLowerCase().includes(search.toLowerCase()) ||
          (conv.summary && conv.summary.toLowerCase().includes(search.toLowerCase()));
        const matchesTag = !selectedTag || (conv.tags || []).includes(selectedTag);
        const matchesFavorite = !onlyFavorites || conv.isFavorite;
        
        return matchesFolder && matchesSearch && matchesTag && matchesFavorite;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.date || b.capturedAt).getTime() - new Date(a.date || a.capturedAt).getTime();
        } else {
          return a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' });
        }
      });
  }, [conversations, search, sortBy, selectedTag, currentFolderId, onlyFavorites]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">
            {currentFolder ? currentFolder.name : "Toutes les discussions"}
          </h2>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-8 bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-border/40">
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant={selectedTag === null ? 'secondary' : 'outline'}
            className="cursor-pointer border-dashed"
            onClick={() => setSelectedTag(null)}
          >
            Tous les tags
          </Badge>
          {allTags.map(tag => (
            <Badge 
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              className={`cursor-pointer ${selectedTag === tag ? '' : 'bg-primary/5 text-primary border-primary/20 hover:bg-primary/10'}`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              #{tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg">
          <Button 
            variant={onlyFavorites ? 'default' : 'ghost'}
            size="sm"
            className={`h-7 px-2 ${onlyFavorites ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            title="Afficher uniquement les favoris"
          >
            <Star className={`h-3.5 w-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
          </Button>
          <div className="w-[1px] h-4 bg-border/50 mx-1" />
          <Button 
            variant={sortBy === 'date' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setSortBy('date')}
          >
            Récentes
          </Button>
          <Button 
            variant={sortBy === 'title' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setSortBy('title')}
          >
            A-Z
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedConversations.length > 0 ? (
            filteredAndSortedConversations.map((conv) => (
              <motion.div 
                key={conv.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative group"
                draggable="true"
                onDragStart={(e) => handleDragStart(e, conv.id)}
              >
                <a href={conv.url} target="_blank" rel="noopener noreferrer" className="block">
                  <Card className="group/card relative hover:ring-2 hover:ring-primary/20 transition-all border border-border/60 shadow-sm hover:shadow-md bg-card cursor-grab active:cursor-grabbing mb-4 overflow-hidden">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 gap-4">
                      <div className="flex flex-col gap-1 overflow-hidden flex-1">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <button 
                              onClick={(e) => handleToggleFavorite(e, conv.id)}
                              className={`shrink-0 transition-all p-1 rounded-full hover:bg-amber-500/10 ${conv.isFavorite ? 'text-amber-500 scale-110' : 'text-muted-foreground/30 hover:text-amber-500/50'}`}
                              title={conv.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                            >
                              <Star className={`h-5 w-5 ${conv.isFavorite ? 'fill-current' : ''}`} />
                            </button>
                            <CardTitle className="text-lg font-bold truncate group-hover/card:text-primary transition-colors">
                              {conv.title}
                            </CardTitle>
                          </div>
                          <Badge variant="outline" className="ml-2 bg-primary/5 text-primary/80 border-primary/20 shrink-0 text-xs px-2 py-0">
                            {conv.llm}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0 mr-8">
                        <p className="text-xs text-muted-foreground font-semibold whitespace-nowrap">
                          {new Date(conv.date || conv.capturedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {conv.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 italic leading-relaxed">
                          "{conv.summary}"
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {conv.folderId && !currentFolderId && (
                            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium border border-border flex items-center gap-1">
                              <FolderIcon className="h-2.5 w-2.5" />
                              {getFolderName(conv.folderId)}
                            </span>
                          )}
                          {(conv.tags || []).map(tag => (
                            <span key={tag} className="text-[10px] bg-primary/5 text-primary/70 px-2 py-0.5 rounded-full font-semibold border border-primary/10">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 w-9"
                  onClick={(e) => handleDelete(e, conv)}
                  title="Supprimer la discussion"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </motion.div>
            )) 
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-muted"
            >
              <FolderIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">Aucune conversation trouvée ici.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Capturez des discussions ou déplacez-les dans ce dossier.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
