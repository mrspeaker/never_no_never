const Phaser = window.Phaser;

class Bullet extends Phaser.Sprite {

  constructor (game, x, y, target) {
    super(game, x, y, "icons");
    this.scale.setTo(0.3);
    this.anchor.setTo(0.5, 0.5);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.SPEED = 250; // missile speed pixels/second
    this.TURN_RATE = 11; // turn rate in degrees/frame
    this.WOBBLE_LIMIT = 15; // degrees
    this.WOBBLE_SPEED = 150; // milliseconds
    this.SMOKE_LIFETIME = 1000;
    this.wobble = this.WOBBLE_LIMIT;
    this.frame = 2;
    this.target = target;
    this.lastTargPos = {x: target.x, y: target.y};
    this.game.add.tween(this)
      .to(
          { wobble: -this.WOBBLE_LIMIT },
          this.WOBBLE_SPEED, Phaser.Easing.Sinusoidal.InOut, true, 0,
          Number.POSITIVE_INFINITY, true
      );


    const smoke = this.smoke = this.game.add.emitter(0, 0, 10);
    smoke.gravity = 0;
    smoke.setXSpeed(0, 0);
    smoke.setYSpeed(-80, -50);
    smoke.setAlpha(1, 0, this.SMOKE_LIFETIME, Phaser.Easing.Linear.InOut);
    smoke.makeParticles("icons4x4");
    smoke.start(false, this.SMOKE_LIFETIME, 80);
  }

  update () {
    const {game, x, y, target} = this;

    if (target.state && target.state.get() === "dying") {
      this.target = this.lastTargPos;
      return;
    }
    this.lastTargPos.x = target.x;
    this.lastTargPos.y = target.y;

    this.smoke.x = this.x;
    this.smoke.y = this.y;

    let targetAngle = game.math.angleBetween(
      x, y,
      target.x + 16, target.y + 16
    );
    targetAngle += this.game.math.degToRad(this.wobble);

    if (this.rotation !== targetAngle) {
      let delta = targetAngle - this.rotation;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      if (delta > 0) {
        this.angle += this.TURN_RATE;
      } else {
        this.angle -= this.TURN_RATE;
      }

      if (Math.abs(delta) < game.math.degToRad(this.TURN_RATE)) {
        this.rotation = targetAngle;
      }
    }

    this.body.velocity.x = Math.cos(this.rotation) * this.SPEED;
    this.body.velocity.y = Math.sin(this.rotation) * this.SPEED;

    if (Phaser.Math.distance(x, y, target.x + 16, target.y + 16) < 5) {
      setTimeout(() => {
        // FIXME: if reset game this will "particles of null..."
        this.smoke.destroy();
      }, 5000);
      this.destroy();
      game.camera.shake(0.01, 200);
      target.health && target.health.damage(2, this);
    }
  }

}

export default Bullet;
