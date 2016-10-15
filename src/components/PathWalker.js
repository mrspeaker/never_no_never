class PathWalker {

  onDone = null;
  path = null;
  current = null;
  last = null;

  reset () {
    this.onDone = null;
    this.path = null;
    this.current = null;
    this.last = null;
  }

  show (game, max = 50, sprite = "peeps", frame = 20, alpha = 0.2) {
    this.markers = Array.from(new Array(max), () => {
      const s = game.add.sprite(0, 0, sprite);
      s.frame = frame;
      s.alpha = alpha;
      return s;
    });
  }

  setPath (path, onDone) {
    if (!path.length) {
      onDone();
      return;
    }
    this.path = path;
    this.onDone = onDone;
    this.current = path[0];
    this.last = this.current; // hmm, really?

    this.markers &&
    this.markers.forEach((m, i) => {
      if (i < path.length) {
        m.x = path[i].x * 32;
        m.y = path[i].y * 32;
      } else {
        m.x = 0;
        m.y = 0;
      }
    });
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
