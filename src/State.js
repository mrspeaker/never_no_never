class State {
  constructor (state = "") {
    this.set(state);
  }
  set (state, data) {
    this.last = this.state;
    this.state = state;
    this.count = 0;
    this.time = Date.now();
    this.first = true;
    this.data = data;
  }
  isFirst () {
    const isFirst = this.first;
    this.first = false;
    return isFirst;
  }
  get () {
    return this.state;
  }
  is (...states) {
    return states.includes(this.state);
  }
}

export default State;
