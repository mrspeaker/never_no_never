const Phaser = window.Phaser;
import Items from "./Items";

class Slot extends Phaser.Group {

  item = null;
  amount = 0;

  constructor (game) {
    super(game);

    const icon = this.create(0, 0, "icons");
    icon.fixedToCamera = true;
    icon.frame = Items.empty.icon;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ .,!?'\":-$                0123456789";
    const amount = game.add.retroFont("bmaxFont9", 9, 9, chars, 13, 0, 0, 0, 0);
    this.create(24, 24, amount).fixedToCamera = true;

    this.ui = {
      icon,
      amount
    };

  }

  updateUI () {
    const {item, amount, ui} = this;
    ui.icon.frame = !item ? Items.empty.icon : Items[item].icon;
    ui.amount.text = (amount < 2 ? "" : amount) + "";
  }

  setItem (item, amount = 1) {
    this.item = item;
    this.amount = amount;
    this.updateUI();
  }

  addItem (amount = 1) {
    this.amount += amount;
    if (this.amount <= 0) {
      this.item = null;
      this.amount = 0;
    }
    this.updateUI();
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
    box.inputEnabled = true;
    box.events.onInputDown.add(this.onClick, this);

    const selected = this.create(box.x, box.y, "inv-selection");
    selected.fixedToCamera = true;

    this.slots = Array
      .from(new Array(this.maxSlots), (_, i) => {
        var s = new Slot(game);
        s.x = box.x + ((i % this.slotsPerRow) * this.slotTileW) + 6;
        s.y = box.y + ((i / this.slotsPerRow | 0) * this.slotTileH) + 8;
        return s;
      })
      .map(s => this.add(s));

    const craft = this.create(4, box.y + 6, "icons");
    craft.fixedToCamera = true;
    craft.frame = 20;

    const pda = this.create(4, box.y + 48 + 6, "icons");
    pda.fixedToCamera = true;
    pda.frame = 22;

    this.ui = {
      box,
      selected
    };

    this.selectItem(-1);

  }

  onClick (box, click) {
    const x = (click.x - box.cameraOffset.x) / this.slotTileW | 0;
    const y = (click.y - box.cameraOffset.y) / this.slotTileH | 0;
    this.selectItem(y * this.slotsPerRow + x);
  }

  selectItem (idx) {
    if (this.selected === idx || idx < 0 || idx > this.maxSlots) {
      this.selected = -1;
      this.ui.selected.visible = false;
      return;
    }
    this.selected = idx;
    this.ui.selected.visible = true;
    this.ui.selected.cameraOffset.x = this.ui.box.cameraOffset.x + ((idx % this.slotsPerRow) * this.slotTileW) - 4;
    this.ui.selected.cameraOffset.y = this.ui.box.cameraOffset.y + ((idx / this.slotsPerRow | 0) * this.slotTileH);
  }

  holding () {
    if (this.selected < 0 || !(this.slots[this.selected].item)) {
      return {
        item: "empty",
        amount: 0
      };
    }
    return this.slots[this.selected];
  }

  addItem (item, amount = 1) {
    const firstMatch = this.slots.find(s => s.item === item);
    const firstEmpty = this.slots.find(s => s.item === null);

    if (firstMatch) {
      firstMatch.addItem(amount);
    }
    else if (firstEmpty) {
      firstEmpty.setItem(item, amount);
    }
    else {
      // No room!
    }

  }

  hasItem (item, amount = 1) {
    const match = this.slots.find(s => s.item === item);
    return match && match.amount >= amount;
  }

  useItem (item, amount) {
    const match = this.slots.find(s => s.item === item);
    if (match && match.amount >= amount) {
      match.addItem(-amount);
      return true;
    }
    return false;
  }

}

export default Inventory;
