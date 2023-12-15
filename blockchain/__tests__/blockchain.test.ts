import { describe, it, expect, jest } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';

//mocking the block class
jest.mock('../src/lib/block');

describe('Blockchain tests', () => {
  it('Should has the first GENESIS block', () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks.length).toBeGreaterThan(0);
  });

  it('Should be valid (Genesis)', () => {
    const blockchain = new Blockchain();
    const validation = blockchain.isValid();
    // console.log(validation.message);
    expect(validation.success).toEqual(true);
  });

  it('Should find a block by hash', () => {
    const blockchain = new Blockchain();
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
    const blockchain = new Blockchain();
    const validation = blockchain.isValid();
    // console.log(validation.message);

    const block: Block | undefined = blockchain.getBlock('INVALID HASH');
    let findBlock: boolean = false;
    if (block) findBlock = true;

    expect(validation.success && findBlock).toEqual(false);
  });

  it('Should be valid (two blocks)', () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        transactions: [
          new Transaction({
            type: TransactionType.REGULAR,
            data: 'Bloco 2',
          } as Transaction),
        ],
      } as Block),
    );
    const validation = blockchain.isValid();
    // console.log(validation.message);
    expect(validation.success).toEqual(true);
  });

  it('Should NOT be valid (two blocks)', () => {
    const blockchain = new Blockchain();

    const tx = new Transaction({
      type: TransactionType.REGULAR,
      data: 'TX',
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
    const blockchain = new Blockchain();
    const emptyTransactions = [] as Transaction[];
    const validation = blockchain.addTransactions(emptyTransactions);
    expect(validation.success).toEqual(false);
  });

  it('Should NOT add duplicated transactions in transactionsMemPool', () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({
      type: TransactionType.REGULAR,
      data: 'TX',
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
    const blockchain = new Blockchain();

    const tx = new Transaction({
      type: TransactionType.REGULAR,
      data: 'TX',
    } as Transaction);

    blockchain.transactionsMemPool.push(tx);

    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        transactions: [tx],
      } as Block),
    );

    const validation = blockchain.addTransactions([
      blockchain.blocks[1].transactions.find(
        txActual => txActual.hash === tx.hash,
      ),
    ] as Transaction[]);

    // console.log(validation.message);
    expect(validation.success).toEqual(false);
  });

  it('Should NOT add transactions as at least one of these txs is invalid', () => {
    const blockchain = new Blockchain();

    const tx1 = new Transaction({
      type: TransactionType.REGULAR,
      data: 'TX1',
    } as Transaction);

    const tx2 = new Transaction({
      type: TransactionType.REGULAR,
      data: 'TX2',
    } as Transaction);
    tx2.hash = 'INVALIDATING HASH';

    const validation = blockchain.addTransactions([tx1, tx2] as Transaction[]);

    // console.log(validation.message);
    expect(validation.success).toEqual(false);
  });

  it('Should add transactions correctly', () => {
    const blockchain = new Blockchain();

    const tx1 = new Transaction({
      type: TransactionType.REGULAR,
      data: 'TX1',
    } as Transaction);

    const tx2 = new Transaction({
      type: TransactionType.REGULAR,
      data: 'TX2',
    } as Transaction);

    const validation = blockchain.addTransactions([tx1, tx2] as Transaction[]);

    // console.log(validation.message);
    expect(validation.success).toEqual(true);
  });

  it('Should get transaction from transactionsMemPool', () => {
    const blockchain = new Blockchain();

    const tx1 = new Transaction({
      type: TransactionType.REGULAR,
      data: 'TX1',
    } as Transaction);

    const tx2 = new Transaction({
      type: TransactionType.REGULAR,
      data: 'TX2',
    } as Transaction);

    blockchain.addTransactions([tx1, tx2] as Transaction[]);

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
    const blockchain = new Blockchain();

    const tx1 = new Transaction({
      type: TransactionType.REGULAR,
      data: 'TX1',
    } as Transaction);

    const tx2 = new Transaction({
      type: TransactionType.REGULAR,
      data: 'TX2',
    } as Transaction);

    blockchain.addTransactions([tx1, tx2] as Transaction[]);

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
    const blockchain = new Blockchain();

    //added just tx1
    const tx1 = new Transaction({
      type: TransactionType.REGULAR,
      data: 'TX1',
    } as Transaction);
    blockchain.addTransactions([tx1] as Transaction[]);

    //tx2 not added, but we try search it on blockchain
    const tx2 = new Transaction({
      type: TransactionType.REGULAR,
      data: 'TX2',
    } as Transaction);
    const transactionSearch = blockchain.getTransaction(tx2.hash);

    expect(transactionSearch?.blockIndex).toEqual(-1);
    expect(transactionSearch?.memPoolIndex).toEqual(-1);
    expect(transactionSearch?.transaction).toBeUndefined();
    // console.log(transactionSearch);
  });

  it('Should add block', () => {
    const blockchain = new Blockchain();

    const tx = new Transaction({
      type: TransactionType.REGULAR,
      data: 'TX',
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

  it('Should NOT add block', () => {
    const blockchain = new Blockchain();
    const validation = blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: 'WRONG PREVIOUS HASH',
        transactions: [
          new Transaction({
            type: TransactionType.REGULAR,
            data: 'Bloco 2',
          } as Transaction),
        ],
      } as Block),
    );
    // console.log(validation.message);
    expect(validation.success).toEqual(false);
  });

  it('Should get the next block info from the blockchain for mining.', () => {
    const blockchain = new Blockchain();
    // adding a new transaction on transactionMemPool
    blockchain.transactionsMemPool.push(new Transaction());
    const info = blockchain.getNextBlock();
    expect(info ? info.index : 0).toEqual(1);
  });

  it('Should NOT get the next block info from the blockchain for mining.', () => {
    const blockchain = new Blockchain();
    const info = blockchain.getNextBlock();
    // as transactionsMemPool is empty
    expect(info).toBeNull();
  });
});
