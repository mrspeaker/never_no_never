class PathWalker {

  onDone = null;

  path = [];
  current = null;
  last = null;

  setPath (path, onDone) {
    this.path = path;
    if (onDone) {
      this.onDone = onDone;
    }
    this.getCurrent();
  }

  getCurrent () {
    if (this.current) {
      return this.current;
    }
    return this.next();
  }

  next () {
    this.last = this.current;
    if (!this.path.length) {
      return null;
    }
    this.current = this.path[0];
    this.path = this.path.slice(1);
    return this.current;

  }

  update (atCurrent) {
    if (atCurrent(this.current, this.last)) {
      if (!this.next()) {
        this.onDone();
      }
    }
  }

}

export default PathWalker;
