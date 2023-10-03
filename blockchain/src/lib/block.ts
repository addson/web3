/**
 * Block class that represents just one Block in Blockchain
 */
export default class Block {
  index: number = 1;
  hash: string = '';
  created: Date = new Date(1976, 9, 16);

  /**
   *
   * The constructor of one Block
   * @param index the block index in Blockchain
   * @param hash the block hash that turn this Block a unique block in Blockchain
   */
  constructor(index: number, hash: string) {
    this.index = index;
    this.hash = hash;
  }

  /**
   *
   * Tests if this Block is a valid block.
   * 1) if the index >= 0
   * 2) if has a hash
   * 3) if the created date is after 1976/09/16
   * @returns true if all these rules are valid
   */
  isValid(): boolean {
    if (this.index < 0) {
      return false;
    }

    if (!this.hash) {
      return false;
    }

    if (this.created <= new Date(1976, 9, 16)) {
      return false;
    }

    return true;
  }
}
