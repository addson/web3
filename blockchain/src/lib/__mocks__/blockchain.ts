import Block from './block';
import Validation from '../validation';

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
        data: 'GENESIS BLOCK',
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

    // const lastBlock = this.getLastBlock();

    // const validation = block.isValid(lastBlock.hash, lastBlock.index);

    // if (!validation.success)
    //   return new Validation(
    //     false,
    //     `Invalid Block: ${block.index} ${validation.message}`,
    //   );

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
}
