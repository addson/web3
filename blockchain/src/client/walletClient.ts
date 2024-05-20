import Wallet from '../lib/wallet';
import dotenv from 'dotenv';
import axios from 'axios';
import readline from 'readline';
import Transaction from '../lib/transaction';
import TransactionType from '../lib/transactionType';
import TransactionInput from '../lib/transactionInput';
import { response } from 'express';

dotenv.config();

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;

let myWalletPub = '';
let myWalletPriv = '';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function menu() {
  setTimeout(() => {
    console.clear();

    if (myWalletPub) {
      console.log(`You are logged as ${myWalletPub}`);
    } else {
      console.log(`You are NOT logged`);
    }
    console.log('');

    console.log('1 - Create Wallet');
    console.log('2 - Recover Wallet');
    console.log('3 - Balance');
    console.log('4 - Send new Transaction to Blockchain');
    console.log('5 - Search Transaction on Blockchain');
    console.log('');

    rl.question('Choose your option: ', answer => {
      switch (answer) {
        case '1':
          createWallet();
          break;
        case '2':
          recoverWallet();
          break;
        case '3':
          balance();
          break;
        case '4':
          sendTx();
          break;
        case '5':
          searchTx();
          break;
        default: {
          console.log('Wrong Option! Choose 1|2|3|4|5');
          menu();
        }
      }
    });
  }, 1000);
}

function preMenu() {
  console.log('');
  rl.question(`Press any key to continue... `, () => {
    menu();
  });
}

function createWallet() {
  console.clear();
  const wallet = new Wallet();

  console.log(`Your new wallet:`);
  console.log(wallet);

  myWalletPub = wallet.publicKey;
  myWalletPriv = wallet.privateKey;
  preMenu();
}

function recoverWallet() {
  console.clear();
  rl.question(`Please, your private key: `, privateKey => {
    const wallet = new Wallet(privateKey);

    console.log(`Your recovered wallet:`);
    console.log(wallet);

    myWalletPub = wallet.publicKey;
    myWalletPriv = wallet.privateKey;
    preMenu();
  });
}

function balance() {
  console.clear();

  if (!myWalletPub) {
    console.log(`You do not have a wallet yet!`);

    //todo getBalance using API Calling using publicKey
    preMenu();
  }
}

function sendTx() {
  console.clear();

  if (!myWalletPub) {
    console.log(`You do not have a wallet yet!`);

    preMenu();
  }

  console.log(`Your wallet is ${myWalletPub}`);
  rl.question(`To Wallet: `, walletTo => {
    if (walletTo.length < 66) {
      console.log(`Wrong public address of wallet!`);
      return preMenu();
    }

    rl.question(`Amount: `, async amountStr => {
      if (amountStr === '0') {
        console.log(`Wrong amount to be sent!`);
        return preMenu();
      }

      const amount = parseInt(amountStr);
      if (!amount) {
        console.log(`Wrong amount to be sent!`);
        return preMenu();
      }

      //gets Balance validation

      const transaction = new Transaction();
      transaction.timestamp = Date.now();
      transaction.to = walletTo;
      transaction.type = TransactionType.REGULAR;
      transaction.txInput = new TransactionInput({
        amount,
        fromAddress: myWalletPub,
      } as TransactionInput);
      transaction.txInput.sign(myWalletPriv);
      transaction.hash = transaction.getHash();

      try {
        const transactionResponse = await axios.post(
          `${BLOCKCHAIN_SERVER}transactions/`,
          [transaction],
        );

        console.log(
          `Transaction sent and acepted by blockchain main pool and waiting the miners...`,
        );
        console.log(transactionResponse.data);
      } catch (error: any) {
        console.error(error.response ? error.response.data : error.message);
      }

      return preMenu();
    });
  });
}

function searchTx() {
  console.clear();
  rl.question('Your tx hash sent to blockchain: ', async hash => {
    const response = await axios.get(
      `${BLOCKCHAIN_SERVER}transactions/${hash}`,
    );
    console.log(response.data);
    return preMenu();
  });
}

menu();
