import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
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

  useEffect(() => {
    setConversations(storage.getAllConversations());
  }, []);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    conversations.forEach(c => {
      counts[c.llm] = (counts[c.llm] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [conversations]);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-8">
        <MessageSquare className="h-10 w-10" />
      </div>
      <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-center">Bienvenue dans AgregLLM</h2>
      <p className="text-muted-foreground text-xl mb-10 text-center max-w-lg leading-relaxed">
        Votre hub central pour organiser, filtrer et retrouver toutes vos discussions d'intelligence artificielle.
      </p>
      
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
  useEffect(() => {
    // Initialisation silencieuse et securisee de GDrive
    const initCloud = async () => {
      try {
        await gdrive.init();
        if (gdrive.isAuthenticated()) {
          console.log("AgregLLM: Cloud connected, starting background sync...");
          const cloudData = await gdrive.loadFromDrive();
          if (cloudData) {
            storage.importData(cloudData);
            // Declencher un evenement pour rafraichir l'UI
            window.dispatchEvent(new Event('storage'));
          }
        }
      } catch (e) {
        console.error("AgregLLM: GDrive init failed", e);
      }
    };
    
    initCloud();
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/conversations" element={<ConversationsList />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App