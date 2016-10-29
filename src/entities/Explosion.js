const Phaser = window.Phaser;

class Explosion extends Phaser.Sprite {

  constructor (game, x, y) {
    super(game, x, y, "peeps");
    this.animations.add("explode", [140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150], 15);
    game.add.existing(this);
    this.animations.play("explode");
    this.animations.currentAnim.onComplete.add(() => this.destroy(), this);
  }
}

export default Explosion;
