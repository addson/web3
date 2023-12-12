import { describe, it, expect, beforeAll } from '@jest/globals';
import Block from '../src/lib/block';
import BlockInfo from '../src/lib/blockInfo';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';

describe('Block tests', () => {
  const challengeDifficultExample = 0;
  const minerWalletExample = 'addson';
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block({
      transactions: [
        new Transaction({
          type: TransactionType.FEE,
          data: 'GENESIS BLOCK',
        } as Transaction),
      ],
    } as Block);
  });

  it('Should be valid', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          type: TransactionType.REGULAR,
          data: 'Bloco 2',
        } as Transaction),
      ],
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
      transactions: [
        new Transaction({
          type: TransactionType.REGULAR,
          data: 'Bloco 2',
        } as Transaction),
      ],
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
      transactions: [
        new Transaction({
          type: TransactionType.REGULAR,
          data: 'Bloco 2',
        } as Transaction),
      ],
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
      transactions: [
        new Transaction({
          type: TransactionType.REGULAR,
          data: 'Bloco 2',
        } as Transaction),
      ],
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

  it('Should NOT be valid (transactions are empty)', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [] as Array<Transaction>,
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

  it('Should NOT be valid (more then one transaction with TransactionType.FEE)', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          type: TransactionType.FEE,
          data: 'Bloco 1',
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          data: 'Bloco 2',
        } as Transaction),
      ],
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
      transactions: [
        new Transaction({
          type: TransactionType.REGULAR,
          data: 'Bloco 2',
        } as Transaction),
      ],
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
      transactions: [
        new Transaction({
          type: TransactionType.REGULAR,
          data: 'Bloco 2',
        } as Transaction),
      ],
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
      transactions: [
        new Transaction({
          type: TransactionType.REGULAR,
          data: 'Bloco 2',
        } as Transaction),
      ],
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

  it('Should NOT be valid Block (as there is more then one FEE transactions)', () => {
    const validTx1 = new Transaction({
      type: TransactionType.FEE,
      data: 'TX type Fee',
    } as Transaction);

    const invalidTx3 = new Transaction({
      type: TransactionType.FEE,
      data: 'TX type Fee',
    } as Transaction);

    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [validTx1, invalidTx3],
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
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid Block (as there is at least one Invalid Transaction)', () => {
    const validTx1 = new Transaction({
      type: TransactionType.FEE,
      data: 'TX type Fee',
    } as Transaction);

    const invalidTx3 = new Transaction({
      type: TransactionType.REGULAR,
      data: '', //wrong empty data
    } as Transaction);

    const invalidTx4 = new Transaction({
      type: TransactionType.REGULAR,
      data: 'TX type Regular',
    } as Transaction);

    //invalidating the hash
    invalidTx4.hash = 'INVALIDATING HASH';

    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [validTx1, invalidTx3, invalidTx4],
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
    expect(valid.success).toEqual(false);
  });
});
