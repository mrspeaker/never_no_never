import Items from "../Items";
import Title from "../Title";

const recipes = [{
  source: [{
    item: "wood",
    amount: 2
  }],
  yields: [{
    item: "wood_sword",
    amount: 4
  }]
}, {
  source: [{
    item: "wood",
    amount: 2
  }],
  yields: [{
    item: "wood_pick",
    amount: 4
  }]
}];

class Crafting {

  recipeXo = 40;
  recipeYo = 70;
  recipeLineSpacing = 42;

  constructor (game, world) {
    this.world = world;
    const group = this.group = game.add.group();

    group.create(0, 0, "crafting").fixedToCamera = true;

    const bottomOfTouchable = this.world.inventory.ui.box.cameraOffset.y;
    const craft = group.create(4, bottomOfTouchable + 6, "icons");
    craft.fixedToCamera = true;
    craft.frame = 21;

    const tmpReset = this.tmpReset = group.create(game.width - 120, 10, "craft-tmp");
    tmpReset.frame = 2;
    tmpReset.fixedToCamera = true;
    tmpReset.inputEnabled = true;
    tmpReset.events.onInputDown.add(() => {
      this.world.reset();
    }, this);

    recipes.forEach(({source, yields}, i) => {

      const g = game.add.group();
      group.add(g);

      let xo = this.recipeXo;
      let yo = this.recipeYo + i * this.recipeLineSpacing;

      source.forEach(({item, amount}) => {
        //const has = inventory.count(item);
        Array.from(new Array(amount), (_, ii) => {
          const x = xo + (ii * 32);
          const icon = g.create(x, yo, "icons");
          icon.frame = Items[item].icon;
          //if (i >= has) icon.alpha = 0.5;
          icon.fixedToCamera = true;
        });
        xo += amount * 32;
      });
      const arrow = g.create(xo, yo, "icons");
      arrow.frame = 30;
      arrow.fixedToCamera = true;
      xo += 32;
      yields.forEach(({item, amount}) => {

        const icon = g.create(xo, yo, "icons");
        icon.frame = Items[item].icon;
        icon.fixedToCamera = true;
        const title = Title(game, amount, 9, xo + 24, yo + 24, true);
        g.add(title.img);
        xo += 32;

      });
    });

    this.visible = false;
  }

  get visible () {
    return this.group.visible;
  }

  set visible (visible) {
    this.group.visible = visible;
    if (visible) {
      const {inventory} = this.world;
      // TODO: alpha non-have resources
      //this.tmpPick.alpha = inventory.hasItem("wood", 2) ? 1 : 0.4;
      //this.tmpSword.alpha = inventory.hasItem("wood", 2) ? 1 : 0.4;
    }
  }

  update (game) {
    const {world, recipeYo, recipeXo, recipeLineSpacing} = this;
    const {controls, inventory} = world;
    const {justPressed, x, y} = controls;

    if (justPressed) {
      const bottomOfTouchable = inventory.ui.box.cameraOffset.y - 5;
      if (y > bottomOfTouchable) {
        if (x < 50) {
          world.setMode("exploring");
          return;
        }
      }

      if (y >= recipeYo && y <= recipeYo + recipes.length * recipeLineSpacing) {
        const idx = (y - recipeYo) / recipeLineSpacing | 0;
        const {source, yields} = recipes[idx];
        const hasSources = source.every(({item, amount}) => inventory.hasItem(item, amount));
        if (hasSources) {
          yields.forEach(({item, amount}) => {
            const slot = inventory.addItem(item, amount);
            inventory.selectItem(slot.idx, true);
          });
        }
        this.visible = true;
      }
    }
  }

}

export default Crafting;
