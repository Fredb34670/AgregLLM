import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Navigate, Routes, Route, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConversationsList } from './components/ConversationsList';
import { Settings } from './components/Settings';
import { storage } from './lib/storage';
import { gdrive } from './lib/google-drive';
import { Conversation } from './types';
import { ThemeToggle } from './components/ThemeToggle';
import { Sidebar } from './components/Sidebar';
import { MessageSquare, BarChart3, PieChart } from 'lucide-react';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar composant */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b flex items-center justify-end px-6 bg-background/50 backdrop-blur-md z-10">
          <ThemeToggle />
        </header>
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-6xl mx-auto w-full">
            {children}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

function Welcome() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(gdrive.isAuthenticated());

  useEffect(() => {
    // Charger automatiquement depuis Google Drive au démarrage
    const loadData = async () => {
      setIsLoading(true);
      
      // Essayer de charger depuis Google Drive
      const cloudData = await gdrive.autoLoad();
      if (cloudData) {
        console.log('Loading conversations from Google Drive...');
        storage.importData(cloudData);
      }
      
      setConversations(storage.getAllConversations());
      setIsLoading(false);
    };
    
    loadData();
    
    // Écouter les synchronisations depuis l'extension
    const handleSync = () => {
      setConversations(storage.getAllConversations());
    };
    
    const handleAuthSuccess = () => {
      setIsConnected(gdrive.isAuthenticated());
      loadData();
    };
    
    window.addEventListener('agregllm-sync', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('agregllm-gdrive-auth-success', handleAuthSuccess);
    
    return () => {
      window.removeEventListener('agregllm-sync', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('agregllm-gdrive-auth-success', handleAuthSuccess);
    };
  }, []);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    conversations.forEach(c => {
      counts[c.llm] = (counts[c.llm] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [conversations]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement depuis Google Drive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-8">
        <MessageSquare className="h-10 w-10" />
      </div>
      <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-center">Bienvenue dans AgregLLM</h2>
      <p className="text-muted-foreground text-xl mb-4 text-center max-w-lg leading-relaxed">
        Votre hub central pour organiser, filtrer et retrouver toutes vos discussions d'intelligence artificielle.
      </p>

      {!isConnected && (
        <div className="mb-10 w-full max-w-lg">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 p-5 rounded-2xl flex flex-col items-center gap-4 shadow-sm text-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl">☁️</span>
              <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed font-semibold">
                Synchronisez vos discussions sur tous vos appareils
              </p>
            </div>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
              Actuellement, vos données sont stockées uniquement sur cet ordinateur. Connectez votre Google Drive pour les sécuriser et les retrouver partout.
            </p>
            <Button 
                onClick={() => gdrive.login()} 
                variant="outline" 
                size="sm" 
                className="bg-amber-500 text-white hover:bg-amber-600 border-none font-bold py-4 px-6 rounded-xl shadow-lg shadow-amber-500/20"
            >
              Se connecter au Cloud
            </Button>
          </div>
        </div>
      )}
      
      {gdrive.isAuthenticated() && (
        <div className="mb-10" />
      )}
      
      <div className="flex gap-4 mb-16">
        <Link to="/conversations">
          <Button size="lg" className="px-8 font-semibold">Voir mes conversations</Button>
        </Link>
      </div>

      {conversations.length > 0 && (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary/5 border-none shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{conversations.length}</div>
              <p className="text-xs text-muted-foreground">discussions sauvegardées</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-dashed bg-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <PieChart className="h-4 w-4" /> Répartition par LLM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mt-1">
                {stats.map(([llm, count]) => (
                  <div key={llm} className="flex items-center gap-2 bg-background border rounded-full px-3 py-1 shadow-sm">
                    <span className="font-semibold text-sm">{llm}</span>
                    <Badge variant="secondary" className="rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 font-bold text-[10px]">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}



function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Extraction du token OAuth si présent dans l'URL (cas du retour de redirection Google)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      try {
        const tokenMatch = hash.match(/access_token=([^&]*)/);
        const expiresMatch = hash.match(/expires_in=([^&]*)/);
        const token = tokenMatch ? tokenMatch[1] : null;
        const expiresIn = expiresMatch ? expiresMatch[1] : '3600';
        
        if (token) {
          console.log("AgregLLM: OAuth token detected in URL, saving...");
          const expiry = Date.now() + (parseInt(expiresIn) * 1000);
          localStorage.setItem('agregllm_gdrive_token', token);
          localStorage.setItem('agregllm_gdrive_expiry', expiry.toString());
          
          window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));
          
          // Fermer la fenêtre si c'est un popup (cas windows.create ou window.open)
          if (window.name === "AgregLLMAuth" || !window.location.protocol.includes('-extension:')) {
            setTimeout(() => window.close(), 200);
          } else {
            navigate('/', { replace: true });
          }
        }
      } catch (e) {
        console.error("AgregLLM: Error during token extraction", e);
      }
    }

    // 2. Initialisation silencieuse et securisee de GDrive
    const initCloud = async () => {
      try {
        await gdrive.init();
        if (gdrive.isAuthenticated()) {
          console.log("AgregLLM: Cloud connected, starting background sync...");
          const cloudData = await gdrive.loadFromDrive();
          if (cloudData) {
            storage.importData(cloudData);
            window.dispatchEvent(new Event('storage'));
          }
        }
      } catch (e) {
        console.error("AgregLLM: GDrive init failed", e);
      }
    };
    
    initCloud();
    
    // Écouter les succès d'authentification pour recharger
    const handleAuthSuccess = () => {
      initCloud();
    };
    window.addEventListener('agregllm-gdrive-auth-success', handleAuthSuccess);
    return () => window.removeEventListener('agregllm-gdrive-auth-success', handleAuthSuccess);
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/conversations" element={<ConversationsList />} />
        <Route path="/settings" element={<Settings />} />
        {/* Fallback pour éviter les pages blanches si le hash est inconnu */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App