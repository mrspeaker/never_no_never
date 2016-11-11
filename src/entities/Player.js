//@flow
import Phaser, {Game, Sprite} from "phaser";

import State from "../State";
import Health from "../components/Health";
import PathWalker from "../components/PathWalker";
import Items from "../Items";
import Tween from "../Tween";
import Blocks from "../Blocks";
import Bullet from "./Bullet";
import Particles from "../Particles";
import Inventory from "../Inventory";

import type {Point} from "../types";

class Player extends Sprite {

  walkSpeed: number = 3;
  hp: number = 0;

  died: Object = {};
  swingingForAttack = false;
  lastAttack = Date.now();

  shadow: Sprite;
  health: Health;
  bloods: Particles;
  bloodsTimer: number;
  lastDir: string;
  lastShootTime: number;
  state: State;
  inventory: Inventory;

  direction: any;
  pathWalker: any;

  states = {
    idle: "idle",
    walking: "walking",
    building: "building",
    mining: "mining",
    dying: "dying",
    dead: "dead"
  };

  constructor (game: Game, xtile: number, ytile: number,
    onHurt: (health: number, maxHealth: number, e: Object) => void = ()=>{},
    onDie: ()=>void = ()=>{}) {
    super(game, xtile * 32, ytile * 32, "peeps");

    this.shadow = game.add.sprite(this.x, this.y + 8, "peeps");
    this.shadow.frame = 40;
    game.add.existing(this);

    this.state = new State("idle");
    this.direction = new State("right");
    this.lastDir = "right";

    this.lastShootTime = Date.now();

    this.bloods = new Particles(game, this.x, this.y, 0, "icons4x4", 1);
    this.bloods.emitting = false;

    const animSpeed = this.walkSpeed * 1.5;
    this.animations.add("walk_right", [1, 2, 1, 0], animSpeed * 1.5, true);
    //this.animations.add("walk_left", [3, 4, 5, 4], animSpeed, true);
    this.animations.add("walk_up", [100, 101, 102, 101], animSpeed * 1.5, true);
    this.animations.add("walk_down", [103, 104, 105, 104], animSpeed * 1.5, true);
    this.animations.add("mine_right", [80, 81, 82, 83, 84, 85], 20, true);
    this.animations.add("mine_left", [86, 87, 88, 89, 90, 91], 20, true);
    this.animations.add("mine_up", [64, 65], animSpeed * 2, true);
    this.animations.add("mine_down", [66, 67], animSpeed * 2, true);
    this.animations.add("attack_left", [12, 13, 14, 15, 16, 17], 24, true);
    this.animations.add("attack_right", [32, 33, 34, 35, 36, 37], 24, true);
    this.animations.add("attack_up", [12, 13, 14, 15, 16, 17], 24, true);
    this.animations.add("attack_down", [32, 33, 34, 35, 36, 37], 24, true);

    // this.animations.add("walk_right", [120, 121, 122, 123, 124, 125, 126], 15, true);
    this.animations.add("walk_left", [127, 128, 129, 130, 131, 132, 133], 15, true);

    this.health = new Health(3, 5);
    this.health.onHurt = (health: number, maxHealth: number, e: Object) => {
      if (this.died.time) return;
      this.onHurt(health, maxHealth, e);
      onHurt(health, maxHealth, e);
    };
    this.health.onDie = onDie;
    this.pathWalker = new PathWalker();
  }

  onHurt (health: number, max: number, by: Object) {
    Tween.flash(this, {alpha: 0});
    this.game.camera.shake(0.01, 200);
    this.state.set("idle");

    const angle = this.game.math.angleBetween(
      this.x, this.y,
      by.x, by.y
    ) + Math.PI;
    const xo = Math.cos(angle) * 30;
    const yo = Math.sin(angle) * 30;
    Tween.to(this, {x: this.x + xo, y: this.y + yo}, 150);

    this.bloods.emitting = true;
    this.bloods.x = this.x + xo;
    this.bloods.y = this.y + yo;
    this.bloodsTimer && clearTimeout(this.bloodsTimer);
    this.bloodsTimer = setTimeout(() => {
      this.bloods.emitting = false;
    }, 600);

  }

  chargedForAttack (): boolean {
    return Date.now() - this.lastAttack > 300;
  }
  rechargeAttack () {
    this.lastAttack = Date.now();
  }

