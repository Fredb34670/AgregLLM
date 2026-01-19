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

  useEffect(() => {
    const checkAuth = () => {
      const auth = gdrive.isAuthenticated();
      if (auth !== isConnected) {
        console.log("Settings: Mise à jour statut connexion ->", auth);
        setIsConnected(auth);
      }
    };

    gdrive.init().then(() => checkAuth());
    
    // Événement immédiat
    window.addEventListener('agregllm-gdrive-auth-success', checkAuth);
    
    // Polling de sécurité toutes les secondes
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('agregllm-gdrive-auth-success', checkAuth);
      clearInterval(interval);
    };
  }, [isConnected]);

  const handleGDriveLogin = () => gdrive.login();
  const handleGDriveLogout = () => {
    gdrive.logout();
    setIsConnected(false);
    window.location.reload();
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const cloudData = await gdrive.loadFromDrive();
      if (cloudData) {
        storage.importData(cloudData);
      }
      const localData = storage.exportData();
      await gdrive.syncToDrive(localData);
      alert('Synchronisation terminée !');
      window.location.reload();
    } catch (e) {
      console.error("Sync Error", e);
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
    if (!newTagName.trim() || newTagName === oldName) {
      setEditingTag(null);
      return;
    }
    storage.renameTag(oldName, newTagName);
    setEditingTag(null);
    setNewTagName("");
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteTag = (tagName: string) => {
    if (confirm(`Voulez-vous vraiment supprimer le tag #${tagName} de toutes les conversations ?`)) {
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
    a.download = `agregllm-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        storage.importData(json);
        alert('Import réussi ! La page va se recharger.');
        window.location.reload();
      } catch (err) {
        alert('Erreur lors de l\'import : ' + err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">
          Gérez votre Cloud, vos tags et vos sauvegardes locales.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Cloud className="h-5 w-5" /> Synchronisation Cloud (Google Drive)
          </CardTitle>
          <CardDescription>
            Accédez à vos données sur tous vos appareils. Les données sont stockées de façon privée sur votre espace personnel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="flex items-center justify-between border border-dashed border-primary/30 p-4 rounded-lg bg-background/50">
              <div className="space-y-0.5">
                <div className="font-medium text-sm">Connexion requise</div>
                <div className="text-xs text-muted-foreground">
                  Liez votre compte Google pour activer la synchronisation.
                </div>
              </div>
              <Button onClick={handleGDriveLogin} className="gap-2 bg-primary">
                Se connecter
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border p-4 rounded-lg bg-background/50">
                <div className="space-y-0.5">
                  <div className="font-medium text-success flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" /> 
                    Cloud Connecté
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Synchronisation active avec votre Drive personnel.
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSyncNow} disabled={isSyncing} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} /> Synchroniser
                  </Button>
                  <Button onClick={handleGDriveLogout} variant="ghost" size="icon" title="Déconnexion" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <CloudOff className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-4 w-4" /> Sauvegarde locale (JSON)
            </CardTitle>
            <CardDescription className="text-xs">
              Indispensable pour garder une copie physique de vos données hors Google.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleExport} variant="outline" className="w-full justify-start gap-2 text-xs">
              <Download className="h-3.5 w-3.5" /> Exporter le fichier .json
            </Button>
            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json" 
                onChange={handleFileChange}
              />
              <Button onClick={handleImportClick} variant="ghost" className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-foreground">
                <Upload className="h-3.5 w-3.5" /> Importer une sauvegarde
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="h-4 w-4" /> Gestion des Tags
            </CardTitle>
            <CardDescription className="text-xs">
              Renommez ou supprimez vos tags globalement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {allTags.length > 0 ? (
                allTags.map(tag => (
                  <div key={tag} className="flex items-center gap-1 bg-muted/50 p-1 rounded-md border border-border/50 group">
                    {editingTag === tag ? (
                      <div className="flex items-center gap-1">
                        <Input 
                          className="h-6 w-24 text-[10px]"
                          value={newTagName} 
                          onChange={(e) => setNewTagName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameTag(tag);
                            if (e.key === 'Escape') setEditingTag(null);
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <span className="text-[10px] font-medium px-1">#{tag}</span>
                        <button 
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all"
                          onClick={() => { setEditingTag(tag); setNewTagName(tag); }}
                        >
                          <Edit2 className="h-2.5 w-2.5" />
                        </button>
                        <button 
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                          onClick={() => handleDeleteTag(tag)}
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">Aucun tag.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}