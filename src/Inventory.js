const Phaser = window.Phaser;
import Blocks from "./Blocks";

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
    // TODO: add gfx for selected

  }

  selectItem (idx) {
    this.selected = idx;
    // TODO: move gfx for selected
  }

  addItem (item) {
    const s = this.create(0, 0, "icons");
    s.fixedToCamera = true;
    s.frame = Blocks[item].frame;

    this.items.push({
      item: Blocks[item],
      sprite: s,
      value: 1
    });

    s.cameraOffset.x = this.box.cameraOffset.x + (((this.items.length - 1) % 6) * 48) + 6;
    s.cameraOffset.y = this.box.cameraOffset.y + (((this.items.length - 1) / 6 | 0) * 48) + 8;
  }

}

export default Inventory;
