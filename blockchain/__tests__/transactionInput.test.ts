import { describe, it, expect, beforeAll } from '@jest/globals';
import TransactionInput from '../src/lib/transactionInput';
import TransactionOutput from '../src/lib/transactionOutput';
import Wallet from '../src/lib/wallet';

describe('Transaction input tests', () => {
  let txOutput: TransactionOutput;
  const exampleTx: string =
    '62ab3a6d203e513c0ab98663c053c8f520cf799309f4f762cf2d6482d8ca8283';

  //generates a new wallet to alice
  let addson: Wallet;
  let claudia: Wallet;
  beforeAll(() => {
    addson = new Wallet();
    claudia = new Wallet();

    txOutput = new TransactionOutput({
      toAddress: claudia.publicKey,
      amount: 5,
      transactionHash: exampleTx,
    } as TransactionOutput);
  });

  it('txInput sign is required', () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: addson.publicKey,
    } as TransactionInput);

    const valid = txInput.isValid();
    expect(valid.success).toEqual(false);
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

  it('should create a transactionInput fromTXO', () => {
    const txInput = TransactionInput.fromTxo(txOutput);
    txInput.sign(claudia.privateKey);

    const valid = txInput.isValid();
    expect(valid.success).toEqual(true);
  });
});
