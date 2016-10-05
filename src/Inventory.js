const Phaser = window.Phaser;

class Inventory extends Phaser.Group {

  constructor (game) {
    super(game);
    game.add.existing(this);

    const box = this.create(game.width / 2 - 144, game.height - 100, "inventory");
    box.fixedToCamera = true;
    this.box = box;

    this.items = [];

  }

  addItem (item) {

    const s = this.create(0, 0, "icons");
    s.fixedToCamera = true;
    s.frame = item === "wood" ? 0 : 1;

    this.items.push({
      item: item,
      sprite: s,
      value: 1
    });

    s.cameraOffset.x = this.box.cameraOffset.x + (((this.items.length - 1) % 6) * 48) + 4;
    s.cameraOffset.y = this.box.cameraOffset.y + (((this.items.length - 1) / 6 | 0) * 48) + 8;

//    s.cameraOffset.y =
    //s.x = this.box.x + 100;// this.box.x + (this.items.length * 12) + 6;
    //s.y = this.box.y; //this.box.y + 8;

  }

}

export default Inventory;
