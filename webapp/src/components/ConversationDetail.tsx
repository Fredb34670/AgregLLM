import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Conversation } from '../types';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ExternalLink, Tag as TagIcon, X, Info } from 'lucide-react';

export function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const [conversation, setConversation] = useState<Conversation | undefined>(undefined);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (id) {
      setConversation(storage.getConversationById(id));
    }
  }, [id]);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || !conversation) return;
    
    const tags = conversation.tags || [];
    if (!tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      storage.updateTags(conversation.id, updatedTags);
      setConversation({ ...conversation, tags: updatedTags });
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    if (!conversation) return;
    const updatedTags = (conversation.tags || []).filter(t => t !== tagToRemove);
    storage.updateTags(conversation.id, updatedTags);
    setConversation({ ...conversation, tags: updatedTags });
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-4">Conversation introuvable</h2>
        <Link to="/conversations">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/conversations">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <a href={conversation.url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Voir sur {conversation.llm}
          </Button>
        </a>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold">{conversation.title}</h2>
          <Badge variant="outline" className="border-primary text-primary">{conversation.llm}</Badge>
        </div>
        
        {/* Tags Section */}
        <div className="flex flex-wrap items-center gap-2 mt-4 py-2 border-y border-border/40">
          <TagIcon className="h-4 w-4 text-muted-foreground mr-1" />
          {(conversation.tags || []).map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1 bg-primary/10 text-primary hover:bg-primary/20 border-none">
              {tag}
              <button 
                onClick={() => removeTag(tag)} 
                className="hover:bg-primary/30 rounded-full p-0.5 transition-colors"
                title="Supprimer le tag"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <form onSubmit={handleAddTag} className="inline-block ml-2">
            <Input 
              placeholder="Ajouter un tag..." 
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="h-8 w-40 text-xs bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </form>
        </div>

        <p className="text-sm text-muted-foreground font-medium mt-4">
          Capturée le {new Date(conversation.capturedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Résumé et Lien Externe */}
      <div className="space-y-8 py-8">
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Info className="h-5 w-5 text-muted-foreground" />
              Résumé / Aperçu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80 leading-relaxed italic">
              {conversation.summary || "Aucun résumé disponible pour cette discussion."}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/20 text-center space-y-4">
          <h3 className="text-xl font-semibold">Consulter la discussion complète</h3>
          <p className="text-muted-foreground max-w-md">
            Pour des raisons de confidentialité et de respect des conditions d'utilisation, le contenu complet des échanges n'est pas stocké dans AgregLLM.
          </p>
          <a href={conversation.url} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2 mt-4">
              Ouvrir sur {conversation.llm} <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}