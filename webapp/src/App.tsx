import { Routes, Route, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationsList } from './components/ConversationsList';
import { ConversationDetail } from './components/ConversationDetail';
import { ThemeToggle } from './components/ThemeToggle';
import { Sidebar } from './components/Sidebar';
import { MessageSquare } from 'lucide-react';

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
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-8">
        <MessageSquare className="h-10 w-10" />
      </div>
      <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-center">Bienvenue dans AgregLLM</h2>
      <p className="text-muted-foreground text-xl mb-10 text-center max-w-lg leading-relaxed">
        Votre hub central pour organiser, filtrer et retrouver toutes vos discussions d'intelligence artificielle.
      </p>
      <div className="flex gap-4">
        <Link to="/conversations">
          <Button size="lg" className="px-8 font-semibold">Voir mes conversations</Button>
        </Link>
      </div>
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
      </Routes>
    </Layout>
  )
}

export default App