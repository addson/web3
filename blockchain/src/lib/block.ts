import sha256 from 'crypto-js/sha256';

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
   *
   * The constructor of one Block
   * @param index the block index in Blockchain
   * @param hash the block hash that turn this Block a unique block in Blockchain
   * @param previousHash the previous block hash that connect this block to the previous block
   * @param data the block data
   *
   */
  constructor(index: number, previousHash: string, data: string) {
    this.index = index;
    this.timestamp = Date.now();
    this.previousHash = previousHash;
    this.data = data;
    this.hash = this.getHash();
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
   * @returns true if all these rules are valid
   */
  isValid(previousHash: string, previousIndex: number): boolean {
    if (previousIndex !== this.index - 1) {
      return false;
    }

    if (this.hash !== this.getHash()) {
      return false;
    }

    if (this.previousHash !== previousHash) {
      return false;
    }

    if (!this.data) {
      return false;
    }

    if (this.timestamp < 1) {
      return false;
    }

    return true;
  }
}
