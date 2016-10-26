const Phaser = window.Phaser;
import State from "../State";

class Segway extends Phaser.Sprite {

  rotFriction = 0.95;
  power = 120;
  drag = 100;
  maxVel = 150;
  turn = 0.07;

  constructor (game, x, y, controls) {
    super(game, x, y, "segway");

    this.frame = 0;
    this.anchor.setTo(0.5);
    game.add.existing(this);
    this.controls = controls;
    this.state = new State("stopped");

    game.physics.enable(this);
    this.body.drag.set(this.drag);
    this.body.maxVelocity.set(this.maxVel);
    //this.body.bounce.setTo(0.3);
    this.body.setSize(30, 20, 1, 28);

    const animSpeed = 10;
    this.animations.add("up", [3, 4, 5], animSpeed, true);
    this.animations.add("down", [0, 1, 2], animSpeed, true);
    this.animations.add("left", [13, 14, 15], animSpeed, true);
    this.animations.add("right", [10, 11, 12], animSpeed, true);
    this.animations.add("down_right", [20, 21, 22], animSpeed, true);
    this.animations.add("down_left", [23, 24, 25], animSpeed, true);
    this.animations.add("up_left", [30, 31, 32], animSpeed, true);
    this.animations.add("up_right", [33, 34, 35], animSpeed, true);

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
      var idx = (this._angle / 360) * 8 | 0;
      this.animations.play(["up", "up_right", "right", "down_right", "down", "down_left", "left", "up_left"][idx], animSpeed);

      if (vel < 0.1) {
        this.animations.stop();
      }
      controls.angle *= this.rotFriction;
      if (controls.isDown) {
        game.physics.arcade.accelerationFromRotation(
          game.math.degToRad(this._angle) - Math.PI / 2,
          this.power,
          body.acceleration);
        //this.body.drag.set(this.drag * 1.2);
        game.physics.arcade.velocityFromRotation(game.math.degToRad(this._angle) - Math.PI / 2, vel, body.velocity);
      } else {
        body.acceleration.set(0);
        this.body.drag.set(this.drag * 2.5);
      }

      break;
    }


  }

}

export default Segway;
