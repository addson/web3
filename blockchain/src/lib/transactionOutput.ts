import Validation from './validation';
import sha256 from 'crypto-js/sha256';

/**
 * TransactionOutput class
 */
export default class TransactionOutput {
  toAddress: string;
  amount: number;
  transactionHash?: string;

  constructor(txOutput?: TransactionOutput) {
    this.toAddress = txOutput?.toAddress || '';
    this.amount = txOutput?.amount || 0;
    this.transactionHash = txOutput?.transactionHash || '';
  }

  isValid(): Validation {
    if (this.amount < 1) {
      return new Validation(false, 'Negative amount is invalid!');
    }

    return new Validation();
  }

  getGash(): string {
    return sha256(this.toAddress + this.amount).toString();
  }
}
