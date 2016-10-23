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
    this.body.setSize(30, 20, 1, 28);

    const animSpeed = 10;
    this.animations.add("up", [3, 4, 5], animSpeed, true);
    this.animations.add("down", [0, 1, 2], animSpeed, true);
    this.animations.add("left", [13, 14, 15], animSpeed, true);
    this.animations.add("right", [10, 11, 12], animSpeed, true);

    this._angle = 0;
  }

  get onTheGround () {
    return true;
  }

  update () {
    const {controls, body, game} = this;

    let vel = body.velocity.getMagnitude();
    let animSpeed;

    switch (this.state.get()) {
    case "stopped":
      if (controls.justPressed) {
        this.state.set("cruising");
      }
      break;

    case "cruising":
      this._angle -= this.controls.angle * this.turn;
      this._angle = (this._angle + 360) % 360;

      animSpeed = 15;
      if (this._angle > 325 || this._angle < 45) {
        this.animations.play("up", animSpeed);
      }
      else if (this._angle < 135) {
        this.animations.play("right", animSpeed);
      }
      else if (this._angle < 225){
        this.animations.play("down", animSpeed);
      }
      else {
        this.frame = this.animations.play("left", animSpeed);
      }
      if (vel < 0.1) {
        this.animations.stop();
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


  }

}

export default Segway;
