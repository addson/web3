import { describe, it, expect, beforeAll } from '@jest/globals';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import TransactionInput from '../src/lib/transactionInput';
import Wallet from '../src/lib/wallet';

describe('Transaction tests', () => {
  let wallet: Wallet;
  let txInput: TransactionInput;

  beforeAll(() => {
    wallet = new Wallet();
    txInput = new TransactionInput({
      amount: 10,
      fromAddress: wallet.publicKey,
    } as TransactionInput);
    txInput.sign(wallet.privateKey);
  });

  it('Should be a transaction valid (REGULAR DEFAULT)', () => {
    const tx = new Transaction({
      txInput: txInput,
      to: 'PUBLIC_KEY_TARGET',
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toEqual(true);
  });

  it('Should be a transaction valid (FEE)', () => {
    const tx = new Transaction({
      type: TransactionType.FEE,
      to: 'PUBLIC_KEY_TARGET',
      txInput: txInput,
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
      txInput: txInputNotAssigned,
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
      txInput: txInputNotAssigned,
      to: 'PUBLIC_KEY_TARGET',
    } as Transaction);

    const valid = tx.isValid();
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be a transaction valid (invalid hash on creation)', () => {
    const tx = new Transaction({
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      // txInput: txInput,
      hash: 'abc',
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be a transaction valid (invalid hash changed after created)', () => {
    const tx = new Transaction({
      type: TransactionType.FEE,
      txInput: txInput,
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
