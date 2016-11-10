import Phaser from "phaser";

class Particle extends Phaser.Sprite {
  constructor (game, x, y, col, sheet = "icons", scale = 0.3) {
    super(game, x, y, sheet);
    this.frame = col;
    this.scale.set(scale);
    this.life = 0;
    this.visible = false;
  }

  activate (frame) {
    this.frame = frame;
    this.x = Math.random() * 8 - 4;
    this.y = Math.random() * 8 - 4;
    this.velY = Math.random() * 0.5 + -1.5;
    this.velX = Math.random() * 1 - 0.5;
    this.life = Math.random() * 200 + 500 | 0;
    this.visible = true;
  }

  update () {
    this.life -= this.game.time.elapsedMS;
    if (this.life < 0) {
      if (this.visible) this.visible = false;
      return;
    }
    this.x += this.velX;
    this.y += this.velY;
    this.velY += 0.08;
  }
}

class Particles extends Phaser.Sprite {

  lastParticle = Date.now();
  emitting = true;
  emitRate = 200;
  tile = 1;

  constructor (game, x, y, tile, sheet, scale) {
    super(game, x, y);
    this.tile = tile;
    game.add.existing(this);

    this.particles = Array
      .from(new Array(15), () => new Particle(game, 0, 0, tile, sheet, scale))
      .map(p => this.addChild(p));
  }

  update () {
    if (this.emitting && Date.now() - this.lastParticle > this.emitRate) {
      const next = this.particles.find(p => p.life < 0);
      next && next.activate(this.tile);
      this.lastParticle = Date.now();
    }
    this.particles.forEach(p => p.update());
  }

}

export default Particles;
