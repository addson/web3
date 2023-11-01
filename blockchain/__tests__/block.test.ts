import { describe, it, expect } from '@jest/globals';
import Block from '../src/lib/block';

describe('Block tests', () => {
  it('Should be valid', () => {
    const block = new Block(1, 'abc', 'Bloco 2');
    const valid = block.isValid();
    expect(valid).toEqual(true);
  });

  it('Should NOT be valid (previous hash)', () => {
    const block = new Block(1, '', 'Bloco 2');
    const valid = block.isValid();
    expect(valid).toEqual(false);
  });

  it('Should NOT be valid (timestamp)', () => {
    const block = new Block(1, 'abc', 'Bloco 2');
    block.timestamp = -1;
    const valid = block.isValid();
    expect(valid).toEqual(false);
  });

  it('Should NOT be valid (hash)', () => {
    const block = new Block(1, 'abc', 'Bloco 2');
    block.hash = '';
    const valid = block.isValid();
    expect(valid).toEqual(false);
  });

  it('Should NOT be valid (data)', () => {
    const block = new Block(1, 'abc', '');
    const valid = block.isValid();
    expect(valid).toEqual(false);
  });

  it('Should NOT be valid (index)', () => {
    const block = new Block(-1, 'abc', 'Bloco 2');
    const valid = block.isValid();
    expect(valid).toEqual(false);
  });
});
