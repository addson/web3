import Block from './block';

/**
 * The blockchain class that represents all chain of blocks
 */
export default class Blockchain {
  blocks: Block[];

  /**
   * The constructor always creates the first block, that is called by GENESIS.
   */
  constructor() {
    this.blocks = [new Block(0, '', 'GENESIS BLOCK')];
  }
}
