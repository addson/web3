import request from 'supertest';
import { describe, test, expect, jest, beforeAll } from '@jest/globals';
import { app } from '../src/server/blockchainServer';
import Block from '../src/lib/block';
import Transaction from '../src/lib/transaction';
import TransactionType from '../src/lib/transactionType';
import TransactionInput from '../src/lib/transactionInput';
import Wallet from '../src/lib/wallet';

jest.mock('../src/lib/block');
jest.mock('../src/lib/blockchain');

describe('BlockchainServer Tests', () => {
  let wallet: Wallet;
  let txInput: TransactionInput;

  beforeAll(() => {
    wallet = new Wallet();
    txInput = new TransactionInput({
      amount: 10,
      fromAddress: wallet.publicKey,
    } as TransactionInput);
    txInput.sign(wallet.privateKey);
  });

  test('GET /status - Should return status', async () => {
    const response = await request(app).get('/status/');
    expect(response.status).toEqual(200);
    expect(response.body.isValid.success).toEqual(true);
  });

  test('GET /blocks - Should get the genesis block', async () => {
    const response = await request(app).get('/blocks/0');
    expect(response.status).toEqual(200);
    expect(response.body.index).toEqual(0);
  });

  test('GET /blocks - Should get block', async () => {
    const response = await request(app).get('/blocks/abc');
    expect(response.status).toEqual(200);
    expect(response.body.hash).toEqual('abc');
  });

  test('GET /blocks/next - Should get next block info to be used by miners', async () => {
    const response = await request(app).get('/blocks/next');
    expect(response.status).toEqual(200);
    expect(response.body.index).toEqual(1);
  });

  test('GET /blocks - Should NOT get block', async () => {
    const response = await request(app).get('/blocks/-1');
    expect(response.status).toEqual(404);
  });

  test('POST /blocks - Should add block', async () => {
    const block = new Block({
      index: 1,
    } as Block);
    const response = await request(app).post('/blocks/').send(block);
    expect(response.status).toEqual(201);
    expect(response.body.index).toEqual(1);
  });

  test('POST /blocks - Should NOT add empty block', async () => {
    const response = await request(app).post('/blocks/').send({});
    expect(response.status).toEqual(422);
  });

  test('POST /blocks - Should NOT add invalid block', async () => {
    const block = new Block({
      index: -1,
    } as Block);
    const response = await request(app).post('/blocks/').send(block);
    expect(response.status).toEqual(400);
  });

  test('GET /transactions - Should NOT get any next transactions as transactionsMemPool is empty.', async () => {
    //ask for a transaction that was not added before
    const response = await request(app).get('/transactions/');
    // console.log(response);
    expect(response.status).toEqual(400);
  });

  test('POST /transactions - Should NOT add empty transactions', async () => {
    const response = await request(app).post('/transactions/').send([]);
    expect(response.status).toEqual(422);
  });

  test('POST /transactions - Should NOT add transactions with hash, txInput or to empty', async () => {
    const transaction = new Transaction({
      type: TransactionType.REGULAR,
      timestamp: Date.now(),
      txInput: txInput,
      //to: 'PUBLIC_KEY_TARGET',
    } as Transaction);

    const response = await request(app)
      .post('/transactions/')
      .send([transaction]);
    expect(response.status).toEqual(422);
  });

  test('POST /transactions - Should NOT add transactions as any transaction is invalid.', async () => {
    const tx1 = new Transaction({
      hash: '',
      txInput: txInput,
      to: 'PUBLIC_KEY_TARGET',
    } as Transaction);

    const tx2 = new Transaction({
      hash: '',
      txInput: txInput,
      to: 'PUBLIC_KEY_TARGET',
    } as Transaction);

    tx2.hash = 'INVALIDATING_THE_HASH';

    const transactions = new Array() as Transaction[];
    transactions.push(tx1);
    transactions.push(tx2);

    const response = await request(app)
      .post('/transactions/')
      .send(transactions);

    // console.log(response.status);
    expect(response.status).toEqual(400);
  });

  test('POST /transactions - Should successfully add transactions.', async () => {
    const tx1 = new Transaction({
      hash: '',
      txInput: txInput,
      to: 'PUBLIC_KEY_TARGET',
    } as Transaction);

    const tx2 = new Transaction({
      hash: '',
      txInput: txInput,
      to: 'PUBLIC_KEY_TARGET',
    } as Transaction);

    const transactions = new Array() as Transaction[];
    transactions.push(tx1);
    transactions.push(tx2);

    const response = await request(app)
      .post('/transactions/')
      .send(transactions);

    // console.log(response.status);
    expect(response.status).toEqual(201);
  });

  test('GET /transactions - Should retrieve a specific transaction on the blockchain.', async () => {
    const tx1 = new Transaction({
      hash: '',
      txInput: txInput,
      to: 'PUBLIC_KEY_TARGET',
    } as Transaction);

    const tx2 = new Transaction({
      hash: '',
      txInput: txInput,
      to: 'PUBLIC_KEY_TARGET',
    } as Transaction);

    const transactions = new Array() as Transaction[];
    transactions.push(tx1);
    transactions.push(tx2);

    const response1 = await request(app)
      .post('/transactions/')
      .send(transactions);

    const response2 = await request(app).get(`/transactions/${tx2.hash}`);
    expect(response2.status).toEqual(200);
    // console.log(response2.status);
  });

  test('GET /transactions - Should get all next transactions on the blockchain.', async () => {
    const tx1 = new Transaction({
      hash: '',
      txInput: txInput,
      to: 'PUBLIC_KEY_TARGET',
    } as Transaction);

    const tx2 = new Transaction({
      hash: '',
      txInput: txInput,
      to: 'PUBLIC_KEY_TARGET',
    } as Transaction);

    const transactions = new Array() as Transaction[];
    transactions.push(tx1);
    transactions.push(tx2);

    const response1 = await request(app)
      .post('/transactions/')
      .send(transactions);

    const response2 = await request(app).get(`/transactions/`);
    expect(response2.status).toEqual(200);
    // console.log(response2.status);
  });
});
