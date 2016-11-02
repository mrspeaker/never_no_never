const Phaser = window.Phaser;
import Items from "../Items";
import Title from "../Title";
import recipes from "../Recipes";
import data from "../data";
import Floppy from "../entities/Floppy";

class GameOver {

  recipeXo = 20;
  recipeYo = 80;
  recipeLineSpacing = 55;
  columnWidth = 180;
  columnLength = 6;

  constructor (game, world) {
    this.world = world;
    this.game = game;
    const group = this.group = game.add.group();
    const icons = this.icons = game.add.group();

    const bg = group.create(0, 0, "crafting");
    bg.fixedToCamera = true;

    group.add(icons);

    const bottomOfTouchable = this.world.inventory.ui.box.cameraOffset.y;
    const craft = group.create(game.width - 64, 30, "icons");
    craft.fixedToCamera = true;
    craft.frame = 21;

    const tmpReset = this.tmpReset = group.create(game.width - 140, game.height - 60, "craft-tmp");
    tmpReset.frame = 2;
    tmpReset.fixedToCamera = true;
    tmpReset.inputEnabled = true;
    tmpReset.events.onInputDown.add(() => {
      this.visible = false;
      this.world.reset();
    }, this);

    this.redraw();

    this.visible = false;
  }

  get visible () {
    return this.group.visible;
  }

  set visible (visible) {
    if (visible) {
      this.redraw();
    }
    this.group.visible = visible;
  }

  redraw () {
    const {game, icons} = this;

    icons.removeAll();

    icons.add(Title(game, "death.", 36, 50, 120, true).img);
    icons.add(Title(game, "but you did good, kid.", 9, 50, 180, true).img);
    icons.add(Title(game, "here's the deets...", 9, 50, 200, true).img);

  }

  update () {
    const {world} = this;
    const {controls} = world;
    const {justPressed, y} = controls;

    if (justPressed) {
      if (y < 70) {
        // TODO: crafting shouldn't know about world state
        this.visible = false;
        this.world.reset();
      }
    }
  }

}

export default GameOver;
