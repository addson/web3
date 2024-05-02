import * as ecc from 'tiny-secp256k1';
import ECPairFactory, { ECPairInterface } from 'ecpair';

//Object that will be used to generates dthe private and public keys.
const ECPair = ECPairFactory(ecc);

/**
 * Wallet class
 */
export default class Wallet {
  privateKey: string;
  publicKey: string;

  /**
   * Important: WIF é uma maneira conveniente e segura de representar chaves privadas,
   * permitindo que os usuários importem e exportem facilmente suas chaves entre diferentes
   * carteiras e aplicativos sem comprometer a segurança.
   *
   * @param wifOrPrivateKey Wallet Import Format (WIF) or private key
   */

  constructor(wifOrPrivateKey?: string) {
    let keys;
    if (wifOrPrivateKey) {
      if (wifOrPrivateKey.length === 64) {
        keys = ECPair.fromPrivateKey(Buffer.from(wifOrPrivateKey, 'hex'));
      } else {
        keys = ECPair.fromWIF(wifOrPrivateKey);
      }
    } else {
      keys = ECPair.makeRandom();
    }

    /* istanbul ignore next */ //this sentence before ignores the next line to coverage tests
    this.privateKey = keys.privateKey?.toString('hex') || '';
    this.publicKey = keys.publicKey.toString('hex');
  }
}
