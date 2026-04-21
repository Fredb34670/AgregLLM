// content.test.js - Ajout de tests pour la capture de l'email
import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock global chrome/browser AVANT l'import du script
const chromeMock = {
  runtime: {
    onMessage: {
      addListener: vi.fn()
    }
  }
};
global.chrome = chromeMock;
global.browser = chromeMock;
window.chrome = chromeMock;
window.browser = chromeMock;

import { capture } from './content.js';

describe('Capture Account Email', () => {
  beforeEach(() => {
    // Mock du DOM minimal
    document.body.innerHTML = '';
    delete window.location;
    window.location = new URL('https://chatgpt.com/c/123');
  });

  test('should capture accountEmail on ChatGPT if present', () => {
    // Simulation d'un sélecteur possible pour l'email
    const emailDiv = document.createElement('div');
    emailDiv.className = 'text-token-text-tertiary';
    emailDiv.innerText = 'user@example.com';
    document.body.appendChild(emailDiv);

    const result = capture();
    expect(result.data.accountEmail).toBe('user@example.com');
  });

  test('should return undefined accountEmail if not found', () => {
    const result = capture();
    expect(result.data.accountEmail).toBeUndefined();
  });
});
