import Phaser from "phaser";

class Car extends Phaser.Sprite {

  velX = 0;
  velY = 0;

  constructor (game, x, y, controls) {
    super(game, x, y, "icons");
    this.frame = 25;
    this.anchor.setTo(0.5, 0.5);
    game.add.existing(this);
    this.controls = controls;
  }

  update () {

    this.angle += this.controls.angle * 0.06;
    this.controls.angle *= 0.92;

    if (this.controls.isDown) {
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
