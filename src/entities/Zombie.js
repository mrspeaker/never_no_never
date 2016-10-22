const Phaser = window.Phaser;

import Health from "../components/Health";
import State from "../State";
import PathWalker from "../components/PathWalker";
import Tween from "../Tween";
import Particles from "../Particles";

class Zombie extends Phaser.Sprite {

  walkSpeed = 1.5;

  constructor (game, xtile, ytile, bmax) {
    super(game, xtile * 32, ytile * 32, "peeps");

    this.bmax = bmax;
    this.lastPathSet = Date.now();

    this.shadow = game.add.sprite(this.x, this.y + 8, "peeps");
    this.shadow.frame = 40;

    this.bloods = new Particles(game, this.x, this.y, 0, "icons4x4", 1);
    this.bloods.emitting = false;

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

    this.hurtPause = 0;

  }

  onHurt (h, max, by) {
    this.hurtPause = 50;
    const angle = this.game.math.angleBetween(
      this.x, this.y,
      by.x, by.y
    ) + Math.PI;
    const xo = Math.sin(angle) * 40;
    const yo = Math.cos(angle) * 40;
    Tween.to(this, {x: this.x + xo, y: this.y + yo}, 150);

    this.bloods.emitting = true;
    this.bloods.x = this.x + xo;
    this.bloods.y = this.y + yo;
    this.bloodsT && clearTimeout(this.bloodsT);
    this.bloodsT = setTimeout(() => {
      this.bloods.emitting = false;
    }, 600);
  }

  onDie () {
    this.state.set("dying");
  }
  dead () {
    const {bmax:world} = this;
    const corpse = world.perma.create(this.x, this.y, "peeps");
    corpse.frame = Math.random() < 0.5 ? 30 : 31;

    const {x, y} = world.getMobSpawnPoint();
    this.x = x * 32;
    this.y = y * 32;
    this.health.health = this.health.maxHealth;
    world.world.makePath(this, x, y); // lol... damn it.
  }

  setPath (path, onDone) {
    if (this.state.get() === "dying") {
      return;
    }
    // FIXME: if want this, move to pathwalker.
    const now = Date.now();
    if (now - this.lastPathSet < 700) {
      return;
    }
    this.lastPathSet = now;

    // FIXME: hack for chasing player at close range
    if (this.isClose && path.length > 1) {
      path = path.slice(1);
    }
    //const ppath = this.pathWalker.path;
    //console.log("path", path.map(({x, y}) => `${x}:${y}`).join(", "));
    //console.log("ppath", ppath && ppath.map(({x, y}) => `${x}:${y}`).join(", "));
    const cx = Math.floor(this.x / 32);
    const cy = Math.floor(this.y / 32);
    if (path.length && cx === path[0].x && cy === path[0].y) {
      // console.log("same zombie pos. slice it.");
      path = path.slice(1);
    }

    if (path.length) {
      if (cx > path[0].x) this.direction.set("left");
      else if (cx < path[0].x) this.direction.set("right");
      else if (cy > path[0].y) this.direction.set("down");
      else if (cy < path[0].y) this.direction.set("up");
      this.state.set("walking");
    }
    this.pathWalker.setPath(path, (last) => {
      if (last) {
        this.x = last.x * 32;
        this.y = last.y * 32;
      }
      this.state.set("idle");
      onDone();
    });

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
      if (this.hurtPause-- < 0) {
        this.updateWalking();
      }
      break;
    case "dying":
      if (this.state.isFirst()) {
        this.dead();
      }
      if (Math.random() < 0.1) {
        this.state.set("idle");
      }
      break;
    }

    this.shadow.x = this.x;
    this.shadow.y = this.y + 8;
  }

  updateWalking () {
    const walkSpeed = this.walkSpeed;

    const dir = this.direction.get();
    this.animations.play(`walk_${dir}`);

    this.pathWalker.update((c, lastPath, isFirst) => {
      const txo = c.x - lastPath.x;
      const tyo = c.y - lastPath.y;

      if (!isFirst && (txo || tyo)) {
        if (Math.abs(txo) > Math.abs(tyo)) {
          this.direction.set(c.x < lastPath.x ? "left" : "right");
        }
        else {
          this.direction.set(c.y < lastPath.y ? "up" : "down");
        }
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
      const dist = Phaser.Math.distance(this.x, this.y, c.x * 32, c.y * 32);
      return dist <= walkSpeed;
    });
  }
}

export default Zombie;
