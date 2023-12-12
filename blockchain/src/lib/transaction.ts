import TransactionType from './transactionType';
import sha256 from 'crypto-js/sha256';
import Validation from './validation';

/**
 * Transaction class to represents a block transaction.
 *
 */
export default class Transaction {
  type: TransactionType;
  timestamp: number; //always UTC without fuso
  hash: string;
  data: string; //in the future it will have two arrays of inputs and outputs

  constructor(tx?: Transaction) {
    this.type = tx?.type || TransactionType.REGULAR;
    this.timestamp = tx?.timestamp || Date.now();
    this.data = tx?.data || '';
    this.hash = tx?.hash || this.getHash();
  }

  /** It will generates a unique assign to this transaction. */
  getHash(): string {
    return sha256(this.type + this.data + this.timestamp).toString();
  }

  /**
   * This contains some rules to validate this transaction
   */
  isValid(): Validation {
    if (this.hash !== this.getHash())
      return new Validation(false, 'Invalid Hash');

    if (!this.data) return new Validation(false, 'Invalid Data');

    return new Validation();
  }
}
