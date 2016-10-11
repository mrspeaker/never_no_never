const Phaser = window.Phaser;
import State from "../State";
import Health from "../components/Health";
import PathWalker from "../components/PathWalker";
import Items from "../Items";

class Player extends Phaser.Sprite {

  walkSpeed = 3;
  hp = 0;
  armour = 0;
  maxArmour = 3;

  constructor (game, xtile, ytile, onHurt, onDie) {
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

    this.health = new Health(3, 5);
    this.health.onHurt = (...args) => {
      this.onHurt(game);
      onHurt(...args);
    };
    this.health.onDie = onDie;
    this.pathWalker = new PathWalker();
  }

  onHurt (game) {
    game.add.tween(this).to(
      {alpha: 0},
      100,
      Phaser.Easing.Linear.None,
      true,
      0,
      2,
      true);
  }

  setPath (path, onDone) {
    if (this.state.get() === "building") {
      console.log("nope, building");
      // Set end of path to thingl.
      return;
    }
    this.pathWalker.setPath(path.slice(1), () => {
      this.x = Math.round(this.x / 32) * 32;
      this.y = Math.round(this.y / 32) * 32;
      onDone();
    });
    this.state.set("walking");
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

  handleClick(walk, place) {
    if (this.state.get() === "building") {
      place();
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

  updateBuilding () {

  }

  updateExploring () {
    const {walkSpeed, pathWalker} = this;

    pathWalker.update((c, lastPath) => {
      if (lastPath) {
        if (c.y !== lastPath.y) {
          this.direction.set(c.y < lastPath.y ? "up" : "down");
        }
        else if (c.x !== lastPath.x) {
          this.direction.set(c.x < lastPath.x ? "left" : "right");
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

      return Phaser.Math.distance(this.x, this.y, c.x * 32, c.y * 32) < walkSpeed;
    });

  }
}

export default Player;
