import TransactionType from './transactionType';
import sha256 from 'crypto-js/sha256';
import Validation from './validation';
import TransactionInput from './transactionInput';
import TransactionOutput from './transactionOutput';
import Blockchain from './blockchain';

/**
 * Transaction class to represents a block transaction.
 *
 */
export default class Transaction {
  type: TransactionType;
  timestamp: number; //always UTC without fuso
  hash: string;
  txInputs: TransactionInput[] | undefined;
  txOutputs: TransactionOutput[];

  constructor(tx?: Transaction) {
    this.type = tx?.type || TransactionType.REGULAR;
    this.timestamp = tx?.timestamp || Date.now();

    //initializes the txInput array
    this.txInputs = tx?.txInputs
      ? tx.txInputs.map(txi => new TransactionInput(txi))
      : undefined;

    //initializes the txOutput array
    this.txOutputs = tx?.txOutputs
      ? tx.txOutputs.map(txo => new TransactionOutput(txo))
      : [];

    this.hash = tx?.hash || this.getHash();

    //ever txOutput has this transaction hash
    this.txOutputs.forEach((txo, index, array) => {
      array[index].transactionHash = this.hash;
    });
  }

  /** It will generates a unique assign to this transaction. */
  getHash(): string {
    const txInputHashs =
      this.txInputs && this.txInputs.length
        ? this.txInputs.map(txi => txi.signature).join(',')
        : '';

    const txOutputHashs =
      this.txOutputs && this.txOutputs.length
        ? this.txOutputs.map(txo => txo.getGash()).join(',')
        : '';

    return sha256(
      this.type + txInputHashs + txOutputHashs + this.timestamp,
    ).toString();
  }

  /**
   * This contains some rules to validate this transaction
   */
  isValid(difficulty: number, feesTotal: number): Validation {
    if (this.hash !== this.getHash())
      return new Validation(false, 'Invalid Hash');

    if (
      !this.txOutputs ||
      !this.txOutputs.length ||
      this.txOutputs.map(txo => txo.isValid()).some(v => !v.success)
    )
      return new Validation(false, 'Invalid (TXO) TransactionOutput');

    if (this.txInputs && this.txInputs.length) {
      const validationsTxiFalse = this.txInputs
        .map(txi => txi.isValid())
        .filter(v => !v.success);
      if (validationsTxiFalse && validationsTxiFalse.length) {
        const message = validationsTxiFalse.map(v => v.message).join(' ');
        return new Validation(false, `Invalid TxInput as: ${message}`);
      }

      const sumTxInputs = this.txInputs
        .map(txi => txi.amount)
        .reduce((a, b) => a + b, 0);

      const sumTxOutputs = this.txOutputs
        .map(txo => txo.amount)
        .reduce((a, b) => a + b, 0);

      if (sumTxInputs < sumTxOutputs) {
        return new Validation(
          false,
          `Invalid amounts: TxInputs Amounts < TxOutputs Amounts  `,
        );
      }
    }

    if (this.txOutputs.some(txo => txo.transactionHash !== this.hash)) {
      return new Validation(
        false,
        `Invalid TxOutput reference hash. It should be equals to this transaction hash. `,
      );
    }

    //validates the fees and rewards when tx type equals FEE
    if (this.type === TransactionType.FEE) {
      const txo = this.txOutputs[0]; //it has only one

      //rewards fees for miner:
      //fees as this block was minned for this miner
      //transaction fee x number of transactions
      if (txo.amount > Blockchain.getRewardAmount(difficulty) + feesTotal) {
        return new Validation(false, 'Invalid tx reward to miner');
      }
    }

    return new Validation();
  }
}
