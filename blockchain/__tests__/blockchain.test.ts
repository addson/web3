import { describe, it, expect } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';

describe('Should has GENESIS block', () => {
  it('Should be valid', () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks.length).toBeGreaterThan(0);
  });
});
