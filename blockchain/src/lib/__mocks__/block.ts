import Validation from '../validation';
import Transaction from '../transaction';
import TransactionType from '../transactionType';

/**
 * Mocked Block class that represents just one Block in Blockchain
 */
export default class Block {
  index: number = 1;
  timestamp: number;
  hash: string = '';
  previousHash: string;
  transactions: Transaction[];

  /**
   * Constructor for a Moked Block.
   * Initializes a new Block instance with optional properties from a provided Block object.
   * If no Block is provided, default values are used.
   *
   * @param block An optional Block object for property initialization.
   */
  constructor(block?: Block) {
    this.index = block?.index || 0;
    this.timestamp = block?.timestamp || Date.now();
    this.previousHash = block?.previousHash || '';
    this.hash = block?.hash || this.getHash();

    /** This ensures that I have complete Transaction objects,
     * with not only properties but also functions */
    this.transactions = block?.transactions
      ? block?.transactions.map(tx => new Transaction(tx))
      : ([] as Transaction[]);
  }

  /**
   * Gets the mock block hash. Or this.hash or 'abc'.
   *
   * @returns the hash
   */
  getHash(): string {
    return this.hash || 'abc';
  }

  /**
   *
   * Tests if this Mock Block is a valid block.
   *
   * @returns Mock Validation if all these rules are valid
   */
  isValid(previousHash: string, previousIndex: number): Validation {
    //this is not the complete validation used on real block class
    if (
      previousIndex < 0 ||
      this.previousHash !== previousHash ||
      this.index < 0
    ) {
      return new Validation(false, `Invalid mock block`);
    }

    return new Validation();
  }
}
