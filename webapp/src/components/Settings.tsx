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
  const [isConnected, setIsConnected] = useState(false);

  // Fonction de mise à jour du statut
  const updateAuthStatus = () => {
    const status = gdrive.isAuthenticated();
    console.log("Settings: Mise à jour UI statut =", status);
    setIsConnected(status);
  };

  useEffect(() => {
    // Initialiser GDrive
    gdrive.init().then(() => updateAuthStatus());
    
    // Écouter le succès d'auth
    window.addEventListener('agregllm-gdrive-auth-success', updateAuthStatus);
    
    // Vérifier toutes les 2 secondes pour être absolument sûr
    const interval = setInterval(updateAuthStatus, 2000);

    return () => {
      window.removeEventListener('agregllm-gdrive-auth-success', updateAuthStatus);
      clearInterval(interval);
    };
  }, []);

  const handleGDriveLogin = () => {
    console.log("Settings: Clic Login");
    gdrive.login();
  };

  const handleGDriveLogout = () => {
    gdrive.logout();
    updateAuthStatus();
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const cloudData = await gdrive.loadFromDrive();
      if (cloudData) storage.importData(cloudData);
      await gdrive.syncToDrive(storage.exportData());
      alert('Synchronisation réussie !');
      window.location.reload();
    } catch (e) {
      alert('Erreur de synchronisation');
    } finally {
      setIsSyncing(false);
    }
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

  const handleDeleteTag = (tagName: string) => {
    if (confirm(`Supprimer #${tagName} ?`)) {
      storage.deleteTag(tagName);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleExport = () => {
    const json = storage.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agregllm-backup.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">Gérez votre Cloud et vos données.</p>
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Cloud className="h-5 w-5" /> Synchronisation Cloud
          </CardTitle>
          <CardDescription>Sauvegarde automatique et multi-appareils via Google Drive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="flex items-center justify-between border border-dashed border-primary/30 p-4 rounded-lg bg-background/50">
              <div className="space-y-0.5">
                <div className="font-medium text-sm">Connexion requise</div>
                <div className="text-xs text-muted-foreground">Liez votre compte pour activer le Cloud.</div>
              </div>
              <Button onClick={handleGDriveLogin} className="gap-2 bg-primary">Se connecter</Button>
            </div>
          ) : (
            <div className="flex items-center justify-between border p-4 rounded-lg bg-background/50 border-green-500/20 shadow-inner">
              <div className="space-y-0.5">
                <div className="font-medium text-green-600 flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" /> Cloud Connecté
                </div>
                <div className="text-xs text-muted-foreground">Données synchronisées.</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSyncNow} disabled={isSyncing} variant="outline" size="sm" className="gap-2">
                  <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} /> Synchroniser
                </Button>
                <Button onClick={handleGDriveLogout} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <CloudOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Download className="h-4 w-4" /> Sauvegarde locale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleExport} variant="outline" className="w-full justify-start gap-2 text-xs">
              <Download className="h-3.5 w-3.5" /> Exporter en JSON
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  storage.importData(ev.target?.result as string);
                  window.location.reload();
                };
                reader.readAsText(file);
              }
            }} />
            <Button onClick={() => fileInputRef.current?.click()} variant="ghost" className="w-full justify-start gap-2 text-xs text-muted-foreground">
              <Upload className="h-3.5 w-3.5" /> Importer JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Tag className="h-4 w-4" /> Gestion des Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map(tag => (
                <div key={tag} className="flex items-center gap-1 bg-muted/50 p-1 rounded-md border border-border/50 group text-[10px]">
                  {editingTag === tag ? (
                    <Input className="h-5 w-20 text-[10px] p-1" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleRenameTag(tag)} />
                  ) : (
                    <>
                      <span>#{tag}</span>
                      <button className="opacity-0 group-hover:opacity-100" onClick={() => { setEditingTag(tag); setNewTagName(tag); }}><Edit2 className="h-2.5 w-2.5" /></button>
                      <button className="opacity-0 group-hover:opacity-100" onClick={() => handleDeleteTag(tag)}><Trash2 className="h-2.5 w-2.5" /></button>
                    </>
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
