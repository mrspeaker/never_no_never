const Phaser = window.Phaser;

class Car extends Phaser.Sprite {

  velX = 0;
  velY = 0;

  constructor (game, x, y) {
    super(game, x, y, "icons");
    this.frame = 25;
    this.anchor.setTo(0.5, 0.5);
    game.add.existing(this);
  }

  update () {
    if (this.running) {
      const speed = 3;
      this.velX = speed;
      this.velY = speed;
    }
    this.velX *= 0.95;
    this.velY *= 0.95;

    this.x += Math.cos(this.rotation - Math.PI / 2) * this.velX;
    this.y += Math.sin(this.rotation - Math.PI / 2) * this.velY;
  }

}

export default Car;
