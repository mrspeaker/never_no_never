const Phaser = window.Phaser;
import State from "../State";

class Plane extends Phaser.Sprite {

  velX = 0;
  velY = 0;
  acc = 0;
  alt = 0;

  turn = 0.045;
  rotFriction = 0.92;
  accAmount = 0.02;
  decAmount = 0.04;
  topFlyingSpeed = 3;

  constructor (game, x, y, controls) {
    super(game, x, y, "icons");
    this.frame = 25;
    this.anchor.setTo(0.5, 0.5);
    game.add.existing(this);
    this.controls = controls;
    this.state = new State("stopped");
  }

  update () {
    const {controls} = this;
    let speed = 0;

    switch (this.state.get()) {
    case "stopped":
      if (controls.justPressed) {
        this.state.set("taxiing");
      }
      break;

    case "taxiing":
      this.acc += controls.isDown ? this.accAmount : -this.decAmount;
      this.acc = Math.min(this.topFlyingSpeed, Math.max(0, this.acc));
      if (this.acc === this.topFlyingSpeed) {
        this.state.set("flying");
        this.alt = 0.8;
        controls.pitch = 0;
        break;
      }
      if (this.acc === 0) {
        this.state.set("stopped");
        this.alt = 0;
        break;
      }
      this.angle += this.controls.angle * this.turn;
      controls.angle *= this.rotFriction;
      speed = this.acc;
      break;

    case "flying":
      this.angle += this.controls.angle * this.turn;
      controls.angle *= this.rotFriction;
      if (Math.abs(controls.pitch) > 40) {
        this.alt += controls.pitch * 0.0002;
        this.alt = Math.min(1, Math.max(0, this.alt));
        if (this.alt === 0) {
          this.state.set("touchdown");
          //this.acc = 1;
        }
      }
      this.scale.set(1 + this.alt);
      speed = this.topFlyingSpeed * Math.max(0.4, this.alt);
      break;

    case "touchdown":
      this.angle += this.controls.angle * this.turn;
      controls.angle *= this.rotFriction;

      this.acc -= this.decAmount;
      this.acc = Math.max(0, this.acc);
      speed = this.acc;

      if (this.velX < 0.0001 && this.velY < 0.0001 ) {
        this.state.set("stopped");
      }
      break;


    }

    this.velX = speed;
    this.velY = speed;

    this.velX *= 0.95;
    this.velY *= 0.95;

    this.x += Math.cos(this.rotation - Math.PI / 2) * this.velX;
    this.y += Math.sin(this.rotation - Math.PI / 2) * this.velY;
  }

}

export default Plane;
