import { describe, it, expect } from '@jest/globals';
import Block from '../src/lib/block';

describe('Block tests', () => {
  it('Should be valid', () => {
    const block = new Block(1, 'abc');
    block.created = new Date(2023, 0, 1);
    const valid = block.isValid();
    expect(valid).toEqual(true);
  });

  it('Should NOT be valid (hash)', () => {
    const block = new Block(1, '');
    block.created = new Date(2023, 0, 1);
    const valid = block.isValid();
    expect(valid).toEqual(false);
  });

  it('Should NOT be valid (index)', () => {
    const block = new Block(-1, 'abc');
    block.created = new Date(2023, 0, 1);
    const valid = block.isValid();
    expect(valid).toEqual(false);
  });
});
