class Controls {

  isDown = false;
  justPressed = false;

  constructor (game) {
    this.game = game;
    this.pointer = game.input.activePointer;
  }

  update () {
    const {pointer} = this;
    if (pointer.isDown && !this.isDown) {
      this.isDown = true;
      this.justPressed = true;
    }
    else if (pointer.isDown) {
      this.justPressed = false;
    }
    else {
      this.isDown = false;
    }
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
