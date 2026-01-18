import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { storage } from "../lib/storage";
import { Download, Upload } from "lucide-react";
import { useRef } from "react";

export function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    </div>
  );
}
