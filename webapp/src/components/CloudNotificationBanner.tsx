import { Button } from "@/components/ui/button";
import { useCloudStatus } from "../lib/cloud-status";
import { AlertCircle, CloudOff } from "lucide-react";

export function CloudNotificationBanner() {
  const { isConnected, login } = useCloudStatus();

  if (isConnected) {
    return null;
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-amber-500/20 p-2 rounded-full text-amber-600 dark:text-amber-400">
          <CloudOff className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5" />
            Mode local activé
          </h4>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5 leading-relaxed">
            Attention : discussions sauvegardées localement. Connectez-vous à votre compte Google pour les retrouver partout.
          </p>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={login}
        className="bg-amber-500 text-white hover:bg-amber-600 border-none shrink-0 font-bold px-4"
      >
        Se connecter
      </Button>
    </div>
  );
}
