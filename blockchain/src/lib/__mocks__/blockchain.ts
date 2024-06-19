import Block from './block';
import Validation from '../validation';
import BlockInfo from '../blockInfo';
import Transaction from '../transaction';
import TransactionType from '../transactionType';
import TransactionSearch from '../transactionSearch';
import TransactionInput from '../transactionInput';
import TransactionOutput from '../transactionOutput';

/**
 * The mocked blockchain class that represents all chain of blocks
 */
export default class Blockchain {
  transactionsMemPool: Transaction[];
  blocks: Block[];
  nextIndex: number = 0;

  /**
   * The constructor always creates the first block, that is called by GENESIS.
   */
  constructor() {
    this.transactionsMemPool = [];
    this.blocks = [
      new Block({
        index: 0,
        hash: 'abc',
        previousHash: '',
        transactions: [
          new Transaction({
            type: TransactionType.FEE,
            txInputs: [new TransactionInput()],
            txOutputs: [new TransactionOutput()],
          } as Transaction),
        ],
        timestamp: Date.now(),
      } as Block),
    ];
    this.nextIndex++;
  }

  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  /**
   * Adding new Mocked Block to blockchain
   *
   * @param block
   * @returns if all is ok return true
   */
  addBlock(block: Block): Validation {
    if (block.index < 0) return new Validation(false, `Invalid Mock Block`);

    this.blocks.push(block);
    this.nextIndex++;

    return new Validation();
  }

  /**
   * Mock Blockchain is  always valid
   *
   * @returns Validation
   */
  isValid(): Validation {
    return new Validation();
  }

  /**
   * Gets the Block by hash
   *
   * @param hash target block to find
   * @returns the block found
   */
  getBlock(hash: string): Block | undefined {
    return this.blocks.find(b => b.hash === hash);
  }

  /**
   * Returns the reward for each transaction made in the mined block.
   *
   * @returns fee per each Tx in block
   */
  getFeePerTx(): number {
    return 1;
  }

  /**
   * Get all data provided by the blockchain for the next block to be mined.
   *
   */
  getNextBlock(): BlockInfo {
    const transactions = [
      //todo not done yet...
      new Transaction({
        type: TransactionType.REGULAR,
        txInputs: [new TransactionInput()],
        txOutputs: [new TransactionOutput()],
      } as Transaction),
    ];
    const difficultChallenge = 1;
    const previousHash = this.getLastBlock().hash;
    const index = this.blocks.length;
    const feePerTx = this.getFeePerTx();
    const maxDifficultChallenge = 62;

    return {
      transactions,
      difficultChallenge,
      previousHash,
      index,
      feePerTx,
      maxDifficultChallenge,
    } as BlockInfo;
  }

  addTransactions(transactions: Transaction[]): Validation {
    if (!transactions || transactions.length === 0) {
      return new Validation(
        false,
        'These txs are empty, so could not be added.',
      );
    }

    const validations = transactions.map(tx => tx.isValid());
    if (validations.filter(val => !val.success).length > 0) {
      return new Validation(
        false,
        'At least one of these txs is invalid, so could not be added.',
      );
    }

    //if theses transactions are valid, so we add all these on the transactionsMemPool
    this.transactionsMemPool.push(...transactions);

    return new Validation(
      true,
      `Transactions added to transactionsMemPool: ${transactions.reduce(
        (txString, transaction) => {
          return txString + ' - ' + transaction.hash;
        },
        '',
      )}`,
    );
  }

  getTransaction(hash: string): TransactionSearch | undefined {
    const memPoolIndex = this.transactionsMemPool.findIndex(
      tx => tx.hash === hash,
    );
    if (memPoolIndex !== -1) {
      return {
        transaction: this.transactionsMemPool[memPoolIndex],
        memPoolIndex,
      } as TransactionSearch;
    }

    const blockIndex = this.blocks.findIndex(b =>
      b.transactions.some(tx => tx.hash === hash),
    );
    if (blockIndex !== -1) {
      return {
        transaction: this.blocks[blockIndex].transactions.find(
          tx => tx.hash === hash,
        ),
        blockIndex,
      } as TransactionSearch;
    }

    return { blockIndex: -1, memPoolIndex: -1 } as TransactionSearch;
  }
}
