import Block from './block';
import Validation from './validation';

/**
 * The blockchain class that represents all chain of blocks
 */
export default class Blockchain {
  blocks: Block[];
  nextIndex: number = 0;

  // static to running just once globally fo all class isntances
  // readonly means that this fild can not be changed.
  static readonly CHALLENGE_FIFFICULTY_FACTOR: number = 5;

  /**
   * The constructor always creates the first block, that is called by GENESIS.
   */
  constructor() {
    this.blocks = [
      new Block({
        index: this.nextIndex,
        previousHash: '',
        data: 'GENESIS BLOCK',
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
  generatesCallengeDifficultGoldenNumber(): number {
    return Math.ceil(
      //Round up
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
      this.generatesCallengeDifficultGoldenNumber(),
    );

    if (!validation.success)
      return new Validation(
        false,
        `Invalid Block: ${block.index} ${validation.message}`,
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

      const validation = currentBlock.isValid(
        lastBlock.hash,
        lastBlock.index,
        this.generatesCallengeDifficultGoldenNumber(),
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
}