  setPath (path: Array<Point>, onDone: () => void) {
    if (this.state.get() === "building") {
      // if building mode, place a brick: don't set a path.
      return;
    }
    const cx = Math.floor(this.x / 32);
    const cy = Math.floor(this.y / 32);
    //if (path.length && cx === path[0].x && cy === path[1].y) {
      // console.log("same player pos. slice it.");
      //path = path.slice(1);
    //}

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

  shoot (e: any): boolean {
    const now = Date.now();
    if (now - this.lastShootTime < 800) {
      return false;
    }
    this.lastShootTime = now;
    const b = new Bullet(this.game, this.x + 16, this.y + 16, e);
    this.game.add.existing(b);
    return true;
  }

  startSwinging (e: Object) {
    this.swingingForAttack = true;
    const dir = e.x > this.x ? "left" : "right";
    this.direction.set(dir);
    this.doAnim(`attack_${dir}`, true);
  }

  stopSwinging () {
    this.swingingForAttack = false;
  }

  doAnim (anim: string, force?: boolean) {
    if (!anim) {
      this.animations.stop();
    }
    else {
      if (this.swingingForAttack && !force) { return; }
      this.animations.play(anim);
    }
  }

  switchTool (tool: Object) {
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

  handleClick(tool: Object, walk: () => void, place: (tile: number) => boolean) {
    const {inventory} = this;
    if (this.state.get() === "building") {
      if (!inventory.hasItem(tool.item)) {
        return;
      }
      const item = Items[tool.item];
      const block = Blocks[tool.item];

      if (item) {
        if (item.rideable) {
          console.log("rid me!");
          // TODO: create segway pickup at click pos.
          inventory.useItem(tool.item);
        }
        else if (item.placeable) {
          if (place(block.tile)) {
            inventory.useItem(tool.item);
          }
        }
        else {
          console.log("don't know how to use this item:", item);
        }
      }
      else if (block) {
        // NOTE: assuming an Item is the same as a Block for placeables.
        if (place(block.tile)) {
          inventory.useItem(tool.item);
        }
      }
      else {
        console.error("dunno what this tool is...", tool);
      }
    } else {
      walk();
    }
  }

  mineTile (block: Object, tile: Object, toolEfficiency: number, onDone: () => void) {
    const x1 = this.x / 32 | 0;
    const y1 = this.y / 32 | 0;
    const {x, y} = tile;
    if (y1 !== y) {
      this.direction.set(y1 < y ? "down" : "up");
    }
    else if (x1 !== x) {
      this.direction.set(x1 < x ? "right" : "left");
    }

    this.state.set("mining", {
      onMined: onDone,
      tile,
      toolEfficiency
    });

  }

  someoneClose () {
    if (this.swingingForAttack) {
      return;
    }
    const holding = this.inventory.holding();
    const damage = Items[holding.item].damage;
    if (damage && this.state.is("mining")) {
      this.stop();
    }
  }

  stop () {
    this.state.set("idle");
  }

  syncShadow () {
    this.shadow.x = this.x;
    this.shadow.y = this.y + 8;
  }

  update () {
    const {animations} = this;

    if (this.died.time) {
      animations.stop();
      this.shadow.visible = false;
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
    const isFirst = this.state.isFirst();
    if (isFirst || dir !== this.lastDir) {
      if (mode === "idle") {
        this.frame = 0;
        this.doAnim("");
      }
      if (mode === "walking") {
        //const walk = Math.random() < 0.2 ? "roll" : "walk";
        this.doAnim(`walk_${dir}`);
      }
      if (mode === "mining") {
        this.doAnim(`mine_${dir}`);
      }
      this.lastDir = dir;
    }

    this.syncShadow();
  }

  updateMining () {
    const {data} = this.state;
    const {toolEfficiency, onMined, tile} = data;

    const props = tile.properties;
    const {hardness, maxHardness} = props;
    if (!props.hit) {
      props.hit = true;
      // TODO: add this to a group. Also, tile should handle itself (not by player only).
      props.prog = this.game.add.sprite(tile.x * 32, tile.y * 32, "icons4x4");
      props.prog.frame = 3;
    }
    const prog = props.prog;
    const ratio = hardness / maxHardness;
    prog.scale.set(ratio * 2, 1);
    prog.x = tile.x * 32 + ((1 - ratio) * 16);
    // TODO: tool should have hardeness too (not just 1-use-after-block-mined)
    props.hardness -= (0.1 * toolEfficiency);

    if (props.hardness <= 0) {
      prog.destroy();
      onMined();
      this.state.set("idle");
    }
  }

  updateBuilding () {

  }

  updateExploring () {
    const {walkSpeed, pathWalker} = this;

    pathWalker.update((c: Point, lastPath: Point, isFirst: boolean) => {
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
      this.x += xx * 1; //(1 - (DayTime.percent * DayTime.percent));
      this.y += yy * 1; //(1 - (DayTime.percent * DayTime.percent));

      return Phaser.Math.distance(this.x, this.y, c.x * 32, c.y * 32) < walkSpeed;
    });

  }
}

export default Player;
