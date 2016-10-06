const Phaser = window.Phaser;
import Blocks from "./Blocks";

class Slot extends Phaser.Group {

  block = null;
  amount = 0;

  constructor (game) {
    super(game);

    const icon = this.icon = this.create(0, 0, "icons");
    icon.fixedToCamera = true;
    icon.frame = 0;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ .,!?'\"$                  0123456789";
    const amountUI = this.amountUI = game.add.retroFont("bmaxFont9", 9, 9, chars, 13, 0, 0, 0, 0);
    amountUI.text = "";
    const img = this.create(24, 24, amountUI);
    img.fixedToCamera = true;
  }

  setBlock (block, amount = 1) {
    this.block = block;
    this.icon.frame = Blocks[block].icon;
    this.amount = amount;
    this.amountUI.text = amount + "";
  }

  addItem (amount = 1) {
    this.amount += amount;
    if (this.amount <= 0) {
      this.block = null;
      this.icon.frame = Blocks.empty.icon;
      this.amountUI.text = "";
      return;
    }
    this.amountUI.text = this.amount + "";
  }

}

class Inventory extends Phaser.Group {

  maxSlots = 12;
  slotsPerRow = 6;
  slotTileW = 48;
  slotTileH = 48;

  constructor (game) {
    super(game);
    game.add.existing(this);

    const box = this.create(
      game.width / 2 - 144,
      game.height - 100, "inventory");
    box.fixedToCamera = true;
    this.box = box;
    box.inputEnabled = true;
    box.events.onInputDown.add(this.onClick, this);

    this.slots = Array
      .from(new Array(this.maxSlots), (_, i) => {
        var s = new Slot(game);
        s.x = this.box.x + ((i % this.slotsPerRow) * this.slotTileW) + 6;
        s.y = this.box.y + ((i / this.slotsPerRow | 0) * this.slotTileH) + 8;
        return s;
      })
      .map(s => this.add(s));

    this.selectedUI = this.create(
      this.box.x,
      this.box.y,
      "inv-selection"
    );
    this.selectedUI.fixedToCamera = true;
    this.selectItem(-1);

  }

  onClick (box, click) {
    const x = (click.x - box.cameraOffset.x) / this.slotTileW | 0;
    const y = (click.y - box.cameraOffset.y) / this.slotTileH | 0;
    this.selectItem(y * this.slotsPerRow + x);
  }

  selectItem (idx) {
    if (this.selected === idx || idx < 0 || idx > this.maxSlots) {
      // hide
      this.selected = -1;
      this.selectedUI.visible = false;
      return;
    }
    this.selected = idx;
    this.selectedUI.visible = true;
    this.selectedUI.cameraOffset.x = this.box.cameraOffset.x + ((idx % this.slotsPerRow) * this.slotTileW);
    this.selectedUI.cameraOffset.y = this.box.cameraOffset.y + ((idx / this.slotsPerRow | 0) * this.slotTileH);
  }

  addItem (item) {
    const firstMatch = this.slots.find(s => s.block === item);
    const firstEmpty = this.slots.find(s => s.block === null);

    if (firstMatch) {
      firstMatch.addItem(1);
    }
    else if (firstEmpty) {
      firstEmpty.setBlock(item, 1);
    }
    else {
      // No room!
    }

  }

}

export default Inventory;
