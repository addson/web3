import { describe, it, expect } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';

describe('Blockchain tests', () => {
  it('Should has the first GENESIS block', () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks.length).toBeGreaterThan(0);
  });

  it('Should be valid (Genesis)', () => {
    const blockchain = new Blockchain();
    expect(blockchain.isValid()).toEqual(true);
  });

  it('Should be valid (two blocks)', () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(new Block(1, blockchain.blocks[0].hash, 'Bloco 2'));
    expect(blockchain.isValid()).toEqual(true);
  });

  it('Should NOT be valid (two blocks)', () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(new Block(1, blockchain.blocks[0].hash, 'Bloco 2'));
    blockchain.blocks[1].data = 'TRY CHANGE DATA: A TRANSFER 2 TO B';
    expect(blockchain.isValid()).toEqual(false);
  });

  it('Should add block', () => {
    const blockchain = new Blockchain();
    const addResult = blockchain.addBlock(
      new Block(1, blockchain.blocks[0].hash, 'Bloco 2'),
    );
    expect(addResult).toEqual(true);
  });

  it('Should NOT add block', () => {
    const blockchain = new Blockchain();
    const addResult = blockchain.addBlock(
      new Block(1, 'WRONG PREVIOUS HASH', 'Bloco 2'),
    );
    expect(addResult).toEqual(false);
  });
});
