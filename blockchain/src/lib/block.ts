import sha256 from 'crypto-js/sha256';
import Validation from './validation';

/**
 * Block class that represents just one Block in Blockchain
 */
export default class Block {
  index: number = 1;
  timestamp: number;
  hash: string = '';
  previousHash: string;
  data: string;

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
    this.hash = block?.hash || this.getHash();
  }

  /**
   * Generate the hash, that is the block cryptographic signature.
   *
   * @returns the hash
   */
  getHash(): string {
    return sha256(
      this.index + this.data + this.timestamp + this.previousHash,
    ).toString();
  }

  /**
   *
   * Tests if this Block is a valid block.
   *
   * @returns Validation if all these rules are valid
   */
  isValid(previousHash: string, previousIndex: number): Validation {
    if (previousIndex !== this.index - 1) {
      return new Validation(false, `Invalid index: ${this.index}`);
    }

    if (this.hash !== this.getHash()) {
      return new Validation(false, `Invalid hash: ${this.getHash()}`);
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

    return new Validation();
  }
}
