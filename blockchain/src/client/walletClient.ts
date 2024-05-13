import Wallet from '../lib/wallet';
import dotenv from 'dotenv';
import axios from 'axios';
import readline from 'readline';

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
    console.log('4 - Send new Transaction');
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
        default: {
          console.log('Wrong Option!');
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

    //todo sendTx using API Calling
    preMenu();
  }
}

menu();
