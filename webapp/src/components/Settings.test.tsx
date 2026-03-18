import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Settings } from './Settings';
import { storage } from '../lib/storage';
import { gdrive } from '../lib/google-drive';
import { TooltipProvider } from './ui/tooltip';

vi.mock('../lib/storage', () => ({
  storage: {
    getAllConversations: vi.fn(),
    importData: vi.fn(),
    exportData: vi.fn(),
    renameTag: vi.fn(),
    deleteTag: vi.fn(),
  }
}));

vi.mock('../lib/google-drive', () => ({
  gdrive: {
    init: vi.fn(),
    isAuthenticated: vi.fn(),
    getUserInfo: vi.fn(),
    loadFromDrive: vi.fn(),
    syncToDrive: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  }
}));

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storage.getAllConversations).mockReturnValue([]);
    vi.mocked(gdrive.isAuthenticated).mockReturnValue(false);
  });

  it('affiche le titre et les sections', () => {
    render(
      <MemoryRouter>
        <TooltipProvider>
          <Settings />
        </TooltipProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Paramètres')).toBeInTheDocument();
    expect(screen.getByText('Google Drive Cloud')).toBeInTheDocument();
    expect(screen.getByText('Sauvegarde locale')).toBeInTheDocument();
  });

  it('affiche le bouton de synchronisation avec son tooltip quand connecté', async () => {
    vi.mocked(gdrive.isAuthenticated).mockReturnValue(true);
    vi.mocked(gdrive.getUserInfo).mockResolvedValue({ name: 'Test User', email: 'test@example.com' });
    
    render(
      <MemoryRouter>
        <TooltipProvider>
          <Settings />
        </TooltipProvider>
      </MemoryRouter>
    );

    // Attendre que les infos utilisateur soient chargées
    await waitFor(() => {
      expect(screen.getByText(/Compte Google: test@example.com/i)).toBeInTheDocument();
    });

    const syncButton = screen.getByRole('button', { name: /Sync\./i });
    expect(syncButton).toBeInTheDocument();
    
    // Le tooltip content n'est pas forcément dans le DOM au départ
    // Mais le trigger doit être là. 
    // Radix TooltipTrigger asChild met des attributs sur le bouton.
    expect(syncButton).toHaveAttribute('data-state', 'closed');
  });
});
