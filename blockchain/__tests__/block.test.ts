import { describe, it, expect, beforeAll } from '@jest/globals';
import Block from '../src/lib/block';
import BlockInfo from '../src/lib/blockInfo';

describe('Block tests', () => {
  const challengeDifficultExample = 0;
  const minerWalletExample = 'addson';
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

    //so that this block is valid we have to mine
    //a new hash that attends all requirements...
    block.mine(challengeDifficultExample, minerWalletExample);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(true);
  });

  it('Should create a block from a BlockInfo', () => {
    const block = Block.blockInfoToBlock({
      index: 1,
      previousHash: genesis.hash,
      difficultChallenge: challengeDifficultExample,
      maxDifficultChallenge: 62,
      feePerTx: 1,
      data: 'Block 2',
    } as BlockInfo);

    //so that this block is valid we have to mine
    //a new hash that attends all requirements...
    block.mine(challengeDifficultExample, minerWalletExample);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(true);
  });

  it('Should NOT be valid (fallbacks)', () => {
    const block = new Block();

    //so that this block is valid we have to mine
    //a new hash that attends all requirements...
    //It's not due to the absence of mining that the block's hash is invalid.
    block.mine(challengeDifficultExample, minerWalletExample);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (previous hash)', () => {
    const block = new Block({
      index: 1,
      previousHash: 'INVALID PREVIOUS HASH',
      data: 'Bloco 2',
    } as Block);

    //so that this block is valid we have to mine
    //a new hash that attends all requirements...
    //It's not due to the absence of mining that the block's hash is invalid.
    block.mine(challengeDifficultExample, minerWalletExample);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (timestamp)', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: 'Bloco 2',
    } as Block);

    //so that this block is valid we have to mine
    //a new hash that attends all requirements...
    //It's not due to the absence of mining that the block's hash is invalid.
    block.mine(challengeDifficultExample, minerWalletExample);

    block.timestamp = -1;
    block.hash = block.getHash(); //updating hash based on new
    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (data)', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: '',
    } as Block);

    //so that this block is valid we have to mine
    //a new hash that attends all requirements...
    //It's not due to the absence of mining that the block's hash is invalid.
    block.mine(challengeDifficultExample, minerWalletExample);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (index)', () => {
    const block = new Block({
      index: -1,
      previousHash: genesis.hash,
      data: 'Bloco 2',
    } as Block);

    //so that this block is valid we have to mine
    //a new hash that attends all requirements...
    //It's not due to the absence of mining that the block's hash is invalid.
    block.mine(challengeDifficultExample, minerWalletExample);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid hash (Block not Mined)', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: 'Bloco 2',
    } as Block);

    block.hash = '';
    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid hash because it has been tampered with', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: 'Bloco 2',
    } as Block);

    //so that this block is valid we have to mine
    //a new hash that attends all requirements...
    //It's not due to the absence of mining that the block's hash is invalid.
    block.mine(challengeDifficultExample, minerWalletExample);

    block.hash = 'hash has been tampered with...';
    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });
});
