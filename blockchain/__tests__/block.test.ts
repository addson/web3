import { describe, it, expect, beforeAll } from '@jest/globals';
import Block from '../src/lib/block';

describe('Block tests', () => {
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block({
      data: 'GENESIS BLOCK',
    } as Block);
  });

  it('Should be valid', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: 'Bloco 2',
    } as Block);

    const valid = block.isValid(genesis.hash, genesis.index);
    console.log(valid.message);
    expect(valid.success).toEqual(true);
  });

  it('Should NOT be valid (fallbacks)', () => {
    const block = new Block();

    const valid = block.isValid(genesis.hash, genesis.index);
    console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (previous hash)', () => {
    const block = new Block({
      index: 1,
      previousHash: 'INVALID PREVIOUS HASH',
      data: 'Bloco 2',
    } as Block);

    const valid = block.isValid(genesis.hash, genesis.index);
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (timestamp)', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: 'Bloco 2',
    } as Block);

    block.timestamp = -1;
    block.hash = block.getHash(); //updating hash based on new
    const valid = block.isValid(genesis.hash, genesis.index);
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (hash)', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: 'Bloco 2',
    } as Block);

    block.hash = '';
    const valid = block.isValid(genesis.hash, genesis.index);
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (data)', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: '',
    } as Block);

    const valid = block.isValid(genesis.hash, genesis.index);
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (index)', () => {
    const block = new Block({
      index: -1,
      previousHash: genesis.hash,
      data: 'Bloco 2',
    } as Block);

    const valid = block.isValid(genesis.hash, genesis.index);
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });
});
