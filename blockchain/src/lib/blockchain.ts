import Block from './block';
import Validation from './validation';
import BlockInfo from './blockInfo';
import Transaction from './transaction';
import TransactionType from './transactionType';
import TransactionSearch from './transactionSearch';

/**
 * The blockchain class that represents all chain of blocks
 */
export default class Blockchain {
  // Candidate transactions to enter the next blocks.
  transactionsMemPool: Transaction[];

  //Blockchain blocks list
  blocks: Block[];

  nextIndex: number = 0;

  // static to running just once globally fo all class instances
  // readonly means that this fild can not be changed.
  // Increasing the difficulty every N number blocks.
  static readonly CHALLENGE_FIFFICULTY_FACTOR: number = 3;

  //the miner will have to generates a hash with 62 hashs on the left
  static readonly MAX_CHALLENGE_FIFFICULTY_FACTOR: number = 62;

  //the max quantity of transactions per block
  static readonly TX_MAX_PER_BLOCK: number = 2;

  /**
   * The constructor always creates the first block, that is called by GENESIS.
   */
  constructor() {
    this.transactionsMemPool = [];
    this.blocks = [
      new Block({
        index: this.nextIndex,
        previousHash: '',
        transactions: [
          new Transaction({
            type: TransactionType.FEE,
            data: 'GENESIS BLOCK',
          } as Transaction),
        ],
      } as Block),
    ];
    this.nextIndex++;
  }

  /**
   * Gets the last block based on the current block.
   * @returns last block
   */
  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  /**
   * Generates the challenge Difficult golden number that should be resolved by the miners.
   *
   * For every N blocks, my challenge difficulty will adjust.
   * It could be adjusted too using the quantity pending blocks,
   * or using the actives miners on the blockchain too...
   *
   * @returns the challenge Difficult golden number that should be resolved by the miners
   */
  generatesDifficultChallengeGoldenNumber(): number {
    //Round up
    return Math.ceil(
      this.blocks.length / Blockchain.CHALLENGE_FIFFICULTY_FACTOR,
    );
  }

  /**
   * Adding new Block to blockchain
   *
   * @param block
   * @returns if all is ok return true
   */
  addBlock(block: Block): Validation {
    const lastBlock = this.getLastBlock();

    const validation = block.isValid(
      lastBlock.hash,
      lastBlock.index,
      this.generatesDifficultChallengeGoldenNumber(),
    );

    if (!validation.success)
      return new Validation(
        false,
        `Invalid Block: ${block.index} ${validation.message}`,
      );

    //updating transactionsMemPool removing regular transactions
    //from transactionsMemPool that are on current candidate block
    const blockRegularTransactionsHashs = block.transactions
      .filter(tx => tx.type === TransactionType.REGULAR)
      .map(tx => tx.hash);
    const newTransactionsMemPool = this.transactionsMemPool.filter(
      tx => !blockRegularTransactionsHashs.includes(tx.hash),
    );

    //Validating if newTransactionsMemPool were there
    //on the original this.transactionsMemPool
    if (
      newTransactionsMemPool.length + blockRegularTransactionsHashs.length !==
      this.transactionsMemPool.length
    ) {
      return new Validation(
        false,
        `Invalid Block: ${block.index}: At least one invalid tx should not be on the original transactionsMemPool`,
      );
    }
    //if the last validate is ok, so we update the transactionsMemPool
    this.transactionsMemPool = newTransactionsMemPool;

    this.blocks.push(block);
    this.nextIndex++;

    return new Validation(true, block.hash);
  }

  /**
   * Validate if all Blockchain is ok.
   *
   * @returns Validation or false
   */
  isValid(): Validation {
    for (let i = this.blocks.length - 1; i > 0; i--) {
      const currentBlock = this.blocks[i];
      const lastBlock = this.blocks[i - 1];

      const validation = currentBlock.isValid(
        lastBlock.hash,
        lastBlock.index,
        this.generatesDifficultChallengeGoldenNumber(),
      );

      if (!validation.success)
        return new Validation(
          false,
          `Invalid Block: ${currentBlock.index} ${validation.message}`,
        );
    }

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
   * Gets the Transaction by hash
   *
   * @param hash target transaction to find
   * @returns the transaction found
   */
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

  /**
   * Returns the reward for each transaction made in the mined block.
   *
   * @todo implements a logic that fees are higher when
   * the transactions in the mempool are greater...
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
  getNextBlock(): BlockInfo | null {
    //this avoid miners minning transacions empty blocks
    if (!this.transactionsMemPool || this.transactionsMemPool.length === 0) {
      return null;
    }

    /** @todo creates a sort criteria to transactionsMemPool to be used here*/
    //getting the next transactions from the current transactionsMemPool
    const transactions = this.transactionsMemPool.slice(
      0,
      Blockchain.TX_MAX_PER_BLOCK,
    );
    const difficultChallenge = this.generatesDifficultChallengeGoldenNumber();
    const previousHash = this.getLastBlock().hash;
    const index = this.blocks.length;
    const feePerTx = this.getFeePerTx();
    const maxDifficultChallenge = Blockchain.MAX_CHALLENGE_FIFFICULTY_FACTOR;

    return {
      transactions,
      difficultChallenge,
      previousHash,
      index,
      feePerTx,
      maxDifficultChallenge,
    } as BlockInfo;
  }

  /**
   * Add transactions list on transactionsMemPool. It will be validated before...
   *
   * @param transactions transactions list to be added on transactionsMemPool
   * @returns
   */
  addTransactions(transactions: Transaction[]): Validation {
    if (!transactions || transactions.length === 0) {
      return new Validation(
        false,
        'These txs are empty, so could not be added.',
      );
    }

    if (
      this.transactionsMemPool.some(txMemPool =>
        transactions.map(tx => tx.hash).includes(txMemPool.hash),
      )
    ) {
      return new Validation(
        false,
        'Duplicated tx in transactionsMemPool, so could not be added.',
      );
    }

    if (
      this.blocks.some(b =>
        b.transactions.some(txBlock =>
          transactions.map(tx => tx.hash).includes(txBlock.hash),
        ),
      )
    ) {
      return new Validation(
        false,
        'Duplicated tx in blockchain, so could not be added.',
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
}
