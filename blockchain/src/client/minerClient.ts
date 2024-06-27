import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import BlockInfo from '../lib/blockInfo';
import Block from '../lib/block';
import Wallet from '../lib/wallet';
import Transaction from '../lib/transaction';
import TransactionType from '../lib/transactionType';
import TransactionOutput from '../lib/transactionOutput';
import Blockchain from '../lib/blockchain';

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;

let totalMined = 0;

function getRewardTx(
  blockInfo: BlockInfo,
  nextBlock: Block,
): Transaction | undefined {
  let amount = 0;

  if (blockInfo.difficultChallenge >= blockInfo.maxDifficultChallenge) {
    amount += Blockchain.getRewardAmount(blockInfo.difficultChallenge);
  }

  //all fees related all transactions of this block
  // const fees = nextBlock.transactions
  //   .map(tx => tx.getFee())
  //   .reduce((a, b) => a + b, 0);
  // all fees related to all transactions of this block
  const fees = nextBlock.transactions
    .map(tx => {
      // Converte para uma instância de Transaction se não for uma
      if (!(tx instanceof Transaction)) {
        tx = new Transaction(tx);
      }

      if (typeof tx.getFee === 'function') {
        return tx.getFee();
      } else {
        console.error('getFee is not a function for transaction', tx);
        return 0; // ou outra lógica para lidar com a ausência da função
      }
    })
    .reduce((a, b) => a + b, 0);

  console.log('Total fees:', fees);

  //checking if there is any malicious wallet is not passing fees to miner
  const feeCheck = nextBlock.transactions.length * blockInfo.feePerTx;
  if (fees < feeCheck) {
    console.log('Low fees. Awaiting next block.');
    setTimeout(() => {
      mine();
    }, 5000);

    return;
  }
  //if fees are correct
  amount += fees;

  const txo = new TransactionOutput({
    toAddress: minerWallet.publicKey,
    amount,
  } as TransactionOutput);

  return Transaction.fromReward(txo);
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
  const tx = getRewardTx(blockInfo, newBlock);
  if (!tx) return;
  newBlock.transactions.push(tx);

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
