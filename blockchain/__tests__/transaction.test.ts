import { describe, it, expect, beforeAll } from '@jest/globals';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import TransactionInput from '../src/lib/transactionInput';
import TransactionOutput from '../src/lib/transactionOutput';
import Wallet from '../src/lib/wallet';

describe('Transaction tests', () => {
  let wallet: Wallet;
  let walletTo: Wallet;
  let txInput: TransactionInput;
  let txOutput: TransactionOutput;

  beforeAll(() => {
    wallet = new Wallet();
    walletTo = new Wallet();

    txInput = new TransactionInput({
      amount: 10,
      fromAddress: wallet.publicKey,
    } as TransactionInput);
    txInput.sign(wallet.privateKey);

    txOutput = new TransactionOutput({
      toAddress: walletTo.publicKey,
      amount: 5,
    } as TransactionOutput);
  });

  it('Should be a transaction valid (REGULAR DEFAULT)', () => {
    const tx = new Transaction({
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toEqual(true);
  });

  it('Should be a transaction valid (FEE)', () => {
    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [txOutput],
      txInputs: [txInput],
    } as Transaction);

    const valid = tx.isValid();
    // console.log(valid.message);
    expect(valid.success).toEqual(true);
  });

  it('Should NOT be a transaction valid as the EMPTY to field', () => {
    const txInputNotAssigned = new TransactionInput({
      amount: 10,
      fromAddress: wallet.publicKey,
    } as TransactionInput);

    const tx = new Transaction({
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      txInputs: [txInputNotAssigned],
    } as Transaction);

    const valid = tx.isValid();
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be a transaction valid as txInput is invalid', () => {
    const txInputNotAssigned = new TransactionInput({
      amount: 10,
      fromAddress: wallet.publicKey,
    } as TransactionInput);

    const tx = new Transaction({
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      txInputs: [txInputNotAssigned],
      txOutputs: [txOutput],
    } as Transaction);

    const valid = tx.isValid();
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be a transaction valid (invalid hash on creation)', () => {
    const tx = new Transaction({
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      hash: 'abc',
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be a transaction valid (invalid hash changed after created)', () => {
    const tx = new Transaction({
      type: TransactionType.FEE,
      txInputs: [txInput],
    } as Transaction);

    //invalidating the hash
    tx.hash = 'INVALIDATING HASH';

    const valid = tx.isValid();
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be a transaction valid (empty data)', () => {
    const tx = new Transaction();

    const valid = tx.isValid();
    expect(valid.success).toEqual(false);
  });
});
