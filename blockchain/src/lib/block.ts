export default class Block {
  index: number = 1;
  hash: string = '';
  created: Date = new Date(1976, 9, 16);

  constructor(index: number, hash: string) {
    this.index = index;
    this.hash = hash;
  }

  isValid(): boolean {
    if (this.index < 0) {
      return false;
    }

    if (!this.hash) {
      return false;
    }

    if (this.created <= new Date(1976, 9, 16)) {
      return false;
    }

    return true;
  }
}
