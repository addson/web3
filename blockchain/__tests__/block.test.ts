import { describe, it, expect, beforeAll } from '@jest/globals';
import Block from '../src/lib/block';

describe('Block tests', () => {
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block(0, '', 'GENESIS BLOCK');
  });

  it('Should be valid', () => {
    const block = new Block(1, genesis.hash, 'Bloco 2');
    const valid = block.isValid(genesis.hash, genesis.index);
    // console.log(valid.message);
    expect(valid.success).toEqual(true);
  });

  it('Should NOT be valid (previous hash)', () => {
    const block = new Block(1, 'INVALID PREVIOUS HASH', 'Bloco 2');
    const valid = block.isValid(genesis.hash, genesis.index);
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (timestamp)', () => {
    const block = new Block(1, genesis.hash, 'Bloco 2');
    block.timestamp = -1;
    block.hash = block.getHash(); //updating hash based on new
    const valid = block.isValid(genesis.hash, genesis.index);
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (hash)', () => {
    const block = new Block(1, genesis.hash, 'Bloco 2');
    block.hash = '';
    const valid = block.isValid(genesis.hash, genesis.index);
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (data)', () => {
    const block = new Block(1, genesis.hash, '');
    const valid = block.isValid(genesis.hash, genesis.index);
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (index)', () => {
    const block = new Block(-1, genesis.hash, 'Bloco 2');
    const valid = block.isValid(genesis.hash, genesis.index);
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });
});
