import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConversationsList } from './ConversationsList';
import { storage } from '../lib/storage';
import { useCloudStatus } from '../lib/cloud-status';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, layout, initial, animate, exit, transition, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../lib/storage', () => ({
  storage: {
    getAllConversations: vi.fn(),
    getAllFolders: vi.fn().mockReturnValue([]),
    toggleFavorite: vi.fn(),
    deleteConversation: vi.fn(),
  }
}));

vi.mock('../lib/cloud-status', () => ({
  useCloudStatus: vi.fn(),
}));

describe('ConversationsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCloudStatus as any).mockReturnValue({
      isConnected: true,
      login: vi.fn(),
    });
  });

  it('affiche le bandeau de notification cloud quand déconnecté', () => {
    (useCloudStatus as any).mockReturnValue({
      isConnected: false,
      login: vi.fn(),
    });
    vi.mocked(storage.getAllConversations).mockReturnValue([]);
    
    render(
      <MemoryRouter>
        <ConversationsList />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Attention : discussions sauvegardées localement/i)).toBeInTheDocument();
  });

  it('n\'affiche pas le bandeau de notification cloud quand connecté', () => {
    (useCloudStatus as any).mockReturnValue({
      isConnected: true,
      login: vi.fn(),
    });
    vi.mocked(storage.getAllConversations).mockReturnValue([]);
    
    render(
      <MemoryRouter>
        <ConversationsList />
      </MemoryRouter>
    );
    
    expect(screen.queryByText(/Attention : discussions sauvegardées localement/i)).not.toBeInTheDocument();
  });

  it('affiche un message quand il n\'y a pas de conversations', () => {
    vi.mocked(storage.getAllConversations).mockReturnValue([]);
    render(
      <MemoryRouter>
        <ConversationsList />
      </MemoryRouter>
    );
    expect(screen.getByText(/Aucune conversation trouvée ici/i)).toBeInTheDocument();
  });

  it('affiche la liste des conversations quand elles existent', () => {
    vi.mocked(storage.getAllConversations).mockReturnValue([
      {
        id: '1',
        title: 'Conversation Test',
        llm: 'ChatGPT',
        capturedAt: Date.now(),
        url: 'http://test.com',
        messages: []
      }
    ]);
    render(
      <MemoryRouter>
        <ConversationsList />
      </MemoryRouter>
    );
    expect(screen.getByText('Conversation Test')).toBeInTheDocument();
    expect(screen.getByText('ChatGPT')).toBeInTheDocument();
    
    const link = screen.getByRole('link', { name: /Conversation Test/i });
    expect(link).toHaveAttribute('href', 'http://test.com');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('filtre les conversations selon la recherche', () => {
    vi.mocked(storage.getAllConversations).mockReturnValue([
      { id: '1', title: 'React Tips', llm: 'ChatGPT', capturedAt: Date.now(), url: '', messages: [] },
      { id: '2', title: 'Cooking Recipe', llm: 'Claude', capturedAt: Date.now(), url: '', messages: [] }
    ]);
    render(
      <MemoryRouter>
        <ConversationsList />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Rechercher/i);
    fireEvent.change(input, { target: { value: 'React' } });

    expect(screen.getByText('React Tips')).toBeInTheDocument();
    expect(screen.queryByText('Cooking Recipe')).not.toBeInTheDocument();
  });
});
