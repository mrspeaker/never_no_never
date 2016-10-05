const Phaser = window.Phaser;

class Inventory extends Phaser.Group {

  constructor (game) {
    super(game);
    game.add.existing(this);

    const box = this.create(
      game.width / 2 - 144,
      game.height - 100, "inventory");
    box.fixedToCamera = true;
    this.box = box;

    this.items = [];
    this.selected = -1;

  }

  selectItem (idx) {
    this.selected = idx;

  }

  addItem (item) {

    // Move me eh.
    const items = {
      "wood": { name: "wood", frame: 0 },
      "coal": { name: "coal", frame: 1 },
      "stone": { name: "stone", frame: 2 }
    };

    const s = this.create(0, 0, "icons");
    s.fixedToCamera = true;
    s.frame = items[item].frame;

    console.log(items[item], s.frame);

    this.items.push({
      item: items[item],
      sprite: s,
      value: 1
    });

    s.cameraOffset.x = this.box.cameraOffset.x + (((this.items.length - 1) % 6) * 48) + 6;
    s.cameraOffset.y = this.box.cameraOffset.y + (((this.items.length - 1) / 6 | 0) * 48) + 8;
  }

}

export default Inventory;
