//@flow
class State {

  state: string;
  last: string;
  count: number;
  time: number;
  first: boolean;
  data: any;

  constructor (state: string = "") {
    this.set(state);
  }
  set (state: string, data: any) {
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
  is (...states: Array<string>) {
    return states.includes(this.state);
  }
}

export default State;
