import { describe, it, expect, beforeAll } from '@jest/globals';
import Block from '../src/lib/block';
import BlockInfo from '../src/lib/blockInfo';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import TransactionInput from '../src/lib/transactionInput';
import TransactionOutput from '../src/lib/transactionOutput';
import Wallet from '../src/lib/wallet';

describe('Block tests', () => {
  const challengeDifficultExample: number = 1;
  const exampleFee: number = 1;
  const minerWalletExample: string = 'addson';
  const exampleTx: string =
    '29810531fb9a9b748f4080d1856a56d0521fec2f77b2ed56aceae65b0d9c7ee1';

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

  function getFullBlock(): Block {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: wallet.publicKey,
      previousTx: exampleTx,
    } as TransactionInput);
    txInput.sign(wallet.privateKey);

    const txOutput = new TransactionOutput({
      amount: 10,
      toAddress: walletTo.publicKey,
    } as TransactionOutput);

    const transaction = new Transaction({
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);

    const txFee = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [
        new TransactionOutput({
          amount: 1,
          toAddress: wallet.publicKey,
        } as TransactionOutput),
      ],
    } as Transaction);

    const block = new Block({
      index: 1,
      transactions: [transaction, txFee],
      previousHash: genesis.hash,
    } as Block);
    block.mine(challengeDifficultExample, wallet.publicKey);

    return block;
  }

  it('Should be valid', () => {
    const block = getFullBlock();

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
      exampleFee,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(true);
  });

  it('Should NOT be valid (different hash)', () => {
    const block = getFullBlock();

    block.hash = 'Block with different hash has been tampered with...';
    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
      exampleFee,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
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
      exampleFee,
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
      exampleFee,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(true);
  });

  it('Should NOT be valid (more then one transaction type FEE)', () => {
    const block = getFullBlock();
    const tx = new Transaction({
      type: TransactionType.FEE,
      txInputs: undefined,
      txOutputs: [txOutput],
    } as Transaction);
    block.transactions.push(tx);

    block.mine(challengeDifficultExample, walletTo.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
      exampleFee,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (timestamp)', () => {
    const block = getFullBlock();
    block.transactions[0].timestamp = -1;
    block.hash = block.getHash(); //updating hash based on new timestamp
    block.mine(challengeDifficultExample, walletTo.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
      exampleFee,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid as transactions are empty', () => {
    const block = getFullBlock();
    (block.transactions = [] as Array<Transaction>),
      (block.hash = block.getHash()); //updating hash based on new transactions
    block.mine(challengeDifficultExample, walletTo.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
      exampleFee,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (previous hash)', () => {
    const block = getFullBlock();
    block.previousHash = 'INVALID PREVIOUS HASH';
    block.hash = block.getHash(); //updating hash based on new previousHash
    block.mine(challengeDifficultExample, walletTo.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
      exampleFee,
    );
    //console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid (index)', () => {
    const block = getFullBlock();
    block.index = -1;
    block.hash = block.getHash(); //updating hash based on new index
    block.mine(challengeDifficultExample, walletTo.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
      exampleFee,
    );

    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid hash (Block not Mined)', () => {
    const block = getFullBlock();
    block.nonce = 0;
    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
      exampleFee,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid hash (txInput)', () => {
    const block = getFullBlock();
    block.transactions[0].txInputs![0].amount = -1;
    block.hash = block.getHash(); //updating hash based on new txInputs[0]
    block.mine(challengeDifficultExample, walletTo.publicKey);

    const valid = block.isValid(
      genesis.hash,
      genesis.index,
      challengeDifficultExample,
      exampleFee,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid Block (more then one FEE transactions)', () => {
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
      exampleFee,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid Block (feeTx destination is different from miner)', () => {
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
      exampleFee,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be valid Block (at least one Invalid Transaction)', () => {
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
      exampleFee,
    );
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });
});
