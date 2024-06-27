import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import sha256 from 'crypto-js/sha256';
import Validation from './validation';
import TransactionOutput from './transactionOutput';

//Object that will be used to generates the private and public keys.
const ECPair = ECPairFactory(ecc);

/**
 * Class representing a transaction input in a blockchain transaction.
 * This class details the origin of the funds that initiated the transaction.
 */
export default class TransactionInput {
  // Public address of the sender of the transaction.
  fromAddress: string;

  // Amount to be transacted.
  amount: number;

  // Digital signature to secure and validate the transaction.
  //Important: the wallet sign this transaction input before the transaction be validate
  //the transaction signin is the own transaction hash, nothing more
  signature: string;

  //Which hash of before transaction that generate the funds that are been spent now
  previousTx: string;

  // Constructor initializes a TransactionInput object optionally using an existing one.
  constructor(txInput?: TransactionInput) {
    this.previousTx = txInput?.previousTx || '';
    this.fromAddress = txInput?.fromAddress || '';
    this.amount = txInput?.amount || 0;
    this.signature = txInput?.signature || '';
  }

  /**
   * Signs the transaction input using a private key, producing a hash of the fromAddress and amount.
   * @param privateKey it uses the private key to sign in
   */
  sign(privateKey: string): void {
    this.signature = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'))
      .sign(Buffer.from(this.getHash(), 'hex'))
      .toString('hex');
  }

  /**
   * Generates a SHA-256 hash of the fromAddress concatenated with the amount.
   * @returns string txInput hash
   */
  getHash(): string {
    return sha256(this.fromAddress + this.amount).toString();
  }

  /**
   * Verifies the integrity and authenticity of the transaction input using the public key.
   * it uses the public key to verify.
   * @returns if this txInput is valid or not
   */
  isValid(): Validation {
    if (!this.signature) {
      return new Validation(false, 'signature is required');
    }

    //todo validate the previeousTx here
    // if (!this.previousTx || !this.signature) {
    //   return new Validation(false, 'signature and previewsTx are required');
    // }

    if (this.amount < 1) {
      return new Validation(false, 'amount must be greater then 0');
    }

    //verify if this hash with this signature is valid using this public key
    const hash = Buffer.from(this.getHash(), 'hex');
    const isValid = ECPair.fromPublicKey(
      Buffer.from(this.fromAddress, 'hex'),
    ).verify(hash, Buffer.from(this.signature, 'hex'));

    return isValid
      ? new Validation()
      : new Validation(
          false,
          'Invalid transaction Input signature using this public key: ' +
            this.fromAddress,
        );
  }

  static fromTxo(txo: TransactionOutput): TransactionInput {
    return new TransactionInput({
      amount: txo.amount, // full quantity from TransactionOutput
      fromAddress: txo.toAddress, // origin from toAddress from TransactionOutput
      previousTx: txo.transactionHash, // ogigin from transactionHash from TransactionOutput
    } as TransactionInput);
  }
}
