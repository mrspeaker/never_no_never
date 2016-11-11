// @flow
import {Game} from "phaser";

class Controls {

  isDown: boolean = false;
  justPressed: boolean = false;
  lastX: number = 0;
  lastY: number = 0;

  _angle: number = 0;
  _pitch: number = 0;

  attack: number = 0;
  sustain: number = 0;
  decay: number = 0;

  game: Game;

  pointer: Object;

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
      this.isDown = false;
      this._angle = 0;
      this._pitch = 0;
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
