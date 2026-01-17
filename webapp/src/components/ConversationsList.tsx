import { useState, useMemo, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Conversation } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Search, Trash2, ExternalLink } from 'lucide-react';

export function ConversationsList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const refreshConversations = () => {
    setConversations(storage.getAllConversations());
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    conversations.forEach(c => {
      (c.tags || []).forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [conversations]);

  const handleDelete = (e: React.MouseEvent, conversation: Conversation) => {
    e.preventDefault();
    if (confirm('Voulez-vous vraiment supprimer cette discussion d\'AgregLLM ?')) {
      storage.deleteConversation(conversation.id);
      window.dispatchEvent(new CustomEvent('agregllm-delete-request', { 
        detail: { url: conversation.url } 
      }));
      refreshConversations();
    }
  };

  useEffect(() => {
    refreshConversations();
    window.addEventListener('storage', refreshConversations);
    window.addEventListener('agregllm-sync-complete', refreshConversations);
    return () => {
      window.removeEventListener('storage', refreshConversations);
      window.removeEventListener('agregllm-sync-complete', refreshConversations);
    };
  }, []);

  const filteredAndSortedConversations = useMemo(() => {
    return conversations
      .filter(conv => {
        const matchesSearch = conv.title.toLowerCase().includes(search.toLowerCase()) ||
          conv.llm.toLowerCase().includes(search.toLowerCase());
        const matchesTag = !selectedTag || (conv.tags || []).includes(selectedTag);
        return matchesSearch && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return b.capturedAt - a.capturedAt;
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  }, [conversations, search, sortBy, selectedTag]);

  if (conversations.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Liste des conversations</h2>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground italic">Aucune conversation capturée pour le moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h2 className="text-3xl font-bold">Conversations</h2>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher une conversation..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 border-r pr-4 mr-2">
          <Badge 
            variant={sortBy === 'date' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSortBy('date')}
          >
            Plus récentes
          </Badge>
          <Badge 
            variant={sortBy === 'title' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSortBy('title')}
          >
            Par titre
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2">
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
              className={`cursor-pointer ${selectedTag === tag ? 'bg-primary/80' : 'bg-primary/5 text-primary border-primary/20'}`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              #{tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAndSortedConversations.length > 0 ? (
          filteredAndSortedConversations.map((conv) => (
            <div key={conv.id} className="relative group">
              <Link to={`/conversations/${conv.id}`}>
                <Card className="hover:bg-muted/50 transition-colors pr-12 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium truncate pr-4">
                      {conv.title}
                    </CardTitle>
                    <a 
                      href={conv.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Badge variant="secondary" className="shrink-0 hover:bg-secondary/80 cursor-pointer flex gap-1 items-center">
                        {conv.llm}
                        <ExternalLink className="h-3 w-3" />
                      </Badge>
                    </a>
                  </CardHeader>
                  <CardContent>
                    {conv.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {conv.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-wrap gap-1">
                        {(conv.tags || []).map(tag => (
                          <span key={tag} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground/70">
                        {new Date(conv.capturedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => handleDelete(e, conv)}
                title="Supprimer la discussion"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )) 
        ) : (
          <p className="text-center py-12 text-muted-foreground">Aucun résultat pour votre recherche.</p>
        )}
      </div>
    </div>
  );
}
