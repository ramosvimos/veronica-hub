// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { verifyArchive } from '../scripts/verify-archive.mjs';

describe('historical archive', () => {
  it('preserves every original route with local links, dated warnings and no active scripts', () => {
    const result = verifyArchive();
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.preservedRoutes).toBe(44);
    expect(result.htmlFiles).toBe(45);
    expect(result.assets).toBe(50);
    expect(result.checkedReferences).toBeGreaterThan(1000);
  }, 20_000);
});
