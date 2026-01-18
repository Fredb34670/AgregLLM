import { describe, it, expect } from 'vitest';
import { generateTags, findBestFolder } from './automation';

describe('automation utils', () => {
  describe('generateTags', () => {
    it('should generate tags from text', () => {
      const text = 'Comment créer une application React avec TypeScript et Tailwind CSS';
      const tags = generateTags(text);
      expect(tags).toContain('créer');
      expect(tags).toContain('application');
      expect(tags).toContain('react');
      expect(tags).toContain('typescript');
      expect(tags.length).toBeLessThanOrEqual(4);
    });

    it('should filter out stop words', () => {
      const text = 'le la les un une des de du';
      const tags = generateTags(text);
      expect(tags).toEqual([]);
    });

    it('should return empty array for empty text', () => {
      expect(generateTags('')).toEqual([]);
    });
  });

  describe('findBestFolder', () => {
    const folders = [
      { id: '1', name: 'Travail' },
      { id: '2', name: 'Perso' },
      { id: '3', name: 'Code' }
    ];

    it('should find the best folder based on text', () => {
      expect(findBestFolder('Une discussion sur le Travail', folders)).toBe('1');
      expect(findBestFolder('Mon code est ici', folders)).toBe('3');
    });

    it('should return undefined if no match', () => {
      expect(findBestFolder('Rien du tout', folders)).toBeUndefined();
    });

    it('should return undefined for empty text or folders', () => {
      expect(findBestFolder('', folders)).toBeUndefined();
      expect(findBestFolder('test', [])).toBeUndefined();
    });
  });
});
