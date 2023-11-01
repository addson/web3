import Block from './block';

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
  addBlock(block: Block): boolean {
    const lastBlock = this.getLastBlock();
    if (!block.isValid(lastBlock.hash, lastBlock.index)) return false;
    this.blocks.push(block);
    this.nextIndex++;
    return true;
  }

  /**
   * Validate if all Blockchain is ok.
   *
   * @returns true or false
   */
  isValid(): boolean {
    for (let i = this.blocks.length - 1; i > 0; i--) {
      const currentBlock = this.blocks[i];
      const lastBlock = this.blocks[i - 1];
      if (!currentBlock.isValid(lastBlock.hash, lastBlock.index)) return false;
    }

    return true;
  }
}
