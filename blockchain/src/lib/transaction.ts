import TransactionType from './transactionType';
import sha256 from 'crypto-js/sha256';
import Validation from './validation';
import TransactionInput from './transactionInput';

/**
 * Transaction class to represents a block transaction.
 *
 */
export default class Transaction {
  type: TransactionType;
  timestamp: number; //always UTC without fuso
  hash: string;
  txInput: TransactionInput;
  to: string;

  constructor(tx?: Transaction) {
    this.type = tx?.type || TransactionType.REGULAR;
    this.timestamp = tx?.timestamp || Date.now();
    this.to = tx?.to || '';
    this.txInput = new TransactionInput(tx?.txInput) || new TransactionInput();
    this.hash = tx?.hash || this.getHash();
  }

  /** It will generates a unique assign to this transaction. */
  getHash(): string {
    return sha256(
      this.type + this.txInput.getHash() + this.to + this.timestamp,
    ).toString();
  }

  /**
   * This contains some rules to validate this transaction
   */
  isValid(): Validation {
    if (this.hash !== this.getHash())
      return new Validation(false, 'Invalid Hash');

    if (!this.to) return new Validation(false, 'Invalid to');

    return new Validation();
  }
}
