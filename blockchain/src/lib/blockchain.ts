import Block from './block';
import Validation from './validation';
import BlockInfo from './blockInfo';
import Transaction from './transaction';
import TransactionType from './transactionType';
import TransactionSearch from './transactionSearch';
import TransactionInput from './transactionInput';
import TransactionOutput from './transactionOutput';
import Wallet from './wallet';

/**
 * The blockchain class that represents all chain of blocks
 */
export default class Blockchain {
  // Candidate transactions to enter the next blocks.
  transactionsMemPool: Transaction[];

  //Blockchain blocks list
  blocks: Block[];

  nextIndex: number = 0;

  // static to running just once globally fo all class instances
  // readonly means that this fild can not be changed.
  // Increasing the difficulty every N number blocks.
  static readonly CHALLENGE_DIFFICULTY_FACTOR: number = 10;

  //the miner will have to generates a hash with 62 hashs on the left
  static readonly MAX_CHALLENGE_DIFFICULTY_FACTOR: number = 62;

  //the max quantity of transactions per block
  static readonly TX_MAX_PER_BLOCK: number = 2;

  /**
   * The constructor always creates the first block, that is called by GENESIS.
   */
  constructor(miner: string) {
    this.blocks = [];
    this.transactionsMemPool = [];

    const genesis = this.createGenesis(miner);
    this.blocks.push(genesis);
    this.nextIndex++;
  }

