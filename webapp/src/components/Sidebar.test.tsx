import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Sidebar } from './Sidebar';
import { storage } from '../lib/storage';

vi.mock('../lib/storage', () => ({
  storage: {
    getAllFolders: vi.fn(),
    getAllConversations: vi.fn(),
    createFolder: vi.fn(),
    deleteFolder: vi.fn(),
    saveConversation: vi.fn(),
    moveConversationToFolder: vi.fn(),
  }
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storage.getAllFolders).mockReturnValue([]);
    vi.mocked(storage.getAllConversations).mockReturnValue([]);
  });

  it('affiche le titre de l\'application', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.getByText('AgregLLM')).toBeInTheDocument();
  });

  it('affiche la liste des dossiers', () => {
    vi.mocked(storage.getAllFolders).mockReturnValue([
      { id: '1', name: 'Dossier 1' },
      { id: '2', name: 'Dossier 2' }
    ]);
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.getByText('Dossier 1')).toBeInTheDocument();
    expect(screen.getByText('Dossier 2')).toBeInTheDocument();
  });

  it('permet d\'ouvrir le dialogue de création de dossier', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    const addButton = screen.getByTitle('Créer un dossier');
    fireEvent.click(addButton);
    expect(screen.getByText('Nouveau dossier')).toBeInTheDocument();
  });

  it('permet d\'ouvrir le dialogue d\'ajout manuel', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );
    const addLinkButton = screen.getByText(/Ajouter un lien manuel/i);
    fireEvent.click(addLinkButton);
    expect(screen.getByText('Ajouter une conversation')).toBeInTheDocument();
  });
});
