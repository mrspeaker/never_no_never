//@flow

import Phaser, {Game, Group, Sprite, RetroFont} from "phaser";
import Items from "./Items";
import Title from "./Title";

class Slot extends Group {

  idx: number;
  item: ?string = null;
  amount: number = 0;
  ui: { icon: Sprite, amount: RetroFont};

  constructor (game: Game, idx: number) {
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

  setItem (item: string, amount: number = 1): this {
    this.item = item;
    this.amount = amount;
    this.updateUI();
    return this;
  }

  addItem (amount: number = 1): this {
    this.amount += amount;
    if (this.amount <= 0) {
      this.item = null;
      this.amount = 0;
    }
    this.updateUI();
    return this;
  }

  is (prop: string) {
    return this.item && Items[this.item][prop];
  }

  serialize () {
    return {
      item: this.item,
      amount: this.amount
    };
  }

  deserialize ({item, amount}: {item: ?string, amount: number}) {
    item && this.setItem(item, amount);
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

  slots: Array<Slot>;
  emptySlot: Slot;
  onItemSwitch: (item: any) => void;
  miniPDA: Sprite;
  pda: Sprite;
  selected: number;
  ui: {
    box: Sprite,
    selected: Sprite
  };

  constructor (game: Game, onItemSwitch: (item: any) => void = () => {}) {
    super(game);
    game.add.existing(this);

    this.onItemSwitch = onItemSwitch;

    this.emptySlot = new Slot(game, -1);
    this.emptySlot.item = "empty";

    const box = this.miniPDA = this.create(
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

  autoStab (): boolean {
    if (this.holding().is("damage")) {
      return false;
    }

    if (this.stabby) {
      this.selectItem(this.stabby.idx);
      return true;
    }
    return false;
  }

  autoDig (): boolean {
    if (this.holding().is("efficiency")) {
      return false;
    }

    if (this.diggy) {
      this.selectItem(this.diggy.idx);
      return true;
    }
    return false;
  }

  onClick (box: Sprite, click: {x: number, y: number}) {
    const x = (click.x - box.cameraOffset.x - this.xo) / this.slotTileW | 0;
    const y = (click.y - box.cameraOffset.y - this.yo) / this.slotTileH | 0;
    this.selectItem(y * this.slotsPerRow + x);
  }

  selectItem (idx: number, dontDeselect: ?boolean) {
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

  addItem (item: string, amount: number = 1): ?Slot {
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

  hasItem (item: string, amount: number = 1): boolean {
    const match = this.slots.find(s => s.item === item);
    return !!match && match.amount >= amount;
  }

  count (item: string): number {
    const match = this.slots.find(s => s.item === item);
    return match ? match.amount : 0;
  }

  useItem (item: ?string, amount: number = 1): boolean {
    if (!item) {
      return false;
    }
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

  serialize (): Object {
    return {
      slots: this.slots.map(s => s.serialize()),
      selected: this.selected
    };
  }

  deserialize (inv: Inventory) {
    inv.slots && inv.slots.forEach((s, i) => {
      this.slots[i].deserialize(s);
    });
    if (inv.selected && inv.selected > -1) {
      this.selectItem(inv.selected);
    }
  }

}

export default Inventory;
