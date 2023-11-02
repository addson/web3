import Block from './block';
import Validation from './validation';

/**
 * The blockchain class that represents all chain of blocks
 */
export default class Blockchain {
  blocks: Block[];
  nextIndex: number = 0;

  /**
   * The constructor always creates the first block, that is called by GENESIS.
   */
  constructor() {
    this.blocks = [new Block(this.nextIndex, '', 'GENESIS BLOCK')];
    this.nextIndex++;
  }

  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  /**
   * Adding new Block to blockchain
   *
   * @param block
   * @returns if all is ok return true
   */
  addBlock(block: Block): Validation {
    const lastBlock = this.getLastBlock();
    const validation = block.isValid(lastBlock.hash, lastBlock.index);

    if (!validation.success)
      return new Validation(
        false,
        `Invalid Block: ${block.index} \n${validation.message}`,
      );

    this.blocks.push(block);
    this.nextIndex++;

    return new Validation();
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

      const validation = currentBlock.isValid(lastBlock.hash, lastBlock.index);
      if (!validation.success)
        return new Validation(
          false,
          `Invalid Block: ${currentBlock.index} \n${validation.message}`,
        );
    }

    return new Validation();
  }
}
