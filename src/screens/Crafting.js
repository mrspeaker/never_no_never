const Phaser = window.Phaser;
import Items from "../Items";
import Title from "../Title";
import recipes from "../Recipes";

class Crafting {

  recipeXo = 120;
  recipeYo = 170;
  recipeLineSpacing = 75;

  constructor (game, world) {
    this.world = world;
    this.game = game;
    const group = this.group = game.add.group();

    group.create(0, 0, "crafting").fixedToCamera = true;

    const bottomOfTouchable = this.world.inventory.ui.box.cameraOffset.y;
    const craft = group.create(game.width - 64, 30, "icons");
    craft.fixedToCamera = true;
    craft.frame = 21;

    const tmpReset = this.tmpReset = group.create(game.width - 140, game.height - 60, "craft-tmp");
    tmpReset.frame = 2;
    tmpReset.fixedToCamera = true;
    tmpReset.inputEnabled = true;
    tmpReset.events.onInputDown.add(() => {
      this.world.reset();
    }, this);

    const cheat = this.cheat = group.create(0, game.height - 60, "craft-tmp");
    cheat.frame = 0;
    cheat.fixedToCamera = true;
    cheat.inputEnabled = true;
    cheat.events.onInputDown.add(() => {
      const isCheat = this.world.toggleCheat();
      cheat.frame = isCheat ? 1 : 0;
    }, this);

    this.recipes = recipes.map(({source, yields}, i) => {

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

      return g;
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

  fadeChoice (idx) {
    // properties, duration, ease, autoStart, delay, repeat, yoyo
    this.game.add.tween(this.recipes[idx]).to(
      {alpha: 0.2},
      100,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      true);
  }

  update (game) {
    const {world, recipeYo, recipeLineSpacing} = this;
    const {controls, inventory} = world;
    const {justPressed, y} = controls;

    if (justPressed) {
      if (y < 70) {
        world.setMode("exploring");
      }

      if (y >= recipeYo && y <= recipeYo + recipes.length * recipeLineSpacing) {
        const idx = (y - recipeYo) / recipeLineSpacing | 0;
        const {source, yields} = recipes[idx];
        const isCheat = this.world._cheat;
        const hasSources = isCheat || source.every(({item, amount}) => inventory.hasItem(item, amount));
        if (hasSources) {
          this.fadeChoice(idx);
          yields.forEach(({item, amount}) => {
            const slot = inventory.addItem(item, amount);
            inventory.selectItem(slot.idx, true);
          });
          !isCheat && source.forEach(({item, amount}) => inventory.useItem(item, amount));
        }
        this.visible = true;
      }
    }
  }

}

export default Crafting;
