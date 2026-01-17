import { Routes, Route, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationsList } from './components/ConversationsList';
import { ConversationDetail } from './components/ConversationDetail';
import { ThemeToggle } from './components/ThemeToggle';
import { Settings } from './components/Settings';
import { Settings as SettingsIcon, MessageSquare, Home } from 'lucide-react';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar simple */}
      <aside className="w-64 border-r bg-muted/40 p-4 hidden md:block">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-primary">AgregLLM</h2>
        </div>
        <nav className="space-y-1">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-3 text-foreground">
              <Home className="h-4 w-4" /> Accueil
            </Button>
          </Link>
          <Link to="/conversations">
            <Button variant="ghost" className="w-full justify-start gap-3 text-foreground">
              <MessageSquare className="h-4 w-4" /> Conversations
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" className="w-full justify-start gap-3 text-foreground">
              <SettingsIcon className="h-4 w-4" /> Sources LLM
            </Button>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b flex items-center justify-end px-6">
          <ThemeToggle />
        </header>
        <ScrollArea className="flex-1 p-6">
          {children}
        </ScrollArea>
      </main>
    </div>
  );
}

function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h2 className="text-3xl font-bold text-indigo-600 mb-4 text-center">Bienvenue dans AgregLLM</h2>
      <p className="text-muted-foreground text-lg mb-8 text-center max-w-md">
        Centralisez et organisez vos conversations avec les différents LLMs en un seul endroit.
      </p>
      <Link to="/conversations">
        <Button size="lg">Voir mes conversations</Button>
      </Link>
    </div>
  );
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/conversations" element={<ConversationsList />} />
        <Route path="/conversations/:id" element={<ConversationDetail />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App