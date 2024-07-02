import { describe, it, expect, jest, beforeAll } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import TransactionInput from '../src/lib/transactionInput';
import Wallet from '../src/lib/wallet';
import TransactionOutput from '../src/lib/transactionOutput';

// //mocking the block class
jest.mock('../src/lib/block');

describe('Blockchain tests', () => {
  let wallet: Wallet;
  let walletTo: Wallet;
  let txInput: TransactionInput;
  let txOutput: TransactionOutput;

  const challengeDifficultExample: number = 1;
  const exampleFee: number = 1;
  const exampleTx: string =
    '29810531fb9a9b748f4080d1856a56d0521fec2f77b2ed56aceae65b0d9c7ee1';
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

  it('Should has the first GENESIS block', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    expect(blockchain.blocks.length).toBeGreaterThan(0);
  });

  it('Should be valid (Genesis)', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    const validation = blockchain.isValid();
    // console.log(validation.message);
    expect(validation.success).toEqual(true);
  });

  it('Should find a block by hash', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    const validation = blockchain.isValid();
    // console.log(validation.message);

    const block: Block | undefined = blockchain.getBlock(
      blockchain.blocks[0].hash,
    );
    let findBlock: boolean = false;
    if (block) findBlock = true;

    expect(validation.success && findBlock).toEqual(true);
  });

  it('Should NOT find a block by hash', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    const validation = blockchain.isValid();
    // console.log(validation.message);

    const block: Block | undefined = blockchain.getBlock('INVALID HASH');
    let findBlock: boolean = false;
    if (block) findBlock = true;

    expect(validation.success && findBlock).toEqual(false);
  });

  it('Should be valid (two blocks)', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        transactions: [
          new Transaction({
            type: TransactionType.REGULAR,
            txInputs: [txInput],
            txOutputs: [txOutput],
          } as Transaction),
        ],
      } as Block),
    );
    const validation = blockchain.isValid();
    // console.log(validation.message);
    expect(validation.success).toEqual(true);
  });

  it('Should NOT be valid (two blocks)', () => {
    const blockchain = new Blockchain(wallet.publicKey);

    const tx = new Transaction({
      type: TransactionType.REGULAR,
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);

    blockchain.transactionsMemPool.push(tx);

    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        transactions: [tx],
      } as Block),
    );
    blockchain.blocks[1].index = -1;
    const validation = blockchain.isValid();
    // console.log(validation.message);
    expect(validation.success).toEqual(false);
  });

  it('Should NOT add empty transactions', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    const emptyTransactions = [] as Transaction[];
    const validation = blockchain.addTransactions(emptyTransactions);
    expect(validation.success).toEqual(false);
  });

  it('Should NOT add duplicated transactions in transactionsMemPool', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    const tx = new Transaction({
      type: TransactionType.REGULAR,
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);

    blockchain.transactionsMemPool.push(tx);

    const validation = blockchain.addTransactions([
      blockchain.transactionsMemPool.find(
        txActual => txActual.hash === tx.hash,
      ),
    ] as Transaction[]);
    expect(validation.success).toEqual(false);
  });

  it('Should NOT add duplicated transactions in Blockchain', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    const txo = blockchain.blocks[0].transactions[0];

    const validation = blockchain.addTransactions([txo] as Transaction[]);

    // console.log(validation.message);
    expect(validation.success).toEqual(false);
  });

  it('Should NOT add transactions as at least one of these txs is invalid', () => {
    const blockchain = new Blockchain(wallet.publicKey);

    //it is to not fire unspendable transaction output
    const txo = blockchain.blocks[0].transactions[0];
    txInput.previousTx = txo.hash;

    const tx1 = new Transaction({
      type: TransactionType.REGULAR,
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);
    tx1.hash = 'WRONG HASH';

    const validation = blockchain.addTransactions([tx1] as Transaction[]);

    // console.log(validation.message);
    expect(validation.success).toEqual(false);
  });

  it('Should add transactions correctly', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    const txg = blockchain.blocks[0].transactions[0];

    txInput.previousTx = txg.hash;
    const tx1 = new Transaction({
      type: TransactionType.REGULAR,
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);

    const validation = blockchain.addTransactions([tx1] as Transaction[]);

    // console.log(validation.message);
    expect(validation.success).toEqual(true);
  });

  it('Should NOT add transaction with pending tx', () => {
    const blockchain = new Blockchain(wallet.publicKey);

    const tx2 = new Transaction({
      type: TransactionType.REGULAR,
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);
    const validation = blockchain.addTransactions([tx2] as Transaction[]);

    // console.log(validation.message);
    expect(validation.success).toEqual(false);
  });

  it('Should get transaction from transactionsMemPool', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    const txg = blockchain.blocks[0].transactions[0];
    txInput.previousTx = txg.hash;

    const tx1 = new Transaction({
      type: TransactionType.REGULAR,
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);

    blockchain.addTransactions([tx1] as Transaction[]);

    const transactionSearch = blockchain.getTransaction(tx1.hash);
    //It always will be found on memPool
    const transactionFoundInMemPool = blockchain.transactionsMemPool.find(
      tx => tx.hash === tx1.hash,
    );
    expect(transactionSearch?.transaction.hash).toEqual(
      transactionFoundInMemPool
        ? transactionFoundInMemPool.hash
        : 'NEVER_FIRE_HERE',
    );
    // console.log(transactionSearch);
  });

  it('Should get transaction from some blockchain block', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    const txg = blockchain.blocks[0].transactions[0];
    txInput.previousTx = txg.hash;

    const tx1 = new Transaction({
      type: TransactionType.REGULAR,
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);

    const tx2 = new Transaction({
      type: TransactionType.REGULAR,
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);

    blockchain.addTransactions([tx1] as Transaction[]);

    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        transactions: [tx2],
      } as Block),
    );

    //It never will be found on memPool
    const transactionFoundInMemPool = blockchain.transactionsMemPool.find(
      tx => tx.hash === tx2.hash,
    );
    expect(transactionFoundInMemPool).toBeUndefined();

    //It will be found in blockchain
    const transactionSearch = blockchain.getTransaction(tx2.hash);
    const transactionFoundInBlockchain = blockchain.blocks[
      transactionSearch?.blockIndex ? transactionSearch?.blockIndex : -1
    ].transactions.find(tx => tx.hash === tx2.hash);

    expect(transactionSearch?.transaction.hash).toEqual(
      transactionFoundInBlockchain
        ? transactionFoundInBlockchain.hash
        : 'NEVER_FIRE_HERE',
    );
    // console.log(transactionSearch);
  });

  it('Should NOT found any transaction anywhere calling get transaction', () => {
    const blockchain = new Blockchain(wallet.publicKey);

    //added just tx1
    const tx1 = new Transaction({
      type: TransactionType.REGULAR,
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);
    blockchain.addTransactions([tx1] as Transaction[]);

    //tx2 not added, but we try search it on blockchain
    const tx2 = new Transaction({
      type: TransactionType.REGULAR,
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);
    const transactionSearch = blockchain.getTransaction(tx2.hash);

    expect(transactionSearch?.blockIndex).toEqual(-1);
    expect(transactionSearch?.memPoolIndex).toEqual(-1);
    expect(transactionSearch?.transaction).toBeUndefined();
    // console.log(transactionSearch);
  });

  it('Should add block', () => {
    const blockchain = new Blockchain(wallet.publicKey);

    const tx = new Transaction({
      type: TransactionType.REGULAR,
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);

    blockchain.transactionsMemPool.push(tx);

    const validation = blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        transactions: [tx],
      } as Block),
    );
    // console.log(validation.message);
    expect(validation.success).toEqual(true);
  });

  it('Should NOT add block (invalid transactions mainpool)', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    blockchain.transactionsMemPool.push(new Transaction());
    blockchain.transactionsMemPool.push(new Transaction());

    const tx = new Transaction({
      type: TransactionType.REGULAR,
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);
    //blockchain.transactionsMemPool.push(tx);

    const validation = blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        transactions: [tx],
      } as Block),
    );
    // console.log(validation.message);
    expect(validation.success).toBeFalsy();
  });

  it('Should NOT add block', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    blockchain.transactionsMemPool.push(new Transaction());
    const validation = blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: 'WRONG PREVIOUS HASH',
        transactions: [
          new Transaction({
            type: TransactionType.REGULAR,
            txInputs: [txInput],
            txOutputs: [txOutput],
          } as Transaction),
        ],
      } as Block),
    );
    // console.log(validation.message);
    expect(validation.success).toEqual(false);
  });

  it('Should get the next block info from the blockchain for mining.', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    // adding a new transaction on transactionMemPool
    blockchain.transactionsMemPool.push(new Transaction());
    const info = blockchain.getNextBlock();
    expect(info ? info.index : 0).toEqual(1);
  });

  it('Should NOT get the next block info from the blockchain for mining.', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    const info = blockchain.getNextBlock();
    // as transactionsMemPool is empty
    expect(info).toBeNull();
  });

  it('Should getBalance from a wallet', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    const block = getFullBlock();
    blockchain.addBlock(block);
    const result = blockchain.getBalance(wallet.publicKey);
    //console.log(result);
    expect(result).toEqual(630);
  });

  it('Should get zero Balance from a wallet', () => {
    const blockchain = new Blockchain(wallet.publicKey);
    const result = blockchain.getBalance(walletTo.publicKey);
    //console.log(result);
    expect(result).toEqual(0);
  });

  it('Should get UTXO', () => {
    const blockchain = new Blockchain(wallet.publicKey);

    //it is to not fire unspendable transaction output
    const txo = blockchain.blocks[0].transactions[0];
    txInput.previousTx = txo.hash;

    const tx1 = new Transaction({
      type: TransactionType.REGULAR,
      txInputs: [txInput],
      txOutputs: [
        txOutput,
        new TransactionOutput({
          toAddress: wallet.publicKey,
          amount: 4,
        } as TransactionOutput),
      ],
    } as Transaction);

    blockchain.blocks.push(
      new Block({
        index: 1,
        transactions: [tx1],
      } as Block),
    );

    const result = blockchain.getUtxo(wallet.publicKey);
    // console.log(result);
    expect(result.length).toBeGreaterThan(0);
  });
});
