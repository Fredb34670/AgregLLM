import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('Routage de base', () => {
  it('affiche le message de bienvenue sur la route racine', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Bienvenue dans AgregLLM/i)).toBeInTheDocument();
  });

  it('affiche la liste des conversations sur /conversations', () => {
    render(
      <MemoryRouter initialEntries={['/conversations']}>
        <App />
      </MemoryRouter>
    );
    // Ce test échouera tant que nous n'avons pas implémenté le routage
    expect(screen.getAllByText(/Toutes les discussions/i).length).toBeGreaterThan(0);
  });
});
