import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConversationDetail } from './ConversationDetail';
import { storage } from '../lib/storage';

vi.mock('../lib/storage', () => ({
  storage: {
    getConversationById: vi.fn(),
  }
}));

describe('ConversationDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche un message d\'erreur si la conversation n\'est pas trouvée', () => {
    vi.mocked(storage.getConversationById).mockReturnValue(undefined);
    render(
      <MemoryRouter initialEntries={['/conversations/1']}>
        <Routes>
          <Route path="/conversations/:id" element={<ConversationDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Conversation introuvable/i)).toBeInTheDocument();
  });

  it('affiche les détails de la conversation', () => {
    vi.mocked(storage.getConversationById).mockReturnValue({
      id: '1',
      title: 'Ma Conversation',
      llm: 'ChatGPT',
      capturedAt: Date.now(),
      url: 'http://test.com',
      messages: [
        { role: 'user', content: 'Mon message' },
        { role: 'assistant', content: 'Ma réponse' }
      ]
    });
    render(
      <MemoryRouter initialEntries={['/conversations/1']}>
        <Routes>
          <Route path="/conversations/:id" element={<ConversationDetail />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Ma Conversation')).toBeInTheDocument();
    expect(screen.getByText('Mon message')).toBeInTheDocument();
    expect(screen.getByText('Ma réponse')).toBeInTheDocument();
  });
});
