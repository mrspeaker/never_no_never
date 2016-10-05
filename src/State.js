class State {
  constructor (state = "") {
    this.set(state);
  }
  set (state, blnNoReset) {
    if (blnNoReset && state === this.state) {
      return;
    }
    this.last = this.state;
    this.state = state;
    this.count = 0;
    this.time = Date.now();
    this.first = true;
  }
  isFirst () {
    const isFirst = this.first;
    this.first = false;
    return isFirst;
  }
  get () {
    return this.state;
  }
}

export default State;
