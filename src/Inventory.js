const Phaser = window.Phaser;
import Items from "./Items";
import Title from "./Title";

class Slot extends Phaser.Group {

  item = null;
  amount = 0;

  constructor (game, idx) {
    super(game);
    this.idx = idx;

    const icon = this.create(0, 0, "icons");
    icon.fixedToCamera = true;
    icon.frame = Items.empty.icon;

    const {img, font} = Title(game, "", 9, 24, 24, true);
    this.add(img);

    this.ui = {
      icon,
      amount: font
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
    return this;
  }

  addItem (amount = 1) {
    this.amount += amount;
    if (this.amount <= 0) {
      this.item = null;
      this.amount = 0;
    }
    this.updateUI();
    return this;
  }

  is (prop) {
    return this.item && Items[this.item][prop];
  }

  serialize () {
    return {
      item: this.item,
      amount: this.amount
    };
  }

  deserialize ({item, amount}) {
    this.setItem(item, amount);
  }

}

class Inventory extends Phaser.Group {

  maxSlots = 12;
  slotsPerRow = 6;
  slotTileW = 48;
  slotTileH = 48;

  stabby = null;
  shooty = null;
  diggy = null;

  xo = 40;
  yo = 28;

  constructor (game, onItemSwitch) {
    super(game);
    game.add.existing(this);

    this.onItemSwitch = onItemSwitch;

    this.emptySlot = new Slot(game, -1);
    this.emptySlot.item = "empty";

    const box = this.create(
      0,
      game.height - 122, "inventory");
    box.fixedToCamera = true;
    box.inputEnabled = true;
    box.events.onInputDown.add(this.onClick, this);

    const selected = this.create(box.x, box.y, "inv-selection");
    selected.fixedToCamera = true;

    this.slots = Array
      .from(new Array(this.maxSlots), (_, i) => {
        var s = new Slot(game, i);
        s.x = box.x + this.xo + ((i % this.slotsPerRow) * this.slotTileW) + 6;
        s.y = box.y + this.yo + ((i / this.slotsPerRow | 0) * this.slotTileH) + 8;
        return s;
      })
      .map(s => this.add(s));

    const pda = this.pda = this.create(game.width - 64, 30, "icons");
    pda.fixedToCamera = true;
    pda.frame = 22;

    this.ui = {
      box,
      selected
    };

    this.selectItem(-1);

  }

  autoStab () {
    if (this.holding().is("damage")) {
      return false;
    }

    if (this.stabby) {
      this.selectItem(this.stabby.idx);
      return true;
    }
    return false;
  }

  autoDig () {
    if (this.holding().is("efficiency")) {
      return false;
    }

    if (this.diggy) {
      this.selectItem(this.diggy.idx);
      return true;
    }
    return false;
  }

  onClick (box, click) {
    const x = (click.x - box.cameraOffset.x - this.xo) / this.slotTileW | 0;
    const y = (click.y - box.cameraOffset.y - this.yo) / this.slotTileH | 0;
    this.selectItem(y * this.slotsPerRow + x);
  }

  selectItem (idx, dontDeselect) {
    const deselect = this.selected === idx;
    if (dontDeselect && deselect) {
      return this.selected;
    }

    if (deselect || idx < 0 || idx > this.maxSlots) {
      this.selected = -1;
      this.ui.selected.visible = false;
      return this.onItemSwitch(this.emptySlot);
    }

    this.selected = idx;
    this.ui.selected.visible = true;
    this.ui.selected.cameraOffset.x = this.ui.box.cameraOffset.x + this.xo + ((idx % this.slotsPerRow) * this.slotTileW) - 4;
    this.ui.selected.cameraOffset.y = this.ui.box.cameraOffset.y + this.yo + ((idx / this.slotsPerRow | 0) * this.slotTileH);

    this.onItemSwitch(this.holding());
  }

  projectiles () {
    const proj = this.slots.filter(s => s.is("fireable"));
    return proj && proj[0];
  }

  holding () {
    if (this.selected < 0 || !(this.slots[this.selected].item)) {
      return this.emptySlot;
    }
    return this.slots[this.selected];
  }

  addItem (item, amount = 1) {
    const firstMatch = this.slots.find(s => s.item === item);
    const firstEmpty = this.slots.find(s => s.item === null);

    let slot = null;
    if (firstMatch) {
      slot = firstMatch.addItem(amount);
    }
    else if (firstEmpty) {
      slot = firstEmpty.setItem(item, amount);
    }
    else {
      // No room!
    }

    if (slot) {
      // Auto-select item
      const i = Items[item];
      if (i.fireable && !this.shooty) this.shooty = slot;
      if (i.damage && !this.stabby) this.stabby = slot;
      if (i.efficiency && !this.diggy) this.diggy = slot;
    }

    return slot;
  }

  hasItem (item, amount = 1) {
    const match = this.slots.find(s => s.item === item);
    return match && match.amount >= amount;
  }

  count (item) {
    const match = this.slots.find(s => s.item === item);
    return match ? match.amount : 0;
  }

  useItem (item, amount = 1) {
    const match = this.slots.find(s => s.item === item);
    if (match && match.amount >= amount) {
      match.addItem(-amount);
      if (match.amount === 0) {
        // De-autoselect itme
        if (this.stabby && match.idx === this.stabby.idx) this.stabby = null;
        if (this.shooty && match.idx === this.shooty.idx) this.shooty = null;
        if (this.diggy && match.idx === this.diggy.idx) this.diggy = null;
      }
      return true;
    }
    return false;
  }

  serialize () {
    return {
      slots: this.slots.map(s => s.serialize()),
      selected: this.selected
    };
  }
  deserialize (inv) {
    inv.slots && inv.slots.forEach((s, i) => {
      this.slots[i].deserialize(s);
    });
    if (inv.selected && inv.selected > -1) {
      this.selectItem(inv.selected);
    }
  }

}

export default Inventory;
