import { describe, it, expect, beforeAll } from '@jest/globals';
import TransactionInput from '../src/lib/transactionInput';
import Wallet from '../src/lib/wallet';

const EXAMPLE_WIF = '5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ';

describe('Wallet tests', () => {
  let alice: Wallet;
  beforeAll(() => {
    alice = new Wallet();
  });

  it('Should create a wallet with new private and new public keys', () => {
    const wallet = new Wallet();
    expect(wallet.privateKey).toBeTruthy();
    expect(wallet.publicKey).toBeTruthy();
  });

  it('Should recover a wallet created before using PK', () => {
    const wallet = new Wallet(alice.privateKey);
    expect(wallet.privateKey).toEqual(alice.privateKey);
  });

  it('Should recover a wallet created before using WIF', () => {
    //Wallet Import Format (WIF)
    const wallet = new Wallet(EXAMPLE_WIF);
    expect(wallet.privateKey).toBeTruthy();
    expect(wallet.publicKey).toBeTruthy();
  });
});
