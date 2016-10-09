class Crafting {

  constructor (game, world) {
    this.world = world;
    const inventory = world.inventory;
    const group = this.group = game.add.group();

    group.create(0, 0, "crafting").fixedToCamera = true;

    const bottomOfTouchable = this.world.inventory.ui.box.cameraOffset.y;
    const craft = group.create(4, bottomOfTouchable + 6, "icons");
    craft.fixedToCamera = true;
    craft.frame = 21;

    const tmpSword = this.tmpSword = group.create(120, 150, "craft-tmp");
    tmpSword.frame = 0;
    tmpSword.alpha = 0.4;
    tmpSword.fixedToCamera = true;
    tmpSword.inputEnabled = true;
    tmpSword.events.onInputDown.add(() => {
      if (inventory.hasItem("wood", 2)) {
        inventory.useItem("wood", 2);
        const slot = inventory.addItem("wood_sword", 4);
        inventory.selectItem(slot.idx);
        this.visible = true;
      }
    }, this);

    const tmpPick = this.tmpPick = group.create(120, 210, "craft-tmp");
    tmpPick.frame = 1;
    tmpPick.alpha = 0.4;
    tmpPick.fixedToCamera = true;
    tmpPick.inputEnabled = true;
    tmpPick.events.onInputDown.add(() => {
      if (inventory.hasItem("wood", 2)) {
        inventory.useItem("wood", 2);
        const slot = inventory.addItem("wood_pick", 4);
        inventory.selectItem(slot.idx);
        this.visible = true;
      }
    }, this);

    const tmpReset = this.tmpReset = group.create(game.width - 120, 10, "craft-tmp");
    tmpReset.frame = 2;
    tmpReset.fixedToCamera = true;
    tmpReset.inputEnabled = true;
    tmpReset.events.onInputDown.add(() => {
      this.world.reset();
    }, this);

    this.visible = false;
  }

  get visible () {
    return this.group.visible;
  }

  set visible (visible) {
    this.group.visible = visible;
    if (visible) {
      const {inventory} = this.world;
      this.tmpPick.alpha = inventory.hasItem("wood", 2) ? 1 : 0.4;
      this.tmpSword.alpha = inventory.hasItem("wood", 2) ? 1 : 0.4;
    }
  }

  update (game) {
    const {controls, inventory} = this.world;
    const {justPressed, x, y} = controls;

    if (justPressed) {
      const bottomOfTouchable = inventory.ui.box.cameraOffset.y - 5;
      if (y > bottomOfTouchable) {
        if (x < 50) {
          this.world.setMode("exploring");
          return;
        }
      }

      /*if (y < 200) {
        // Craft!
        if (inventory.hasItem("wood", 2)) {
          inventory.useItem("wood", 2);
          inventory.addItem("wood_pick", 1);
        }
        else {
          // Not enough resources
        }
      }
      */
    }
  }

}

export default Crafting;
