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
  let txInputLessOutput: TransactionInput;
  const exampleDifficult: number = -1;
  const exampleFee: number = -1;
  const exampleTx: string =
    '62ab3a6d203e513c0ab98663c053c8f520cf799309f4f762cf2d6482d8ca8283';

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

    txInputLessOutput = new TransactionInput({
      amount: 3,
      fromAddress: wallet.publicKey,
    } as TransactionInput);
    txInputLessOutput.sign(wallet.privateKey);
  });

  it('Should be a transaction valid (REGULAR DEFAULT)', () => {
    const tx = new Transaction({
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);

    const valid = tx.isValid(exampleDifficult, exampleFee);
    expect(valid.success).toEqual(true);
  });

  it('Should be a transaction valid (FEE)', () => {
    const tx = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [txOutput],
      txInputs: [txInput],
    } as Transaction);

    const valid = tx.isValid(exampleDifficult, exampleFee);
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

    const valid = tx.isValid(exampleDifficult, exampleFee);
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

    const valid = tx.isValid(exampleDifficult, exampleFee);
    // console.log(valid.message);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be a transaction valid (invalid hash on creation)', () => {
    const tx = new Transaction({
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      hash: 'abc',
    } as Transaction);

    const valid = tx.isValid(exampleDifficult, exampleFee);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be a transaction valid (invalid hash changed after created)', () => {
    const tx = new Transaction({
      type: TransactionType.FEE,
      txInputs: [txInput],
    } as Transaction);

    //invalidating the hash
    tx.hash = 'INVALIDATING HASH';

    const valid = tx.isValid(exampleDifficult, exampleFee);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be a transaction valid (empty data)', () => {
    const tx = new Transaction();

    const valid = tx.isValid(exampleDifficult, exampleFee);
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be a transaction valid (inputs < outputs)', () => {
    const tx = new Transaction({
      txInputs: [txInputLessOutput],
      txOutputs: [txOutput],
    } as Transaction);

    const valid = tx.isValid(exampleDifficult, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it('Should NOT be a transaction valid (txOutput hash != txHash)', () => {
    const tx = new Transaction({
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);

    tx.txOutputs[0].transactionHash = 'FORCE INVALID HASH';

    const valid = tx.isValid(exampleDifficult, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it('Should get Fee', () => {
    txInput.previousTx = exampleTx;
    txInput.amount = 11;
    txOutput.amount = 8;
    txInput.sign(wallet.privateKey);
    const tx = new Transaction({
      txInputs: [txInput],
      txOutputs: [txOutput],
    } as Transaction);

    const result = tx.getFee();
    expect(result).toBeGreaterThan(0);
  });

  it('Should get zero Fee', () => {
    const tx = new Transaction({
      txInputs: undefined,
      txOutputs: [txOutput],
    } as Transaction);

    const result = tx.getFee();
    expect(result).toEqual(0);
  });

  it('Should create from rewards', () => {
    txOutput.transactionHash = exampleTx;
    const tx = Transaction.fromReward(txOutput);

    const valid = tx.isValid(exampleDifficult, exampleFee);
    expect(valid.success).toBeTruthy();
  });

  it('Should NOT be a transaction valid (fee excess)', () => {
    txOutput.amount = Number.MAX_VALUE;
    const tx = new Transaction({
      txOutputs: [txOutput],
      type: TransactionType.FEE,
    } as Transaction);
    const valid = tx.isValid(exampleDifficult, exampleFee);
    expect(valid.success).toBeFalsy();
  });

  it('should calculate fee correctly with valid inputs and outputs', () => {
    const txInputs = [
      { amount: 100 } as TransactionInput,
      { amount: 200 } as TransactionInput,
    ];
    const txOutputs = [
      { amount: 50 } as TransactionOutput,
      { amount: 100 } as TransactionOutput,
    ];
    const transaction = new Transaction();
    transaction.txInputs = txInputs;
    transaction.txOutputs = txOutputs;

    const fee = transaction.getFee();
    expect(fee).toBe(150);
  });

  it('should return 0 if there are no inputs', () => {
    const transaction = new Transaction();
    transaction.txInputs = [];
    transaction.txOutputs = [{ amount: 50 } as TransactionOutput];

    const fee = transaction.getFee();
    expect(fee).toBe(0);
  });

  it('should calculate fee correctly with inputs but no outputs', () => {
    const txInputs = [
      { amount: 100 } as TransactionInput,
      { amount: 200 } as TransactionInput,
    ];
    const transaction = new Transaction();
    transaction.txInputs = txInputs;
    transaction.txOutputs = [];

    const fee = transaction.getFee();
    expect(fee).toBe(300);
  });

  it('should return 0 if inputs are undefined', () => {
    const transaction = new Transaction();
    transaction.txOutputs = [{ amount: 50 } as TransactionOutput];

    const fee = transaction.getFee();
    expect(fee).toBe(0);
  });

  it('should handle reduce correctly if there is only one input', () => {
    const txInputs = [{ amount: 100 } as TransactionInput];
    const transaction = new Transaction();
    transaction.txInputs = txInputs;
    transaction.txOutputs = [{ amount: 50 } as TransactionOutput];

    const fee = transaction.getFee();
    expect(fee).toBe(50);
  });
});
