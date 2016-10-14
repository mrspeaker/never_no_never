const Phaser = window.Phaser;

import Health from "../components/Health";
import State from "../State";
import PathWalker from "../components/PathWalker";

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

    this.pathWalker = new PathWalker();
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
    if (this.state.get() !== "dying") {
      path = path.length < 2 ? path: path.length > 2 ? path.slice(2) : path.slice(1);
      //const cx = Math.floor(this.x / 32);
      //const cy = Math.floor(this.y / 32);
      //console.log(cx, path[0].x, cy, path[1].y)
      //if (path.length && cx === path[0].x && cy === path[1].y) {
        // I don't think it ever gets here...
      //  console.log("hererer");
//        path = path.slice(1);
    //  }
      this.pathWalker.setPath(path, () => {
        this.x = Math.floor(this.x / 32) * 32;
        this.y = Math.floor(this.y / 32) * 32;
        onDone();
      });
      this.state.set("walking");
    }
  }

  reset (x, y) {
    this.x = x * 32;
    this.y = y * 32;
    this.health.health = this.health.maxHealth;
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
    const walkSpeed = this.walkSpeed;

    const dir = this.direction.get();
    this.animations.play(`walk_${dir}`);

    this.pathWalker.update((c, lastPath) => {
      if (c.y !== lastPath.y) {
        this.direction.set(c.y < lastPath.y ? "up" : "down");
      }
      else if (c.x !== lastPath.x) {
        this.direction.set(c.x < lastPath.x ? "left" : "right");
      }

      const xo = c.x * 32 - this.x;
      const yo = c.y * 32 - this.y;

      // TODO: replace this "jittery" path follower with current vs lastPath
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

      return Phaser.Math.distance(this.x, this.y, c.x * 32, c.y * 32) < walkSpeed;
    });
  }
}

export default Zombie;