  createGenesis(miner: string): Block {
    //todo calculate the rewards quantity
    const amount = 10;
    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [
        new TransactionOutput({
          amount: amount,
          toAddress: miner,
        } as TransactionOutput),
      ],
    } as Transaction);

    tx.hash = tx.getHash();
    tx.txOutputs[0].transactionHash = tx.hash;

    const block = new Block();
    block.transactions = [tx];
    block.mine(this.generatesDifficultChallengeGoldenNumber(), miner);

    return block;
  }

  /**
   * Gets the last block based on the current block.
   * @returns last block
   */
  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  /**
   * Generates the challenge Difficult golden number that should be resolved by the miners.
   *
   * For every N blocks, my challenge difficulty will adjust.
   * It could be adjusted too using the quantity pending blocks,
   * or using the actives miners on the blockchain too...
   *
   * @returns the challenge Difficult golden number that should be resolved by the miners
   */
  generatesDifficultChallengeGoldenNumber(actualBlocksLength?: number): number {
    // Calculate the blockchain length when generating the Difficulty Challenge Golden Number.
    // When validating retroactively, use 'actualBlocksLength'. If not provided, use the current size of the blockchain.
    const blockchainLength = actualBlocksLength
      ? actualBlocksLength
      : this.blocks.length;

    //Round up
    return (
      Math.ceil(blockchainLength / Blockchain.CHALLENGE_DIFFICULTY_FACTOR) + 1
    );
  }

  /**
   * Adding new Block to blockchain
   *
   * @param block
   * @returns if all is ok return true
   */
  addBlock(block: Block): Validation {
    const nextBlock = this.getNextBlock();
    if (!nextBlock) {
      return new Validation(false, `There is no next block info`);
    }

    const validation = block.isValid(
      nextBlock.previousHash,
      nextBlock.index - 1,
      nextBlock.difficultChallenge,
    );

    if (!validation.success)
      return new Validation(
        false,
        `Invalid Block: ${block.index} ${validation.message}`,
      );

    //updating transactionsMemPool removing regular transactions
    //from transactionsMemPool that are on current candidate block
    const blockRegularTransactionsHashs = block.transactions
      .filter(tx => tx.type === TransactionType.REGULAR)
      .map(tx => tx.hash);
    const newTransactionsMemPool = this.transactionsMemPool.filter(
      tx => !blockRegularTransactionsHashs.includes(tx.hash),
    );

    //Validating if newTransactionsMemPool were there
    //on the original this.transactionsMemPool
    if (
      newTransactionsMemPool.length + blockRegularTransactionsHashs.length !==
      this.transactionsMemPool.length
    ) {
      return new Validation(
        false,
        `Invalid Block: ${block.index}: At least one invalid tx should not be on the original transactionsMemPool`,
      );
    }
    //if the last validate is ok, so we update the transactionsMemPool
    this.transactionsMemPool = newTransactionsMemPool;

    this.blocks.push(block);
    this.nextIndex++;

    return new Validation(true, block.hash);
  }

  /**
   * Validate if all Blockchain is ok.
   *
   * @returns Validation or false
   */
  isValid(): Validation {
    for (let i = this.blocks.length - 1; i > 0; i--) {
      const currentBlock = this.blocks[i];
      const lastBlock = this.blocks[i - 1];

      // this line: this.generatesDifficultChallengeGoldenNumber(currentBlock.index) is used to
      // Calculate the blockchain length when generating the Difficulty Challenge Golden Number.
      // When validating retroactively, use 'actualBlocksLength'. If not provided, use the current size of the blockchain.
      const validation = currentBlock.isValid(
        lastBlock.hash,
        lastBlock.index,
        this.generatesDifficultChallengeGoldenNumber(currentBlock.index),
      );

      if (!validation.success)
        return new Validation(
          false,
          `Invalid Block: ${currentBlock.index} ${validation.message}`,
        );
    }

    return new Validation();
  }

  /**
   * Gets the Block by hash
   *
   * @param hash target block to find
   * @returns the block found
   */
  getBlock(hash: string): Block | undefined {
    return this.blocks.find(b => b.hash === hash);
  }

  /**
   * Gets the Transaction by hash
   *
   * @param hash target transaction to find
   * @returns the transaction found
   */
  getTransaction(hash: string): TransactionSearch | undefined {
    const memPoolIndex = this.transactionsMemPool.findIndex(
      tx => tx.hash === hash,
    );
    if (memPoolIndex !== -1) {
      return {
        transaction: this.transactionsMemPool[memPoolIndex],
        memPoolIndex,
        blockIndex: -1,
      } as TransactionSearch;
    }

    const blockIndex = this.blocks.findIndex(b =>
      b.transactions.some(tx => tx.hash === hash),
    );
    if (blockIndex !== -1) {
      return {
        transaction: this.blocks[blockIndex].transactions.find(
          tx => tx.hash === hash,
        ),
        blockIndex,
        memPoolIndex: -1,
      } as TransactionSearch;
    }

    return { blockIndex: -1, memPoolIndex: -1 } as TransactionSearch;
  }

  /**
   * Returns the reward for each transaction made in the mined block.
   *
   * @todo implements a logic that fees are higher when
   * the transactions in the mempool are greater...
   *
   * @returns fee per each Tx in block
   */
  getFeePerTx(): number {
    return 1;
  }

  /**
   * Get all data provided by the blockchain for the next block to be mined.
   *
   */
  getNextBlock(): BlockInfo | null {
    //this avoid miners minning transacions empty blocks
    if (!this.transactionsMemPool || this.transactionsMemPool.length === 0) {
      return null;
    }

    /** @todo creates a sort criteria to transactionsMemPool to be used here*/
    //getting the next transactions from the current transactionsMemPool
    const transactions = this.transactionsMemPool.slice(
      0,
      Blockchain.TX_MAX_PER_BLOCK,
    );
    const difficultChallenge = this.generatesDifficultChallengeGoldenNumber();
    const previousHash = this.getLastBlock().hash;
    const index = this.blocks.length;
    const feePerTx = this.getFeePerTx();
    const maxDifficultChallenge = Blockchain.MAX_CHALLENGE_DIFFICULTY_FACTOR;

    return {
      transactions,
      difficultChallenge,
      previousHash,
      index,
      feePerTx,
      maxDifficultChallenge,
    } as BlockInfo;
  }

  /**
   * Add transactions list on transactionsMemPool. It will be validated before...
   *
   * @param transactions transactions list to be added on transactionsMemPool
   * @returns
   */
  addTransactions(transactions: Transaction[]): Validation {
    if (!transactions || transactions.length === 0) {
      return new Validation(
        false,
        'These txs are empty, so could not be added.',
      );
    }

    if (
      this.transactionsMemPool.some(txMemPool =>
        transactions.map(tx => tx.hash).includes(txMemPool.hash),
      )
    ) {
      return new Validation(
        false,
        'Duplicated tx in transactionsMemPool, so could not be added.',
      );
    }

    for (const transaction of transactions) {
      if (transaction.txInputs && transaction.txInputs.length) {
        /* istanbul ignore next */
        const from = transaction.txInputs[0].fromAddress;
        /* istanbul ignore next */

        const pendingTx = this.transactionsMemPool
          .filter(tx => tx.txInputs && tx.txInputs.length)
          .map(tx => tx.txInputs)
          .flat()
          .filter(txi => txi!.fromAddress === from);

        /* istanbul ignore next */
        if (pendingTx && pendingTx.length) {
          return new Validation(
            false,
            'This wallet has a pending transaction on main pool that has not mined yet, so could not be added.',
          );
        }

        //validate the founds origin
        const utxos = this.getUtxo(from);
        for (let i = 0; i < transaction.txInputs.length; i++) {
          const txi = transaction.txInputs[i];
          //First validation: this spent from txInput on this transaction is in anywhere from utxos
          //Second validation: this value to be spent from txInput on this transaction is less then the match utxo value
          if (
            utxos.findIndex(
              utxo =>
                utxo.transactionHash === txi.previousTx &&
                utxo.amount >= txi.amount,
            ) === -1
          ) {
            return new Validation(
              false,
              'Invalid Transaction: The TXO is already spent before or there is not on the UTXOs (Unspendable transaction outputs)',
            );
          }
        }
      }
    }

    //todo final version that validate the taxes

    if (
      this.blocks.some(b =>
        b.transactions.some(txBlock =>
          transactions.map(tx => tx.hash).includes(txBlock.hash),
        ),
      )
    ) {
      return new Validation(
        false,
        'Duplicated tx in blockchain, so could not be added.',
      );
    }

    const validations = transactions.map(tx => tx.isValid());
    if (validations.filter(val => !val.success).length > 0) {
      return new Validation(
        false,
        'At least one of these txs is invalid, so could not be added.',
      );
    }

    //if theses transactions are valid, so we add all these on the transactionsMemPool
    this.transactionsMemPool.push(...transactions);

    return new Validation(
      true,
      `Transactions added to transactionsMemPool: ${transactions.reduce(
        (txString, transaction) => {
          return txString + ' - ' + transaction.hash;
        },
        '',
      )}`,
    );
  }

  getTxInputs(wallet: string): (TransactionInput | undefined)[] {
    return this.blocks
      .map(b => b.transactions)
      .flat() //turn 2 dimensions array to just one
      .filter(tx => tx.txInputs && tx.txInputs.length) //just txInputs > 0
      .map(tx => tx.txInputs) //gets this txInputs
      .flat() //again turn 2 dimensions array to just one
      .filter(txi => txi!.fromAddress === wallet);
  }

  getTxOutputs(wallet: string): TransactionOutput[] {
    return this.blocks
      .map(b => b.transactions)
      .flat() //turn 2 dimensions array to just one
      .filter(tx => tx.txOutputs && tx.txOutputs.length) //just txOutputs > 0
      .map(tx => tx.txOutputs) //gets this txOutputs
      .flat() //again turn 2 dimensions array to just one
      .filter(txo => txo!.toAddress === wallet);
  }

  getUtxo(wallet: string): TransactionOutput[] {
    //getting all time this wallet spent
    const txIns = this.getTxInputs(wallet);
    //getting all time this wallet earn
    const txOuts = this.getTxOutputs(wallet);

    if (!txIns || !txIns.length) {
      return txOuts;
    }

    txIns.forEach(txi => {
      //where there is spent transaction
      const index = txOuts.findIndex(txo => txo.amount === txi!.amount);
      //if it was spent I remove this output as I just want the unspent
      txOuts.splice(index, 1);
    });

    return txOuts;
  }

  getBalance(wallet: string): number {
    const utxos = this.getUtxo(wallet);

    if (!utxos || !utxos.length) {
      return 0;
    }

    return utxos.reduce((a, b) => a + b.amount, 0);
  }
}
