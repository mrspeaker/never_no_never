const Phaser = window.Phaser;

class Zombie extends Phaser.Sprite {

  constructor (game, xtile, ytile) {
    super(game, xtile * 32, ytile * 32, "peeps");

    console.log(arguments);

    const walkSpeed = 5;
    this.animations.add("walk_right", [20, 21, 22, 21], walkSpeed, true);
    this.animations.add("walk_left", [23, 24, 25, 24], walkSpeed, true);
    this.animations.add("walk_up", [26, 27], walkSpeed, true);
    this.animations.add("walk_down", [28, 29], walkSpeed, true);

    this.animations.play("walk_right");

    this.path = [];
    this.current = null;
  }

  setPath (path, onDone) {
    this.path = path.slice(1);
    this.onDone = onDone;
  }

  reset (x, y) {
    this.x = x * 32;
    this.y = y * 32;
    this.path = [];
    this.current = null;
    this.onDone && this.onDone();
  }

  update () {
    let {current, path} = this;
    const {animations} = this;

    if (!path.length) {
      animations.stop();
    }
    if (!current && path.length) {
      animations.play("walk_down");
      this.current = path[0];
      this.path = path.slice(1);
    }
    const walkSpeed = 1.5;
    if (current) {
      const xo = current.x * 32 - this.x;
      const yo = current.y * 32 - this.y;
      let xx = 0;
      let yy = 0;
      if (Math.abs(xo) >= walkSpeed * 0.65) {
        xx += walkSpeed * Math.sign(xo);
      }
      if (Math.abs(yo) >= walkSpeed * 0.65) {
        yy += walkSpeed * Math.sign(yo);
      }
      if (xx !== 0 && yy !== 0) {
        xx = xx / Math.sqrt(2);
        yy = yy / Math.sqrt(2);
      }
      this.x += xx;
      this.y += yy;

      if (Phaser.Math.distance(this.x, this.y, current.x * 32, current.y * 32) < walkSpeed) {
        this.current = null;
        if (!this.path.length) {
          this.onDone();
        }
      }
    }
  }
}

export default Zombie;
