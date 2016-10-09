const Phaser = window.Phaser;
import State from "../State";

class Player extends Phaser.Sprite {

  walkSpeed = 3;
  hp = 0;
  health = 3;
  maxHealth = 5;
  armour = 0;
  maxArmour = 3;

  constructor (game, xtile, ytile) {
    super(game, xtile * 32, ytile * 32, "peeps");
    game.add.existing(this);

    this.state = new State("idle");
    this.direction = new State("right");

    const animSpeed = this.walkSpeed * 1.5;
    this.animations.add("walk_right", [0, 1, 2, 1], animSpeed, true);
    this.animations.add("walk_left", [3, 4, 5, 4], animSpeed, true);
    this.animations.add("walk_up", [6, 7], animSpeed, true);
    this.animations.add("walk_down", [8, 9], animSpeed, true);

    this.animations.add("mine", [10, 11], animSpeed * 2, true);
    this.animations.add("attack", [12, 13], animSpeed * 2, true);

    this.path = [];
    this.current = null;
    this.lastPath = null;
  }

  setPath (path, onDone) {
    this.path = path.slice(1);
    this.onDone = onDone;
    this.state.set("walking");
  }

  mineTile (block, tile, toolEfficiency, onDone) {
    this.state.set("mining", {
      onMined: onDone,
      toolEfficiency,
      hardness: block.hardness
    });
  }

  stopWalking () {
    this.state.set("idle");
  }

  update () {
    const {animations} = this;

    const current = this.state.get();
    switch (current) {
    case "walking":
      this.updateExploring();
      break;
    case "mining":
      this.updateMining();
      break;
    }

    if (this.state.isFirst()) {
      const state = this.state.get();
      const dir = this.direction.get();
      if (state === "idle") {
        this.frame = 0;
        animations.stop();
      }
      else if (state === "walking") {
        animations.play(`walk_${dir}`);
      }
      else if (state === "mining") {
        animations.play("mine");
      }
    }
  }

  updateMining () {
    const {data} = this.state;
    const {toolEfficiency, onMined} = data;
    if ((data.hardness -= (0.1 * toolEfficiency)) <= 0) {
      onMined();
      this.state.set("idle");
    }
  }

  updateExploring () {
    let {current, path, walkSpeed} = this;

    if (!current && path.length) {
      //this.state.set("walking");
      this.current = path[0];
      this.path = path.slice(1);
      if (this.lastPath) {
        if (this.current.y !== this.lastPath.y) {
          this.direction.set(this.current.y < this.lastPath.y ? "up" : "down");
        }
        else if (this.current.x !== this.lastPath.x) {
          this.direction.set(this.current.x < this.lastPath.x ? "left" : "right");
        }
      }
    }

    if (current) {
      const xo = current.x * 32 - this.x;
      const yo = current.y * 32 - this.y;

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

      if (Phaser.Math.distance(this.x, this.y, current.x * 32, current.y * 32) < walkSpeed) {
        this.lastPath = this.current;
        this.current = null;
        if (!this.path.length) {
          this.onDone();
          this.x = current.x * 32;
          this.y = current.y * 32;
        }
      }
    }
  }
}

export default Player;
