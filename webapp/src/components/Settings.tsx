import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { storage } from "../lib/storage";
import { gdrive } from "../lib/google-drive";
import { Download, Upload, Trash2, Edit2, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useRef, useState, useMemo, useEffect } from "react";

export function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [, setIsGDriveInit] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    gdrive.init().then(() => setIsGDriveInit(true));
    
    const handleAuthSuccess = () => setIsGDriveInit(true);
    window.addEventListener('agregllm-gdrive-auth-success', handleAuthSuccess);
    return () => window.removeEventListener('agregllm-gdrive-auth-success', handleAuthSuccess);
  }, []);

  const handleGDriveLogin = () => gdrive.login();
  const handleGDriveLogout = () => {
    gdrive.logout();
    setIsGDriveInit(false);
    window.location.reload();
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    // 1. Charger depuis le Cloud
    const cloudData = await gdrive.loadFromDrive();
    if (cloudData) {
      storage.importData(cloudData);
    }
    // 2. Envoyer le local fusionné vers le Cloud
    const localData = storage.exportData();
    await gdrive.syncToDrive(localData);
    
    setIsSyncing(false);
    alert('Synchronisation terminée !');
    window.location.reload();
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
          Gérez vos préférences et vos données.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Cloud className="h-5 w-5" /> Synchronisation Cloud
          </CardTitle>
          <CardDescription>
            Synchronisez vos conversations sur tous vos appareils via Google Drive (gratuit et privé).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!gdrive.isAuthenticated() ? (
            <div className="flex items-center justify-between border border-dashed border-primary/30 p-4 rounded-lg bg-background/50">
              <div className="space-y-0.5">
                <div className="font-medium">Connecter Google Drive</div>
                <div className="text-sm text-muted-foreground">
                  Activez la synchronisation automatique.
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
                  <div className="text-sm text-muted-foreground">
                    Vos données sont sécurisées sur votre Drive.
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSyncNow} disabled={isSyncing} variant="outline" className="gap-2">
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} /> Sync. maintenant
                  </Button>
                  <Button onClick={handleGDriveLogout} variant="ghost" size="icon" title="Déconnexion" className="text-muted-foreground hover:text-destructive">
                    <CloudOff className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sauvegarde et Restauration</CardTitle>
          <CardDescription>
            Exportez vos données pour les mettre en sécurité ou les transférer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border p-4 rounded-lg">
            <div className="space-y-0.5">
              <div className="font-medium">Exporter les données</div>
              <div className="text-sm text-muted-foreground">
                Télécharge un fichier JSON contenant toutes vos conversations et dossiers.
              </div>
            </div>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Exporter
            </Button>
          </div>

          <div className="flex items-center justify-between border p-4 rounded-lg">
            <div className="space-y-0.5">
              <div className="font-medium">Importer des données</div>
              <div className="text-sm text-muted-foreground">
                Restaure une sauvegarde depuis un fichier JSON. Attention, cela fusionnera avec les données actuelles.
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleFileChange}
            />
            <Button onClick={handleImportClick} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" /> Importer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des Tags</CardTitle>
          <CardDescription>
            Renommez ou supprimez vos tags globalement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allTags.length > 0 ? (
              allTags.map(tag => (
                <div key={tag} className="flex items-center gap-1 bg-muted/50 p-1 rounded-md border border-border/50 group">
                  {editingTag === tag ? (
                    <div className="flex items-center gap-1">
                      <Input 
                        className="h-7 w-32 text-xs" 
                        value={newTagName} 
                        onChange={(e) => setNewTagName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameTag(tag);
                          if (e.key === 'Escape') setEditingTag(null);
                        }}
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRenameTag(tag)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">#{tag}</Badge>
                      <button 
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-primary transition-all"
                        onClick={() => { setEditingTag(tag); setNewTagName(tag); }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button 
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                        onClick={() => handleDeleteTag(tag)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucun tag pour le moment.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
