const Phaser = window.Phaser;

import State from "../State";
import Health from "../components/Health";
import PathWalker from "../components/PathWalker";
import Items from "../Items";
import Tween from "../Tween";
import Blocks from "../Blocks";
import Bullet from "./Bullet";

import DayTime from "../DayTime";

class Player extends Phaser.Sprite {

  walkSpeed = 3;
  hp = 0;
  armour = 0;
  maxArmour = 3;

  died = null;

  states = {
    idle: "idle",
    walking: "walking",
    building: "building",
    mining: "mining",
    dying: "dying",
    dead: "dead"
  };

  constructor (game, xtile, ytile, onHurt, onDie) {
    super(game, xtile * 32, ytile * 32, "peeps");

    this.shadow = game.add.sprite(this.x, this.y + 8, "peeps");
    this.shadow.frame = 40;
    game.add.existing(this);

    this.state = new State("idle");
    this.direction = new State("right");

    this.lastShootTime = Date.now();

    const animSpeed = this.walkSpeed * 1.5;
    this.animations.add("walk_right", [0, 1, 2, 1], animSpeed, true);
    this.animations.add("walk_left", [3, 4, 5, 4], animSpeed, true);
    this.animations.add("walk_up", [6, 7], animSpeed, true);
    this.animations.add("walk_down", [8, 9], animSpeed, true);
    this.animations.add("mine_right", [80, 81, 82, 83, 84, 85], 20, true);
    this.animations.add("mine_left", [86, 87, 88, 89, 90, 91], 20, true);
    this.animations.add("mine_up", [64, 65], animSpeed * 2, true);
    this.animations.add("mine_down", [66, 67], animSpeed * 2, true);
    this.animations.add("attack_left", [12, 13, 14, 15, 16, 17], 24, true),
    this.animations.add("attack_right", [32, 33, 34, 35, 36, 37], 24, true),
    this.animations.add("attack_up", [12, 13, 14, 15, 16, 17], 24, true),
    this.animations.add("attack_down", [32, 33, 34, 35, 36, 37], 24, true),

    this.health = new Health(3, 5);
    this.health.onHurt = (...args) => {
      if (this.died) return;
      this.onHurt(...args);
      onHurt(...args);
    };
    this.health.onDie = onDie;
    this.pathWalker = new PathWalker();
  }

  onHurt (h, max, by) {
    Tween.flash(this, {alpha: 0});
    this.game.camera.shake(0.01, 200);
    // Don't stop walking.
    if (this.state.get() === "mining") {
      this.state.set("idle");
    }

    const angle = this.game.math.angleBetween(
      this.x, this.y,
      by.x, by.y
    ) + Math.PI;
    const xo = Math.cos(angle) * 30;
    const yo = Math.sin(angle) * 30;
    Tween.to(this, {x: this.x + xo, y: this.y + yo}, 150);
  }

  setPath (path, onDone) {
    if (this.state.get() === "building") {
      // if building mode, place a brick: don't set a path.
      return;
    }
    const cx = Math.floor(this.x / 32);
    const cy = Math.floor(this.y / 32);
    if (path.length && cx === path[0].x && cy === path[1].y) {
      // console.log("same player pos. slice it.");
      path = path.slice(1);
    }

    path.length && this.state.set("walking");

    this.pathWalker.setPath(path, (last) => {
      if (last) {
        this.x = last.x * 32;
        this.y = last.y * 32;
      }
      this.state.set("idle");
      onDone();
    });
  }

  shoot (e) {
    const now = Date.now();
    if (now - this.lastShootTime < 800) {
      return false;
    }
    this.lastShootTime = now;
    const b = new Bullet(this.game, this.x + 16, this.y + 16, e);
    this.game.add.existing(b);
    return true;
  }

  attack (e) {
    const dir = e.x > this.x ? "left" : "right";
    this.animations.play(`attack_${dir}`);
  }

  switchTool (tool) {
    const item = Items[tool.item];
    const current = this.state.get();
    // Stop mining if switch tool
    if (current === "mining") {
      this.state.set("idle");
    }

    if (item.placeable) {
      this.state.set("building");
    }
    else if (current === "building") {
      this.state.set("exploring");
    }
  }

  handleClick(tool, walk, place) {
    if (this.state.get() === "building") {
      // NOTE: assuming an Item is the same as a Block for placeables.
      place(Blocks[tool.item].tile);
    } else {
      walk();
    }
  }

  mineTile (block, tile, toolEfficiency, onDone) {
    this.state.set("mining", {
      onMined: onDone,
      toolEfficiency,
      hardness: block.hardness
    });
  }

  stop () {
    this.state.set("idle");
  }

  update () {
    const {animations} = this;

    if (this.died) {
      animations.stop();
      this.frame = 19;
      this.alpha -= 0.01;
      if (Date.now() - this.died.time > 2500) {
        this.died.onDead();
      }
      return;
    }

    const current = this.state.get();
    switch (current) {
    case "walking":
      this.updateExploring();
      break;
    case "mining":
      this.updateMining();
      break;
    case "building":
      this.updateBuilding();
      break;
    case "dead":
      break;
    }

    const mode = this.state.get();
    const dir = this.direction.get();
    if (this.state.isFirst()) {
      if (mode === "idle") {
        this.frame = 0;
        animations.stop();
      }
    }
    if (mode === "walking") {
      animations.play(`walk_${dir}`);
    }

    if (mode === "mining") {
      animations.play(`mine_${dir}`);
    }

    this.shadow.x = this.x;
    this.shadow.y = this.y + 8;
  }

  updateMining () {
    const {data} = this.state;
    const {toolEfficiency, onMined} = data;
    if ((data.hardness -= (0.1 * toolEfficiency)) <= 0) {
      onMined();
      this.state.set("idle");
    }
  }

  updateBuilding () {

  }

  updateExploring () {
    const {walkSpeed, pathWalker} = this;

    pathWalker.update((c, lastPath) => {
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
      this.x += xx * (1 - DayTime.percent);
      this.y += yy * (1 - DayTime.percent);

      return Phaser.Math.distance(this.x, this.y, c.x * 32, c.y * 32) < walkSpeed;
    });

  }
}

export default Player;
