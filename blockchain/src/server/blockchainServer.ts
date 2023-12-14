import dotenv from 'dotenv';
dotenv.config();

import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import Blockchain from '../lib/blockchain';
import Block from '../lib/block';
import Transaction from '../lib/transaction';

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

app.get(
  '/transactions/:hash?',
  (req: Request, res: Response, next: NextFunction) => {
    if (req.params.hash) {
      return res.json(blockchain.getTransaction(req.params.hash));
    }

    if (
      blockchain.transactionsMemPool &&
      blockchain.transactionsMemPool.length > 0
    ) {
      return res.json({
        total_transactions_mempool: blockchain.transactionsMemPool.length,
        transactions_next_block: blockchain.transactionsMemPool.slice(
          0,
          Blockchain.TX_MAX_PER_BLOCK,
        ),
      });
    }

    return res.json('Transactions Mempool is empty!');
  },
);

app.post(
  '/transactions/',
  (req: Request, res: Response, next: NextFunction) => {
    const transactionsData: any[] = req.body;

    if (!Array.isArray(transactionsData) || transactionsData.length === 0) {
      return res.status(422).json({
        error: 'Your request body should be a non-empty array of transactions',
      });
    }

    //this ensures that the functions of Transaction object are loaded too
    const transactions: Transaction[] = transactionsData.map(
      item => new Transaction(item as Transaction),
    );

    const invalidTransaction = transactions.find(
      tx => tx.hash === undefined || tx.data === undefined,
    );
    if (invalidTransaction) {
      return res.status(422).json({
        error: 'Each transaction should have both hash and data fields',
      });
    }

    const validation = blockchain.addTransactions(transactions);

    if (validation.success) {
      return res.status(201).json(transactions);
    }

    return res.status(400).json({ error: validation });
  },
);

/* istanbul ignore next */ //this sentence before ignores the next line to coverage tests
if (process.argv.includes('--run'))
  app.listen(PORT, () =>
    console.log(`Blockchain server is running at PORT ${PORT}`),
  );

export { app };
