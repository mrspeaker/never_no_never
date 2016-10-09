class Crafting {

  constructor (game, world) {
    this.world = world;
    const group = this.group = game.add.group();

    //group.createMultiple(10, "icons", [1,2,3,4], false);
    //group.align(12, -1, 48, 48);

    group.create(0, 0, "crafting").fixedToCamera = true;

    const bottomOfTouchable = this.world.inventory.ui.box.cameraOffset.y;
    const craft = group.create(4, bottomOfTouchable + 6, "icons");
    craft.fixedToCamera = true;
    craft.frame = 21;

    this.visible = false;
  }

  get visible () {
    return this.group.visible;
  }

  set visible (visible) {
    this.group.visible = visible;
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

      if (y < 200) {
        // Craft!
        if (inventory.hasItem("wood", 2)) {
          inventory.useItem("wood", 2);
          inventory.addItem("wood_pick", 1);
        }
        else {
          // Not enough resources
        }
      }
    }
  }

}

export default Crafting;
