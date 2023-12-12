import Block from './block';
import Validation from '../validation';
import BlockInfo from '../blockInfo';
import Transaction from '../transaction';
import TransactionType from '../transactionType';

/**
 * The mocked blockchain class that represents all chain of blocks
 */
export default class Blockchain {
  blocks: Block[];
  nextIndex: number = 0;

  /**
   * The constructor always creates the first block, that is called by GENESIS.
   */
  constructor() {
    this.blocks = [
      new Block({
        index: 0,
        hash: 'abc',
        previousHash: '',
        transactions: [
          new Transaction({
            type: TransactionType.FEE,
            data: 'GENESIS BLOCK',
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
        data: new Date().toString(),
      } as Transaction),
    ];
    const difficultChallenge = 0;
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
}
