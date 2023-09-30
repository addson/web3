import Block from './block';

const block = new Block(5, 'XXX');

console.log(block);

block.created = new Date(2023, 9, 16);

console.log(blockPresentation(block));

function blockPresentation(block: Block): string {
  return (
    ' This Block with hash: ' +
    block.hash +
    '\n ' +
    'and with index: ' +
    block.index +
    '\n ' +
    'was created in ' +
    block.created +
    '\n ' +
    'and because these set, this block is valid: ' +
    block.isValid()
  );
}
