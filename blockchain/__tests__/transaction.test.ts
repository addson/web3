import { describe, it, expect, beforeAll } from '@jest/globals';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';

describe('Transaction tests', () => {
  beforeAll(() => {});

  it('Should be a transaction valid (REGULAR DEFAULT)', () => {
    const tx = new Transaction({
      data: 'TX type Regular',
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toEqual(true);
  });

  it('Should be a transaction valid (FEE)', () => {
    const tx = new Transaction({
      type: TransactionType.FEE,
      data: 'TX type Fee',
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toEqual(true);
  });

  it('Should NOT be a transaction valid (invalid hash on creation)', () => {
    const tx = new Transaction({
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      data: 'TX type Regular',
      hash: 'abc',
    } as Transaction);

    const valid = tx.isValid();
    expect(valid.success).toEqual(false);
  });

  it('Should NOT be a transaction valid (invalid hash changed after created)', () => {
    const tx = new Transaction({
      type: TransactionType.FEE,
      data: 'TX type Fee',
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
