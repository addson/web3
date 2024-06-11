import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import BlockInfo from '../lib/blockInfo';
import Block from '../lib/block';
import Wallet from '../lib/wallet';
import Transaction from '../lib/transaction';
import TransactionType from '../lib/transactionType';
import TransactionOutput from '../lib/transactionOutput';

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;

let totalMined = 0;

function getRewardTx(): Transaction {
  const txo = new TransactionOutput({
    toAddress: minerWallet.publicKey,
    amount: 10,
  } as TransactionOutput);

  const tx = new Transaction({
    txOutputs: [txo],
    type: TransactionType.FEE,
  } as Transaction);

  tx.hash = tx.getHash();
  tx.txOutputs[0].transactionHash = tx.hash;

  return tx;
}

const minerWallet = new Wallet(process.env.MINER_WALLET);

// console.log('>> Logged as ' + minerWallet.publickKey);

async function mine() {
  console.log('>> Logged as ' + minerWallet.publicKey);
  console.log('>> Getting Next Block Info...');
  console.log(`>> GET: ${BLOCKCHAIN_SERVER}blocks/next`);

  const { data } = await axios.get(`${BLOCKCHAIN_SERVER}blocks/next`);
  if (!data) {
    console.log('>> No TX found on transactionsMemPool at now...');
    console.log();
    return setTimeout(() => {
      mine();
    }, 5000);
  }
  const blockInfo = data as BlockInfo;
  const newBlock = Block.blockInfoToBlock(blockInfo);
  newBlock.transactions.push(getRewardTx());

  newBlock.miner = minerWallet.publicKey;
  newBlock.hash = newBlock.getHash();

  console.log('>> Starting Mining New Block >> ' + blockInfo.index);
  console.log(
    '>> Difficult Challenge (number of 0s starting the block hash): ' +
      blockInfo.difficultChallenge,
  );

  //How long does it take to mine?
  const start = performance.now();
  newBlock.mine(blockInfo.difficultChallenge, minerWallet.publicKey);
  const end = performance.now();
  const executionTime = (end - start) / 1000;
  const preetyTime =
    executionTime >= 60
      ? Number((executionTime / 60).toFixed(3)) + ' mins'
      : Number(executionTime.toFixed(3)) + ' secs';
  console.log(`>> How long does it take to mine: ${preetyTime}`);

  console.log('>> New Block Mined sending to Blockchain...');
  try {
    await axios.post(`${BLOCKCHAIN_SERVER}blocks/`, newBlock);
    console.log('>> New Block SENT to Blockchain and Accepted!');
    totalMined++;
    console.log('>> Total Mined Blocks: ' + totalMined);
    console.log(newBlock);
  } catch (error: any) {
    console.error(error.response ? error.response.data : error.message);
  }

  setTimeout(() => {
    mine();
  }, 3000);

  console.log();
}

mine();
