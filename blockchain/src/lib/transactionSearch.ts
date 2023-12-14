import Transaction from './transaction';

/**Interface to search transaction on blockchain. */
export default interface TransactionSearch {
  transaction: Transaction;

  memPoolIndex?: number;

  blockIndex?: number;
}
