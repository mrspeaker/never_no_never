// @flow
import {Sprite, Game} from "phaser";

class Particle extends Sprite {
  life: number;
  velX: number;
  velY: number;

  constructor (game: Game, x: number, y: number, col: number = 0, sheet: ?string = "icons", scale: ?number = 0.3) {
    super(game, x, y, sheet);
    this.frame = col;
    this.scale.set(scale);
    this.life = 0;
    this.visible = false;
  }

  activate (frame: number) {
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

class Particles extends Sprite {
  lastParticle = Date.now();
  emitting = true;
  emitRate = 200;
  tile = 1;

  particles: Array<Particle>;

  constructor (game: Game, x: number, y: number, tile: number, sheet: ?string, scale: ?number) {
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
