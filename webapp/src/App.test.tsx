import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { useCloudStatus } from './lib/cloud-status';

vi.mock('./lib/cloud-status', () => ({
  useCloudStatus: vi.fn(),
}));

vi.mock('./lib/storage', () => ({
  storage: {
    getAllConversations: vi.fn().mockReturnValue([]),
    getAllFolders: vi.fn().mockReturnValue([]),
    importData: vi.fn(),
  }
}));

vi.mock('./lib/google-drive', () => ({
  gdrive: {
    init: vi.fn().mockResolvedValue(undefined),
    isAuthenticated: vi.fn().mockReturnValue(false),
    autoLoad: vi.fn().mockResolvedValue(null),
    login: vi.fn(),
    logout: vi.fn(),
  }
}));

describe('App et Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le bandeau de notification cloud quand déconnecté (accueil)', () => {
    (useCloudStatus as any).mockReturnValue({
      isConnected: false,
      login: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Attention : discussions sauvegardées localement/i)).toBeInTheDocument();
  });

  it('affiche le bandeau de notification cloud quand déconnecté (conversations)', () => {
    (useCloudStatus as any).mockReturnValue({
      isConnected: false,
      login: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/conversations']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Attention : discussions sauvegardées localement/i)).toBeInTheDocument();
  });

  it('n\'affiche pas le bandeau de notification cloud quand connecté', () => {
    (useCloudStatus as any).mockReturnValue({
      isConnected: true,
      login: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.queryByText(/Attention : discussions sauvegardées localement/i)).not.toBeInTheDocument();
  });

  it('affiche le message de bienvenue sur la route racine', async () => {
    (useCloudStatus as any).mockReturnValue({
      isConnected: true,
      login: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Bienvenue dans AgregLLM/i)).toBeInTheDocument();
  });
});
