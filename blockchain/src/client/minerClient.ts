import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import BlockInfo from '../lib/blockInfo';
import Block from '../lib/block';

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SEVER;

let totalMined = 0;

const minerWallet = {
  privateKey: 'addson.pri',
  publickKey: `$process.env.MINER_WALLET`,
};

console.log('>> Logged as ' + minerWallet.publickKey);

async function mine() {
  console.log('>> Getting Next Block Info...');
  const { data } = await axios.get(`${BLOCKCHAIN_SERVER}/blocks/next`);
  const blockInfo = data as BlockInfo;
  const newBlock = Block.blockInfoToBlock(blockInfo);

  console.log('>> Starting Mining New Block >> ' + blockInfo.index);
  newBlock.mine(blockInfo.difficultChallenge, minerWallet.publickKey);

  console.log('>> New Block Mined sending to Blockchain...');
  try {
    await axios.post(`${BLOCKCHAIN_SERVER}/blocks/`, newBlock);
    console.log('>> New Block SENT to Blockchain and Accepted!');
    totalMined++;
    console.log('>> Total Mined Blocks: ' + totalMined);
    console.log(newBlock);
  } catch (error: any) {
    console.error(error.response ? error.response.data : error.message);
  }

  setTimeout(() => {
    mine();
  }, 1000);

  console.log();
}

mine();
