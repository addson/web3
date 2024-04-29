import Wallet from '../lib/wallet';

const walletRecovered = new Wallet(
  'ea85dd749a3df376829a63eabaa0304cec73ee2b82e3a42c474245dddbf559a5',
);
console.log('walletRecovered: ' + walletRecovered); //pbublic key: 0204f0bdb095c02cb1f9327b94ad98b97318da40ef9ea9e53b6e50fc540c3a3f4b

const newWallet = new Wallet();
console.log('newWallet: ' + newWallet);
