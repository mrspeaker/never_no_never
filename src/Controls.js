class Controls {

  isDown = false;
  justPressed = false;
  lastX = 0;
  lastY = 0;

  _angle = 0;
  _pitch = 0;

  attack = 0;
  sustain = 0;
  decay = 0;

  constructor (game) {
    this.game = game;
    this.setActive();
    // "activePointer" seems to change on mobile
    setTimeout(() => {
      this.setActive();
    }, 2000);
  }

  get angle () {
    return this._angle;
  }
  set angle (v) {
    this._angle = v;
  }
  get pitch () {
    return this._pitch;
  }
  set pitch (v) {
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

  get x () {
    return this.pointer.x;
  }

  get y () {
    return this.pointer.y;
  }

  get worldX () {
    return this.pointer.worldX;
  }

  get worldY () {
    return this.pointer.worldY;
  }

}

export default Controls;
