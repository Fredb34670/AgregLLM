import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { storage } from "../lib/storage";
import { gdrive } from "../lib/google-drive";
import { Download, Upload, Trash2, Edit2, Cloud, CloudOff, RefreshCw, Tag } from "lucide-react";
import { useRef, useState, useMemo, useEffect } from "react";

export function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    gdrive.init();
    // Force le rafraichissement toutes les secondes pour l'état du bouton
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = gdrive.isAuthenticated();

  const handleSyncNow = async () => {
    setIsSyncing(true);
    const cloudData = await gdrive.loadFromDrive();
    if (cloudData) storage.importData(cloudData);
    await gdrive.syncToDrive(storage.exportData());
    alert('Synchronisation cloud effectuée !');
    setIsSyncing(false);
    window.location.reload();
  };

  const conversations = storage.getAllConversations();
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    conversations.forEach(c => (c.tags || []).forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [conversations]);

  const handleRenameTag = (oldName: string) => {
    if (!newTagName.trim() || newTagName === oldName) { setEditingTag(null); return; }
    storage.renameTag(oldName, newTagName);
    setEditingTag(null);
    setNewTagName("");
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">Configuration et données.</p>
      </div>

      <Card className={isConnected ? "border-green-500 bg-green-50/10" : "border-primary/20 bg-primary/5"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" /> Google Drive Cloud
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-4 p-2">
              <div className="flex items-center justify-between">
                <p className="text-sm">Connectez votre compte pour synchroniser vos appareils.</p>
                <Button onClick={() => gdrive.login()}>Se connecter</Button>
              </div>
              <div className="text-[11px] bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3 rounded-md text-amber-800 dark:text-amber-200 leading-relaxed shadow-sm">
                <strong>💡 Note sur la sécurité :</strong> AgregLLM est un projet indépendant et gratuit. 
                Google affichera un message indiquant que l'application n'a pas été validée. 
                C'est normal : pour continuer, cliquez sur <em>"Paramètres avancés"</em> puis sur <em>"Accéder à AgregLLM (non sécurisé)"</em>. 
                C'est justement la preuve que vos données ne transitent par aucun serveur tiers et restent sur <strong>votre</strong> Drive.
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2">
              <div className="space-y-1">
                <p className="text-sm font-bold text-green-600">✓ Connecté au Cloud</p>
                <p className="text-xs text-muted-foreground">Vos données sont sur Google Drive.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSyncNow} disabled={isSyncing} variant="outline" size="sm">
                  <RefreshCw className={isSyncing ? "animate-spin" : ""} /> Sync.
                </Button>
                <Button onClick={() => gdrive.logout()} variant="ghost" size="sm" className="text-destructive">
                  Déconnexion
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Sauvegarde locale</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => {
              const blob = new Blob([storage.exportData()], { type: 'application/json' });
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'agregllm.json'; a.click();
            }} variant="outline" className="w-full text-xs">Exporter JSON</Button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const r = new FileReader();
                r.onload = (ev) => { storage.importData(ev.target?.result as string); window.location.reload(); };
                r.readAsText(file);
              }
            }} />
            <Button onClick={() => fileInputRef.current?.click()} variant="ghost" className="w-full text-xs">Importer JSON</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Tags</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map(tag => (
                <div key={tag} className="bg-muted p-1 rounded group text-[10px]">
                  {editingTag === tag ? (
                    <Input className="h-5 w-20 text-[10px]" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleRenameTag(tag)} />
                  ) : (
                    <div className="flex gap-1">
                      <span>#{tag}</span>
                      <button onClick={() => { setEditingTag(tag); setNewTagName(tag); }}><Edit2 className="h-2 w-2" /></button>
                      <button onClick={() => storage.deleteTag(tag)}><Trash2 className="h-2 w-2" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}