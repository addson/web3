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
    blockchain.addBlock(new Block(1, blockchain.blocks[0].hash, 'Bloco 2'));
    const validation = blockchain.isValid();
    // console.log(validation.message);
    expect(validation.success).toEqual(true);
  });

  it('Should NOT be valid (two blocks)', () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(new Block(1, blockchain.blocks[0].hash, 'Bloco 2'));
    blockchain.blocks[1].data =
      'Manipulating the original data: A TRANSFER 2 TO B';
    const validation = blockchain.isValid();
    // console.log(validation.message);
    expect(validation.success).toEqual(false);
  });

  it('Should add block', () => {
    const blockchain = new Blockchain();
    const validation = blockchain.addBlock(
      new Block(1, blockchain.blocks[0].hash, 'Bloco 2'),
    );
    // console.log(validation.message);
    expect(validation.success).toEqual(true);
  });

  it('Should NOT add block', () => {
    const blockchain = new Blockchain();
    const validation = blockchain.addBlock(
      new Block(1, 'WRONG PREVIOUS HASH', 'Bloco 2'),
    );
    // console.log(validation.message);
    expect(validation.success).toEqual(false);
  });
});
