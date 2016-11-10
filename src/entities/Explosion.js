import Phaser from "phaser";

class Explosion extends Phaser.Sprite {

  constructor (game, x, y) {
    super(game, x, y, "peeps");
    this.animations.add("explode",
      [140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150],
      12);
    game.add.existing(this);
    this.animations.play("explode");
    this.upSpeed = Math.random() + 1;
    this.animations.currentAnim.onComplete.add(() => this.destroy(), this);
  }

  update () {
    this.y -= this.upSpeed;
  }
}

export default Explosion;
