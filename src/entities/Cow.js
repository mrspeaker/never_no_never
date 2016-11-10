import Phaser from "phaser";

import Health from "../components/Health";
import State from "../State";
import Tween from "../Tween";
import Particles from "../Particles";

class Cow extends Phaser.Sprite {

  walkSpeed = 1.5;

  constructor (game, xtile, ytile, bmax) {
    super(game, xtile * 32, ytile * 32, "peeps");

    this.bmax = bmax;
    this.state = new State("idle");

    this.shadow = game.add.sprite(this.x, this.y + 8, "peeps");
    this.shadow.frame = 40;

    this.bloods = new Particles(game, this.x, this.y, 0, "icons4x4", 1);
    this.bloods.emitting = false;

    const walkSpeed = 5;
    this.animations.add("idle", [160], walkSpeed, true);
    this.animations.add("walk_right", [160, 161], walkSpeed, true);
    this.animations.add("walk_left", [162, 163], walkSpeed, true);
    this.animations.add("walk_up", [160, 161], walkSpeed, true);
    this.animations.add("walk_down", [162, 163], walkSpeed, true);

    this.animations.play("walk_right");

    this.health = new Health(3, 3, 160);
    this.health.onHurt = this.onHurt.bind(this);
    this.health.onDie = this.onDie.bind(this);

    this.direction = new State("right");

    this.offset = Math.random() * 1000;

  }

  onHurt (h, max, by) {
    this.hurtPause = 50;
    let angle = by.angle - Math.PI / 2 || this.game.math.angleBetween(
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
    const {bmax} = this;
    const corpse = bmax.perma.create(this.x, this.y, "peeps");
    bmax.inventory.addItem("steak", 1);
    corpse.frame = 164;
  }

  update () {
    const {animations} = this;
    const current = this.state.get();
    const first = this.state.isFirst();
    switch (current) {

    case "idle":
      if (first) {
        animations.play("idle");
      }
      this.state.set("walking");
      break;

    case "walking": {
      const d = this.lastDir;
      const xo = Math.sign(Math.sin((Date.now() + this.offset) / 1000)) * 0.2;
      this.x += xo;
      this.lastDir = xo;
      if (d !== xo) {
        animations.play("walk_" + (xo > 0 ? "right" : "left"));
      }
      break;
    }

    case "dying":
      if (this.state.isFirst()) {
        this.dead();
      }
      break;
    }

    this.shadow.x = this.x;
    this.shadow.y = this.y + 8;
  }

  updateWalking () {

  }
}

export default Cow;
