import { describe, it, expect, beforeAll } from '@jest/globals';
import Block from '../src/lib/block';
import BlockInfo from '../src/lib/blockInfo';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import TransactionInput from '../src/lib/transactionInput';
import TransactionOutput from '../src/lib/transactionOutput';
import Wallet from '../src/lib/wallet';

describe('Block tests', () => {
  const challengeDifficultExample = 1;
  const minerWalletExample = 'addson';
  let wallet: Wallet;
  let walletTo: Wallet;
  let txInput: TransactionInput;
  let txOutput: TransactionOutput;
  let genesis: Block;

  beforeAll(() => {
    wallet = new Wallet();
    walletTo = new Wallet();

    txInput = new TransactionInput({
      amount: 10,
      fromAddress: wallet.publicKey,
    } as TransactionInput);
    txInput.sign(wallet.privateKey);

    txOutput = new TransactionOutput({
      toAddress: walletTo.publicKey,
      amount: 5,
    } as TransactionOutput);

    genesis = new Block({
      transactions: [
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [txInput],
          txOutputs: [txOutput],
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
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
      ],
    } as Block);

    //so that this block is valid we have to mine
    //a new hash that attends all requirements...
    block.mine(challengeDifficultExample, walletTo.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(true);
  });

  it('Should NOT be valid as there is NOT a FEE TX', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          type: TransactionType.REGULAR,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
      ],
    } as Block);

    //so that this block is valid we have to mine
    //a new hash that attends all requirements...
    block.mine(challengeDifficultExample, walletTo.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
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
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
      ],
    } as BlockInfo);

    //so that this block is valid we have to mine
    //a new hash that attends all requirements...
    block.mine(challengeDifficultExample, walletTo.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(true);
  });

  it('Should NOT be valid as transactions are empty', () => {
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
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
      ],
    } as Block);

    block.mine(challengeDifficultExample, walletTo.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (timestamp)', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          type: TransactionType.REGULAR,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
      ],
    } as Block);

    block.mine(challengeDifficultExample, walletTo.publicKey);

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

    block.mine(challengeDifficultExample, walletTo.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    //console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (more then one transaction with TransactionType.FEE)', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
      ],
    } as Block);

    block.mine(challengeDifficultExample, walletTo.publicKey);

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
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
      ],
    } as Block);

    block.mine(challengeDifficultExample, walletTo.publicKey);

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
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [txInput],
          txOutputs: [txOutput],
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
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
      ],
    } as Block);

    block.mine(challengeDifficultExample, walletTo.publicKey);

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
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
      ],
    } as Block);

    block.mine(challengeDifficultExample, walletTo.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid Block as the feeTx destination is different from miner)', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          type: TransactionType.REGULAR,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
      ],
    } as Block);

    block.mine(challengeDifficultExample, 'OTHER_ADDRESS_MINER');

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid Block (as there is at least one Invalid Transaction)', () => {
    const invalidTx4 = new Transaction({
      type: TransactionType.REGULAR,
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);

    //invalidating the hash
    invalidTx4.hash = 'INVALIDATING HASH';

    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          type: TransactionType.REGULAR,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
        new Transaction({
          type: TransactionType.FEE,
          txInputs: [txInput],
          txOutputs: [txOutput],
        } as Transaction),
        invalidTx4,
      ],
    } as Block);

    block.mine(challengeDifficultExample, walletTo.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });
});
