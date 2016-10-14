const Phaser = window.Phaser;

import Health from "../components/Health";
import State from "../State";

class Zombie extends Phaser.Sprite {

  walkSpeed = 1.5;

  constructor (game, xtile, ytile, bmax) {
    super(game, xtile * 32, ytile * 32, "peeps");

    this.bmax = bmax;

    this.shadow = game.add.sprite(this.x, this.y + 8, "peeps");
    this.shadow.frame = 40;

    const walkSpeed = 5;
    this.animations.add("idle", [20], walkSpeed, true);
    this.animations.add("walk_right", [20, 21, 22, 21], walkSpeed, true);
    this.animations.add("walk_left", [23, 24, 25, 24], walkSpeed, true);
    this.animations.add("walk_up", [26, 27], walkSpeed, true);
    this.animations.add("walk_down", [28, 29], walkSpeed, true);

    this.animations.play("walk_right");

    this.health = new Health(3, 3, 160);
    this.health.onHurt = this.onHurt.bind(this);
    this.health.onDie = this.onDie.bind(this);

    this.state = new State("idle");
    this.direction = new State("right");

    this.path = [];
    this.current = null;
  }

  onHurt () {
    //console.log("hurt");
  }

  onDie () {
    this.state.set("dying");
  }
  dead () {
    const {bmax:world} = this;
    const corpse = world.perma.create(this.x, this.y, "peeps");
    corpse.frame = Math.random() < 0.5 ? 30 : 31;

    const {x, y} = world.getMobSpawnPoint();
    world.world.makePath(this, x, y);
    this.reset(x, y);
  }

  setPath (path, onDone) {
    this.path = path.length < 2 ? path: path.length > 2 ? path.slice(2) : path.slice(1);
    this.onDone = onDone;
    this.state.set("walking");
  }

  reset (x, y) {
    this.x = x * 32;
    this.y = y * 32;
    this.current = null;
    this.health.health = this.health.maxHealth;
    this.path = [];
    this.state.set("idle");
  }

  update () {
    const {animations} = this;
    const current = this.state.get();
    switch (current) {
    case "idle":
      if (this.state.isFirst()) {
        animations.play("idle");
      }
      break;
    case "walking":
      this.updateWalking();
      break;
    case "dying":
      this.dead();
      break;
    }

    this.shadow.x = this.x;
    this.shadow.y = this.y + 8;
  }

  updateWalking () {
    let {current, path} = this;
    const {animations} = this;

    if (!current && path.length) {
      animations.play("walk_down");
      this.current = path[0];
      this.path = path.slice(1);
    }

    if (current) {
      const xo = current.x * 32 - this.x;
      const yo = current.y * 32 - this.y;
      let xx = 0;
      let yy = 0;
      if (Math.abs(xo) >= this.walkSpeed * 0.65) {
        xx += this.walkSpeed * Math.sign(xo);
      }
      if (Math.abs(yo) >= this.walkSpeed * 0.65) {
        yy += this.walkSpeed * Math.sign(yo);
      }
      if (xx !== 0 && yy !== 0) {
        xx = xx / Math.sqrt(2);
        yy = yy / Math.sqrt(2);
      }
      this.x += xx;
      this.y += yy;

      if (Phaser.Math.distance(this.x, this.y, current.x * 32, current.y * 32) < this.walkSpeed) {
        this.current = null;
        if (!this.path.length) {
          this.onDone();
          this.x = current.x * 32;
          this.y = current.y * 32;
          this.state.set("idle");
        }
      }
    }
  }
}

export default Zombie;
