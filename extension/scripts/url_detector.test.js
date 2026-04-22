import { describe, test, expect } from 'vitest';
const { isChatGPTConversationURL } = require('./url_detector.js');

describe('isChatGPTConversationURL', () => {
  test('should return true for valid ChatGPT URLs', () => {
    const validURLs = [
      "https://chat.openai.com/c/12345678-1234-1234-1234-1234567890ab",
      "https://chatgpt.com/c/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      "https://chat.openai.com/c/0987fedc-ba98-7654-3210-fedcba987654"
    ];
    validURLs.forEach(url => {
      expect(isChatGPTConversationURL(url)).toBe(true);
    });
  });

  test('should return false for invalid ChatGPT URLs', () => {
    const invalidURLs = [
      "https://chat.openai.com/c/abcdefgh-abcd-abcd-abcd-abcdefghijkl",
      "https://chat.openai.com/c/a-real-uuid-v4-would-be-here-now-yo",
      "https://chat.openai.com/",
      "https://chat.openai.com/auth/login",
      "https://google.com/c/12345678-1234-1234-1234-1234567890ab",
      "https://chatgpt.com/c/",
      "https://chatgpt.com/c/not-a-uuid",
      "https://example.com",
      null,
      ""
    ];
    invalidURLs.forEach(url => {
      expect(isChatGPTConversationURL(url)).toBe(false);
    });
  });
});
