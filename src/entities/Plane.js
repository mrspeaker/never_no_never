const Phaser = window.Phaser;
import State from "../State";

class Plane extends Phaser.Sprite {

  alt = 0;
  rotFriction = 0.95;
  turn = 0.045;

  constructor (game, x, y, controls) {
    super(game, x, y, "mediums");

    this.frame = 0;
    this.anchor.setTo(0.5, 0.5);
    game.add.existing(this);
    this.controls = controls;
    this.state = new State("stopped");
    game.physics.enable(this);

    this.body.drag.set(30);
    this.body.maxVelocity.set(120);

    const shadow = game.add.sprite(0, 0, "mediums");
    this.addChild(shadow);

    shadow.frame = 0;
    shadow.scale.set(0.6);
    shadow.tint = 0x000000;
    shadow.alpha = 0.4;

    this.shadow = shadow;
  }

  get onTheGround () {
    return this.state.is("taxiing", "stopped", "touchdown");
  }

  update () {
    const {controls, body, game} = this;

    let vel = body.velocity.getMagnitude();

    switch (this.state.get()) {
    case "stopped":
      if (controls.justPressed) {
        this.state.set("taxiing");
      }
      this.shadow.visible = false;
      break;

    case "taxiing":
      if (vel > 100) {
        this.state.set("flying");
        this.alt = 0.8;
        controls.pitch = 0;
        break;
      }
      this.angle -= this.controls.angle * this.turn;
      controls.angle *= this.rotFriction;
      if (controls.isDown) {
        game.physics.arcade.accelerationFromRotation(this.rotation - Math.PI / 2, 50, body.acceleration);
      } else {
        body.acceleration.set(0);
      }
      game.physics.arcade.velocityFromRotation(this.rotation - Math.PI / 2, vel, body.velocity);

      break;

    case "flying":
      this.angle -= controls.angle * this.turn;
      controls.angle *= this.rotFriction;
      this.shadow.visible = true;

      game.physics.arcade.velocityFromRotation(this.rotation - Math.PI / 2, 160, body.velocity);

      if (Math.abs(controls.pitch) > 50) {
        this.alt += controls.pitch * 0.0002;
        this.alt = Math.min(1, Math.max(0, this.alt));
        if (this.alt === 0) {
          this.state.set("touchdown");
        }
      }

      this.scale.set(1 + this.alt / 2);
      break;

    case "touchdown":
      body.acceleration.set(0);
      this.angle += this.controls.angle * this.turn;
      controls.angle *= this.rotFriction;
      this.shadow.visible = false;

      game.physics.arcade.velocityFromRotation(this.rotation - Math.PI / 2, vel, body.velocity);

      if (vel < 0.1) {
        this.state.set("stopped");
      }
      break;

    }

    this.shadow.x = Math.cos(-this.rotation) * this.alt;
    this.shadow.y = Math.sin(-this.rotation) * this.alt;

  }

}

export default Plane;
