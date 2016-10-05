const Phaser = window.Phaser;

class Player extends Phaser.Sprite {

  constructor (game, xtile, ytile) {
    super(game, xtile * 32, ytile * 32, "peeps");
    game.add.existing(this);

    const walkSpeed = 5;
    this.animations.add("walk_right", [0, 1, 2, 1], walkSpeed, true);
    this.animations.add("walk_left", [3, 4, 5, 4], walkSpeed, true);
    this.animations.add("walk_up", [6, 7], walkSpeed, true);
    this.animations.add("walk_down", [8, 9], walkSpeed, true);

    this.path = [];
    this.current = null;
  }

  setPath (path, onDone) {
    this.path = path.slice(1);
    this.onDone = onDone;
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
    const walkSpeed = 3;
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

export default Player;
