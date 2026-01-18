import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConversationsList } from './ConversationsList';
import { storage } from '../lib/storage';

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
  }
}));

describe('ConversationsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
