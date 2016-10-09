class Controls {

  isDown = false;
  justPressed = false;

  constructor (game) {
    this.game = game;
    this.setActive();
    // "activePointer" seems to change on mobile
    setTimeout(() => {
      this.setActive();
    }, 2000);
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
