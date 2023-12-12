import Transaction from './transaction';

/**
 * All data provided by the blockchain for the next block to be mined.
 */
export default interface BlockInfo {
  index: number; //The index that the new block must have to be accepted in the Blockchain.
  previousHash: string; //The hash of the latest current block which will be the hash of the block immediately preceding the new block to be mined.
  difficultChallenge: number; //Difficulty challenge available for miners offered by the blockchain.
  maxDifficultChallenge: number; //Maximum limit where there will be no more rewards.
  feePerTx: number; //Transaction fee that the miner will record in the block."
  transactions: Transaction[]; //Transactions array that should be written in the new block to be mined.
}
