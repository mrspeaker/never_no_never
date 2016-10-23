const Phaser = window.Phaser;
import State from "../State";

class Segway extends Phaser.Sprite {

  alt = 0;
  rotFriction = 0.95;
  turn = 0.045;

  constructor (game, x, y, controls) {
    super(game, x, y, "segway");

    this.frame = 0;
    this.anchor.setTo(0.5);
    game.add.existing(this);
    this.controls = controls;
    this.state = new State("stopped");
    game.physics.enable(this);

    this.body.drag.set(90);
    this.body.maxVelocity.set(120);
    //this.body.bounce.setTo(0.3);

    //const shadow = game.add.sprite(0, 0, "segway");
    //this.addChild(shadow);

    //shadow.anchor.setTo(0.5);

    //  This adjusts the collision body size to be a 100x50 box.
//  50, 25 is the X and Y offset of the newly sized box.

    this.body.setSize(30, 20, 1, 28);

    //shadow.frame = 1;
    this._angle = 0;
    //shadow.scale.set(0.6);
    //shadow.tint = 0x000000;
    //shadow.alpha = 0.4;

    //this.shadow = shadow;
  }

  get onTheGround () {
    return true;
  }

  update () {
    const {controls, body, game} = this;

    let vel = body.velocity.getMagnitude();

    switch (this.state.get()) {
    case "stopped":
      if (controls.justPressed) {
        this.state.set("taxiing");
      }
      // this.shadow.visible = false;
      break;

    case "taxiing":
      this._angle -= this.controls.angle * this.turn;
      this._angle = (this._angle + 360) % 360;


      if (this._angle > 325 || this._angle < 45) {
        this.frame = 3;
      }
      else if (this._angle < 135) {
        this.frame = 10;
      }
      else if (this._angle < 225){
        this.frame = 0;
      }
      else {
        this.frame = 13;
      }
      controls.angle *= this.rotFriction;
      if (controls.isDown) {
        game.physics.arcade.accelerationFromRotation(game.math.degToRad(this._angle) - Math.PI / 2, 150, body.acceleration);
      } else {
        body.acceleration.set(0);
      }
      game.physics.arcade.velocityFromRotation(game.math.degToRad(this._angle) - Math.PI / 2, vel, body.velocity);

      break;
    }

    // this.shadow.x = Math.cos(-this.rotation) * this.alt;
    // this.shadow.y = Math.sin(-this.rotation) * this.alt;

  }

}

export default Segway;
