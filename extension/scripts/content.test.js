// content.test.js - Tests pour la capture, détection d'erreur et modale
import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock global chrome/browser
const chromeMock = {
  runtime: {
    onMessage: {
      addListener: vi.fn()
    },
    sendMessage: vi.fn()
  }
};
global.chrome = chromeMock;
global.browser = chromeMock;
window.chrome = chromeMock;
window.browser = chromeMock;

import { capture, detectError, showLoginHelper } from './content.js';

describe('Content Script', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    delete window.location;
    window.location = new URL('https://chatgpt.com/c/123');
    vi.clearAllMocks();
  });

  describe('Capture Account Email', () => {
    test('should capture accountEmail on ChatGPT if present', () => {
      const emailDiv = document.createElement('div');
      emailDiv.className = 'text-token-text-tertiary';
      emailDiv.textContent = 'user@example.com';
      document.body.appendChild(emailDiv);

      const result = capture();
      expect(result.data.accountEmail).toBe('user@example.com');
    });

    test('should capture username if email is not present on ChatGPT', () => {
      const profileBtn = document.createElement('button');
      profileBtn.setAttribute('data-testid', 'profile-button');
      const nameDiv = document.createElement('div');
      nameDiv.className = 'truncate';
      nameDiv.textContent = 'Adocart';
      profileBtn.appendChild(nameDiv);
      document.body.appendChild(profileBtn);

      const result = capture();
      expect(result.data.accountEmail).toBe('Adocart');
    });
  });

  describe('Error Detection', () => {
    test('should detect 404 error on ChatGPT', () => {
      document.body.innerText = "Error 404: Conversation not found";
      expect(detectError()).toBe(true);
    });

    test('should detect French "Impossible de charger la conversation" on ChatGPT', () => {
      document.body.innerText = "Impossible de charger la conversation";
      expect(detectError()).toBe(true);
    });

    test('should detect French "Impossible de charger la discussion" on ChatGPT', () => {
      document.body.innerText = "Impossible de charger la discussion";
      expect(detectError()).toBe(true);
    });

    test('should return false if no error text', () => {
      document.body.innerText = "Hello, how can I help you today?";
      expect(detectError()).toBe(false);
    });
  });

  describe('Login Helper Modal', () => {
    test('should inject the modal into the DOM', () => {
      showLoginHelper('test@example.com');
      const modal = document.getElementById('agregllm-login-helper');
      expect(modal).not.toBeNull();
      expect(modal.textContent).toContain('test@example.com');
    });

    test('should not inject twice', () => {
      showLoginHelper('test@example.com');
      showLoginHelper('other@example.com');
      const modals = document.querySelectorAll('#agregllm-login-helper');
      expect(modals.length).toBe(1);
    });
  });
});
