import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Firefox Manifest Validation', () => {
  const manifestPath = path.resolve(__dirname, '../../firefox-submission/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  it('ne devrait pas contenir data_collection_permissions', () => {
    const gecko = manifest.browser_specific_settings?.gecko;
    expect(gecko?.data_collection_permissions).toBeUndefined();
  });

  it('devrait avoir une strict_min_version raisonnable (inférieure à 140.0)', () => {
    const gecko = manifest.browser_specific_settings?.gecko;
    const minVersion = gecko?.strict_min_version;
    expect(minVersion).toBeDefined();
    const versionNum = parseFloat(minVersion);
    expect(versionNum).toBeLessThan(140.0);
  });

  it('devrait être en Manifest V2', () => {
    expect(manifest.manifest_version).toBe(2);
  });
});
