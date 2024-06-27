import sha256 from 'crypto-js/sha256';
import Validation from './validation';
import BlockInfo from './blockInfo';
import Transaction from './transaction';
import TransactionType from './transactionType';

/**
 * Block class that represents just one Block in Blockchain
 */
export default class Block {
  index: number = 1;
  timestamp: number;
  hash: string = '';
  previousHash: string;
  transactions: Transaction[];
  nonce: number; //number used once (just one time)
  miner: string; //miner hash that created this block

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
    this.nonce = block?.nonce || 0;
    this.miner = block?.miner || '';
    this.hash = block?.hash || this.getHash();

    /** This ensures that I have complete Transaction objects,
     * with not only properties but also functions */
    this.transactions = block?.transactions
      ? block.transactions.map(tx => new Transaction(tx))
      : ([] as Transaction[]);
  }

  /**
   * Generate the hash, that is the block cryptographic signature.
   * Concatenating all the hashes of each transaction in the array of transactions.
   * All transactions within this block are part of the block's signature.
   * Therefore, if any transaction is altered, this hash will be changed.
   * This ensures the cryptographic security of the block,
   * based on the entire content (of all transactions) within the block.
   *
   * @returns the hash
   */
  getHash(): string {
    /**
     * Concatenating all hashes.
     */
    const txs =
      this.transactions && this.transactions.length
        ? this.transactions
            .map(tx => tx.hash)
            .reduce((beforeHash, afterHash) => beforeHash + afterHash)
        : '';

    return sha256(
      this.index +
        txs +
        this.timestamp +
        this.previousHash +
        this.nonce +
        this.miner,
    ).toString();
  }

  /**
   * Attempt to find and generate a new valid hash that
   * begins with the challenge difficulty's resulting prefix.
   * This hash uses all the current block data to assign the new current block.
   *
   * @param difficultChallenge the blockchain current challenge difficult.
   * @param miner the miner wallet address (publicKey)
   */
  mine(difficultChallenge: number, miner: string) {
    this.miner = miner;

    // Returns a quantity of zeros that have to be put before the next hash to be mined.
    const prefix = this.getHashPrefix(difficultChallenge);

    //only ends up when the hash begins with the prefix
    do {
      this.nonce++;
      this.hash = this.getHash();
    } while (!this.hash.startsWith(prefix));

    // console.log('>> Block Minning was just ended with success...');
  }

  /**
   * Returns a quantity of zeros that have to be put before the next hash mined.
   *
   * This join all empty elements array passing 0 as separator.
   * A valid hash depends on the number of leading zeros in the hash.
   *
   * @param difficultChallenge
   * @returns hash prefix
   */
  getHashPrefix(difficultChallenge: number): string {
    const prefix = new Array(difficultChallenge + 1).join('0');
    return prefix;
  }

  /**
   * Tests if this Block is a valid block.
   *
   * @param previousHash the previous hash from previous block.
   * @param previousIndex the previous index block
   * @param difficultChallenge the quantity of zeros required to begin the current hash.
   * @returns Validation if all these rules are valid
   */
  isValid(
    previousHash: string,
    previousIndex: number,
    difficultChallenge: number,
    feePerTx: number,
  ): Validation {
    /** Not Allow empty transactions */
    if (!this.transactions || this.transactions.length === 0) {
      return new Validation(false, 'Invalid Block as transactions are empty.');
    }

    if (this.transactions && this.transactions.length) {
      if (!this.nonce || this.nonce < 1 || !this.miner) {
        return new Validation(false, `This Block was NOT Mined`);
      }

      /** Allow just one transaction of type fee. */
      const feesTx = this.transactions.filter(
        tx => tx.type === TransactionType.FEE,
      );

      if (feesTx.length === 0) {
        return new Validation(
          false,
          'Invalid Block as there is no FEE transaction on the Block. At least one fee tx is mandatory',
        );
      }

      if (feesTx.length > 1) {
        return new Validation(
          false,
          'Invalid Block as there is more then one transaction type FEE in only one Block.',
        );
      }

      if (!feesTx[0].txOutputs.some(txo => txo.toAddress === this.miner)) {
        return new Validation(
          false,
          'Invalid Block as there is a invalid fee tx as the feeTx destination is different from miner addrees. The reward must go to the miner who discovered the block.',
        );
      }

      //validate fee quantity
      const totalFees =
        feePerTx *
        this.transactions.filter(tx => tx.type !== TransactionType.FEE).length;

      /** Not allowed any invalid transaction in the block*/
      if (
        this.transactions.filter(
          tx => !tx.isValid(difficultChallenge, totalFees).success,
        ).length > 0
      ) {
        const messageErrors = this.transactions
          .map(tx => tx.isValid(difficultChallenge, feePerTx))
          .filter(v => !v.success)
          .map(v => v.message);

        /* istanbul ignore next */
        return new Validation(
          false,
          'Invalid Block as not allowed any invalid transaction in the block: ' +
            messageErrors.reduce(
              (messageBefore, messageAfter) =>
                messageBefore + ' - ' + messageAfter,
            ),
        );
      }
    }

    if (previousIndex !== this.index - 1) {
      return new Validation(false, `Invalid index: ${this.index}`);
    }

    if (this.previousHash !== previousHash) {
      return new Validation(
        false,
        `Invalid previousHash: ${this.previousHash}`,
      );
    }

    if (this.timestamp < 1) {
      return new Validation(false, `Invalid timestamp: ${this.timestamp}`);
    }

    // Returns a quantity of zeros that have to be put before the next hash mined.
    const prefix = this.getHashPrefix(difficultChallenge);
    if (this.hash !== this.getHash() || !this.hash.startsWith(prefix)) {
      return new Validation(false, `Invalid hash: ${this.getHash()}`);
    }

    return new Validation();
  }

  /**
   * Turn the data BlockInfo to a new Block.
   *
   * @param blockInfo from blockInfo
   * @returns
   */
  static blockInfoToBlock(blockInfo: BlockInfo): Block {
    const block = new Block();
    block.index = blockInfo.index;
    block.previousHash = blockInfo.previousHash;
    block.transactions = blockInfo.transactions;
    return block;
  }
}
