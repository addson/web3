import { describe, it, expect, beforeAll } from '@jest/globals';
import TransactionOutput from '../src/lib/transactionOutput';
import Wallet from '../src/lib/wallet';

describe('Transaction input tests', () => {
  //generates a new wallet to alice
  let addson: Wallet;
  let claudia: Wallet;
  beforeAll(() => {
    addson = new Wallet();
    claudia = new Wallet();
  });

  it('txInput sign should be valid', () => {
    const txOutput = new TransactionOutput({
      amount: 10,
      toAddress: addson.publicKey,
      transactionHash: 'abc',
    } as TransactionOutput);

    const valid = txOutput.isValid();
    expect(valid.success).toEqual(true);
  });
});
