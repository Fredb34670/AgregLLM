import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { gdrive } from './lib/google-drive';
import { storage } from './lib/storage';

// Mock dependencies
vi.mock('./lib/google-drive', () => ({
  gdrive: {
    init: vi.fn().mockResolvedValue(undefined),
    isAuthenticated: vi.fn(),
    autoLoad: vi.fn().mockResolvedValue(null),
    loadFromDrive: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  }
}));

vi.mock('./lib/storage', () => ({
  storage: {
    getAllConversations: vi.fn().mockReturnValue([]),
    getAllFolders: vi.fn().mockReturnValue([]),
    importData: vi.fn(),
  }
}));

describe('App Autoload on Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait déclencher loadFromDrive lors de la réception de l\'événement auth-success', async () => {
    (gdrive.isAuthenticated as any).mockReturnValue(false);
    (gdrive.loadFromDrive as any).mockResolvedValue('{"conversations": []}');

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Simuler la réussite de l'authentification
    window.dispatchEvent(new CustomEvent('agregllm-gdrive-auth-success'));

    await waitFor(() => {
      expect(gdrive.loadFromDrive).toHaveBeenCalled();
      expect(storage.importData).toHaveBeenCalled();
    });
  });
});
