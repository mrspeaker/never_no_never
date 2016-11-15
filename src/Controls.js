// @flow
import {Game, Group} from "phaser";

class Controls {

  isDown: boolean = false;
  justPressed: boolean = false;
  justReleased: boolean = false;
  lastX: number = 0;
  lastY: number = 0;

  _angle: number = 0;
  _pitch: number = 0;

  swipe: {
    angle: number;
    power: number;
    dt: Array<{x: number, y: number}>;
  }

  attack: number = 0;
  sustain: number = 0;
  decay: number = 0;

  game: Game;
  touchMarks: Group;
  touchIdx: number = -1;

  pointer: {
    x: number;
    y: number;
    worldX: number;
    worldY: number;
  };

  constructor (game: Game) {
    this.game = game;
    this.setActive();
    // "activePointer" seems to change on mobile
    setTimeout(() => {
      this.setActive();
    }, 2000);
  }

  get angle (): number {
    return this._angle;
  }
  set angle (v: number) {
    this._angle = v;
  }
  get pitch (): number {
    return this._pitch;
  }
  set pitch (v: number) {
    this._pitch = v;
  }

  setActive () {
    this.pointer = this.game.input.activePointer;
  }

  addTouchMarks (game: Game) {
    this.touchMarks = game.add.group();
    Array.from(new Array(30), () => {
      const s = this.touchMarks.add(game.add.sprite(-1, -1, "icons4x4"));
      s.fixedToCamera = true;
      s.frame = 1;
      s.alpha = 0.5;
      return s;
    });
  }

  calculatePowerAndAngle (): {power: number, angle: number, dt: Array<{x: number, y: number}>} {
    let i = 0;
    let ts = [];
    this.touchMarks.forEach(({x, y}) => {
      if (i++ < this.touchIdx) ts.push({x, y});
    });
    if (ts.length < 2) {
      return {
        power: 0,
        angle: 0,
        dt: []
      };
    }

    const head = ts[0];
    const last = ts[ts.length - 1];
    const dx = Math.abs(last.x - head.x);
    const dy = Math.abs(last.y - head.y);
    const off = ts.map(({x, y}) => {
      return {
        x: dx === 0 ? 0 : (x - head.x) / dx,
        y: dy === 0 ? 0 : (y - head.y) / dy
      }
    }).filter(m => m.x !== 0 || m.y !== 0);
    if (!off.length) {
      return {
        power: 0,
        angle: 0,
        dt: []
      };
    }
    const power = this.game.math.distance(head.x, head.y, last.x, last.y) / off.length;
    // TODO: least squares fit
    //console.log(power.toFixed(2), off.map(({x, y}) => x.toFixed(2) + ":" + y.toFixed(2)).join(', '));

    return {
      power,
      angle: this.game.math.angleBetween(head.x, head.y, last.x, last.y),
      dt: off
    }
  }

  update () {
    const pointer = this.game.input.activePointer;
    if (!pointer) {
      return;
    }
    if (pointer.isDown && !this.isDown) {
      this.isDown = true;
      this.justPressed = true;
      this._angle = 0;
      this._pitch = 0;
    }
    else if (pointer.isDown) {
      this.justPressed = false;
      this._angle += pointer.x - this.lastX;
      this._pitch += pointer.y - this.lastY;
    }
    else {
      this.justReleased = this.isDown;
      this.isDown = false;
      this._angle = 0;
      this._pitch = 0;
    }

    if (this.touchMarks) {
      if (this.isDown) {
        if (this.justPressed) {
          this.touchIdx = -1;
          this.touchMarks.forEach(m => {
            m.cameraOffset.x = -1;
            m.cameraOffset.y = -1;
          });
        }
        this.touchIdx = (this.touchIdx + 1) % this.touchMarks.children.length;
        const x = this.touchMarks.children[this.touchIdx];
        x.cameraOffset.x = pointer.x;
        x.cameraOffset.y = pointer.y;
      }
      else if (this.justReleased) {
        this.swipe = this.calculatePowerAndAngle();
      }
    }

    this.lastX = pointer.x;
    this.lastY = pointer.y;
  }

  get x (): number {
    return this.pointer.x;
  }

  get y (): number {
    return this.pointer.y;
  }

  get worldX (): number {
    return this.pointer.worldX;
  }

  get worldY (): number {
    return this.pointer.worldY;
  }

}

export default Controls;
