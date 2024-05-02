import { describe, it, expect, beforeAll } from '@jest/globals';
import TransactionInput from '../src/lib/transactionInput';
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
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: addson.publicKey,
    } as TransactionInput);
    txInput.sign(addson.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toEqual(true);
  });

  it('txInput should not be valid as amount should not be 0', () => {
    const txInput = new TransactionInput({
      amount: 0,
      fromAddress: addson.publicKey,
    } as TransactionInput);
    txInput.sign(addson.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toEqual(false);
  });

  it('txInput validate should not be valid as the signature does not match using another public key', () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: addson.publicKey,
    } as TransactionInput);
    txInput.sign(addson.privateKey);

    txInput.fromAddress = claudia.publicKey;
    const valid = txInput.isValid();
    expect(valid.success).toEqual(false);
  });
});
