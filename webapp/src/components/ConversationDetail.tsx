import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Conversation } from '../types';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ExternalLink, User, Bot, Tag as TagIcon, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

      <div className="space-y-10 py-8">
        {conversation.messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end pl-12 md:pl-24' : 'items-start pr-12 md:pr-24'}`}
          >
            <div className={`flex flex-col max-w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-center gap-2 mb-2 ${msg.role === 'user' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                <span className="text-sm font-black uppercase tracking-widest">
                  {msg.role === 'user' ? 'Vous' : conversation.llm}
                </span>
              </div>
              
              <Card className={`w-full border-none shadow-md ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' 
                  : 'bg-card border-l-4 border-l-emerald-500 rounded-2xl rounded-tl-none'
              }`}>
                <CardContent className="p-6">
                  <div className={`prose prose-sm md:prose-base max-w-none break-words 
                    ${msg.role === 'user' ? 'prose-invert prose-p:text-white/90' : 'dark:prose-invert text-foreground/90'} 
                    prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground/90
                    prose-strong:font-semibold prose-strong:text-foreground
                    prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                    prose-ul:list-disc prose-ol:list-decimal prose-li:my-1
                    prose-ul:marker:text-white/80 prose-ul:marker:text-base`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}