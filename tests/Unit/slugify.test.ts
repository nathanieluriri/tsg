import { describe, it, expect } from 'vitest';
import { slugify } from '../../src/lib/slugify';

describe('slugify', () => {
  it('lowercases and strips punctuation', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
  });
  it('handles repeated whitespace', () => {
    expect(slugify('  Multi   Word  ')).toBe('multi-word');
  });
});
