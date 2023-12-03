import sha256 from 'crypto-js/sha256';
import Validation from './validation';
import BlockInfo from './blockInfo';

/**
 * Block class that represents just one Block in Blockchain
 */
export default class Block {
  index: number = 1;
  timestamp: number;
  hash: string = '';
  previousHash: string;
  data: string;
  nonce: number; //number used once
  miner: string; //miner hash that created this block

  /**
   * Constructor for a Block.
   * Initializes a new Block instance with optional properties from a provided Block object.
   * If no Block is provided, default values are used.
   *
   * @param block An optional Block object for property initialization.
   */
  constructor(block?: Block) {
    this.index = block?.index || 0;
    this.timestamp = block?.timestamp || Date.now();
    this.previousHash = block?.previousHash || '';
    this.data = block?.data || '';
    this.nonce = block?.nonce || 0;
    this.miner = block?.miner || '';
    this.hash = block?.hash || this.getHash();
  }

  /**
   * Generate the hash, that is the block cryptographic signature.
   *
   * @returns the hash
   */
  getHash(): string {
    return sha256(
      this.index +
        this.data +
        this.timestamp +
        this.previousHash +
        this.nonce +
        this.miner,
    ).toString();
  }

  /**
   * Attempt to find and generate a new valid hash that
   * begins with the challenge difficulty's resulting prefix.
   * This hash uses all the current block data to assign the new current block.
   *
   * @param difficultChallenge the blockchain current challenge difficult.
   * @param miner the miner wallet address
   */
  mine(difficultChallenge: number, miner: string) {
    this.miner = miner;
    const prefix = this.getHashPrefix(difficultChallenge);

    //only ends up when the hash begins with the prefix
    do {
      this.nonce++;
      this.hash = this.getHash();
    } while (!this.hash.startsWith(prefix));
  }

  /**
   * This join all empty elements array passing 0 as separator.
   * A valid hash depends on the number of leading zeros in the hash.
   *
   * @param difficultChallenge
   * @returns hash prefix
   */
  getHashPrefix(difficultChallenge: number): string {
    const prefix = new Array(difficultChallenge + 1).join('0');
    return prefix;
  }

  /**
   * Tests if this Block is a valid block.
   *
   * @param previousHash the previous hash from previous block.
   * @param previousIndex the previous index block
   * @param difficultChallenge the quantity of zeros required to begin the current hash.
   * @returns Validation if all these rules are valid
   */
  isValid(
    previousHash: string,
    previousIndex: number,
    difficultChallenge: number,
  ): Validation {
    if (previousIndex !== this.index - 1) {
      return new Validation(false, `Invalid index: ${this.index}`);
    }

    if (this.previousHash !== previousHash) {
      return new Validation(
        false,
        `Invalid previousHash: ${this.previousHash}`,
      );
    }

    if (!this.data) {
      return new Validation(false, `Invalid data: EMPTY`);
    }

    if (this.timestamp < 1) {
      return new Validation(false, `Invalid timestamp: ${this.timestamp}`);
    }

    if (!this.nonce || !this.miner) {
      return new Validation(false, `This Block was NOT Mined`);
    }

    const prefix = this.getHashPrefix(difficultChallenge);
    if (this.hash !== this.getHash() || !this.hash.startsWith(prefix)) {
      return new Validation(false, `Invalid hash: ${this.getHash()}`);
    }

    return new Validation();
  }

  /**
   * Turn the data BlockInfo to a new Block.
   *
   * @param blockInfo from blockInfo
   * @returns
   */
  static blockInfoToBlock(blockInfo: BlockInfo): Block {
    const block = new Block();
    block.index = blockInfo.index;
    block.previousHash = blockInfo.previousHash;
    block.data = blockInfo.data;
    return block;
  }
}
