import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Globe } from 'lucide-react';

interface LLMSource {
  id: string;
  name: string;
  domain: string;
  active: boolean;
  isCustom: boolean;
}

const DEFAULT_SOURCES: LLMSource[] = [
  { id: 'chatgpt', name: 'ChatGPT', domain: 'chatgpt.com', active: true, isCustom: false },
  { id: 'claude', name: 'Claude', domain: 'claude.ai', active: true, isCustom: false },
  { id: 'gemini', name: 'Gemini', domain: 'gemini.google.com', active: true, isCustom: false },
  { id: 'aistudio', name: 'AI Studio', domain: 'aistudio.google.com', active: true, isCustom: false },
];

export function Settings() {
  const [sources, setSources] = useState<LLMSource[]>([]);
  const [newName, setNewName] = useState('');
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('agregllm_sources');
    if (saved) {
      setSources(JSON.parse(saved));
    } else {
      setSources(DEFAULT_SOURCES);
      localStorage.setItem('agregllm_sources', JSON.stringify(DEFAULT_SOURCES));
    }
  }, []);

  const saveSources = (updated: LLMSource[]) => {
    setSources(updated);
    localStorage.setItem('agregllm_sources', JSON.stringify(updated));
  };

  const toggleSource = (id: string) => {
    const updated = sources.map(s => s.id === id ? { ...s, active: !s.active } : s);
    saveSources(updated);
  };

  const addSource = () => {
    if (!newName || !newDomain) return;
    const newSource: LLMSource = {
      id: Date.now().toString(),
      name: newName,
      domain: newDomain.replace('https://', '').replace('http://', '').split('/')[0],
      active: true,
      isCustom: true
    };
    saveSources([...sources, newSource]);
    setNewName('');
    setNewDomain('');
  };

  const deleteSource = (id: string) => {
    const updated = sources.filter(s => s.id !== id);
    saveSources(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Paramètres des Sources</h2>
        <p className="text-muted-foreground mt-2">
          Gérez les LLM dont vous souhaitez capturer les discussions.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un nouveau LLM</CardTitle>
            <CardDescription>Déclarez un nouveau site de LLM à surveiller.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="name">Nom du LLM</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: Mistral, Perplexity..." 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="domain">Domaine ou URL</Label>
                <Input 
                  id="domain" 
                  placeholder="Ex: chat.mistral.ai" 
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addSource} className="gap-2">
                  <Plus className="h-4 w-4" /> Ajouter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {sources.map(source => (
            <Card key={source.id} className={!source.active ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{source.name}</h3>
                      <p className="text-xs text-muted-foreground">{source.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch 
                      checked={source.active} 
                      onCheckedChange={() => toggleSource(source.id)}
                    />
                    {source.isCustom && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => deleteSource(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
