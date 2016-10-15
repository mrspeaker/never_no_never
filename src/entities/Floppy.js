const Phaser = window.Phaser;

class Floppy extends Phaser.Sprite {

  constructor (game, x, y) {
    super(game, x, y, "icons");
    this.frame = 24;
    game.add.existing(this);
  }

  update () {
    this.y += Math.sin(Date.now() / 100) * 0.1;
  }

}

export default Floppy;
