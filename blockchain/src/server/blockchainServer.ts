import dotenv from 'dotenv';
dotenv.config();

import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import Blockchain from '../lib/blockchain';
import Block from '../lib/block';

const PORT: number = parseInt(`$process.env.BLOCKCHAIN_PORT`) || 3000;
const app = express();

// HTTP requests logger middleware for Node.js
/* istanbul ignore next */ //this sentence before ignores the next line to coverage tests
if (process.argv.includes('--run')) app.use(morgan('tiny'));

// to turn all HTTP requests to json
app.use(express.json());

const blockchain = new Blockchain();

app.get('/status', (req: Request, res: Response, next: NextFunction) => {
  res.json({
    numberOfBlocks: blockchain.blocks.length,
    isValid: blockchain.isValid(),
    lastBlock: blockchain.getLastBlock(),
  });
});

app.get('/blocks/next', (req: Request, res: Response, next: NextFunction) => {
  res.json(blockchain.getNextBlock());
});

app.get(
  '/blocks/:indexOrHash',
  (req: Request, res: Response, next: NextFunction) => {
    let block: Block | undefined;

    // If it's a number, assume it's an index
    if (/^\d+$/.test(req.params.indexOrHash)) {
      const index: number = parseInt(req.params.indexOrHash);
      block = blockchain.blocks[index];
    }
    // If it's a string, assume it's a hash
    else if (/^\w+$/.test(req.params.indexOrHash)) {
      const hash = req.params.indexOrHash;
      block = blockchain.getBlock(hash);
    }

    if (block) {
      return res.json(block);
    } else {
      return res.status(404).json({ error: 'Block not found' });
    }
  },
);

app.post('/blocks/', (req: Request, res: Response, next: NextFunction) => {
  if (req.body.hash === undefined) {
    return res
      .status(422)
      .json({ error: 'Your request body should bring a hash' });
  }

  const block = new Block(req.body as Block);
  const validation = blockchain.addBlock(block);

  if (validation.success) {
    return res.status(201).json(block);
  }

  return res.status(400).json({ error: validation });
});

/* istanbul ignore next */ //this sentence before ignores the next line to coverage tests
if (process.argv.includes('--run'))
  app.listen(PORT, () =>
    console.log(`Blockchain server is running at PORT ${PORT}`),
  );

export { app };
