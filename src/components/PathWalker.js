class PathWalker {

  onDone = null;
  path = null;
  current = null;
  last = null;

  setPath (path, onDone) {
    if (!path.length) {
      onDone();
      return;
    }
    this.path = path;
    this.onDone = onDone;
    this.current = path[0];
    this.last = this.current; // hmm, really?
  }

  next () {
    this.last = this.current;
    if (!this.path.length) {
      this.current = null;
    }
    else {
      this.current = this.path[0];
      this.path = this.path.slice(1);
    }
    return this.current;
  }

  update (atCurrent) {
    const {current, last} = this;
    if (atCurrent(current, last)) {
      if (!this.next()) {
        this.onDone(current);
      }
    }
  }

}

export default PathWalker;
