import { describe, it, expect, jest } from '@jest/globals';
import Blockchain from '../src/lib/blockchain';
import Block from '../src/lib/block';

//mocking the block class
jest.mock('../src/lib/block');

describe('Blockchain tests', () => {
  it('Should has the first GENESIS block', () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks.length).toBeGreaterThan(0);
  });

  it('Should be valid (Genesis)', () => {
    const blockchain = new Blockchain();
    const validation = blockchain.isValid();
    // console.log(validation.message);
    expect(validation.success).toEqual(true);
  });

  it('Should find a block by hash', () => {
    const blockchain = new Blockchain();
    const validation = blockchain.isValid();
    // console.log(validation.message);

    const block: Block | undefined = blockchain.getBlock(
      blockchain.blocks[0].hash,
    );
    let findBlock: boolean = false;
    if (block) findBlock = true;

    expect(validation.success && findBlock).toEqual(true);
  });

  it('Should NOT find a block by hash', () => {
    const blockchain = new Blockchain();
    const validation = blockchain.isValid();
    // console.log(validation.message);

    const block: Block | undefined = blockchain.getBlock('INVALID HASH');
    let findBlock: boolean = false;
    if (block) findBlock = true;

    expect(validation.success && findBlock).toEqual(false);
  });

  it('Should be valid (two blocks)', () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        data: 'Bloco 2',
      } as Block),
    );
    const validation = blockchain.isValid();
    // console.log(validation.message);
    expect(validation.success).toEqual(true);
  });

  it('Should NOT be valid (two blocks)', () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        data: 'Bloco 2',
      } as Block),
    );
    blockchain.blocks[1].index = -1;
    const validation = blockchain.isValid();
    // console.log(validation.message);
    expect(validation.success).toEqual(false);
  });

  it('Should add block', () => {
    const blockchain = new Blockchain();
    const validation = blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        data: 'Bloco 2',
      } as Block),
    );
    // console.log(validation.message);
    expect(validation.success).toEqual(true);
  });

  it('Should NOT add block', () => {
    const blockchain = new Blockchain();
    const validation = blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: 'WRONG PREVIOUS HASH',
        data: 'Bloco 2',
      } as Block),
    );
    // console.log(validation.message);
    expect(validation.success).toEqual(false);
  });

  it('Should get the next block info from the blockchain for mining.', () => {
    const blockchain = new Blockchain();
    const info = blockchain.getNextBlock();
    expect(info.index).toEqual(1);
  });
});
