import Title from "../Title";
import data from "../data";

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

    const craft = group.create(game.width - 64, 30, "icons");
    craft.fixedToCamera = true;
    craft.frame = 21;

    this.redraw();

    this.visible = false;
  }

  get visible () {
    return this.group.visible;
  }

  set visible (visible) {
    if (visible) {
      data.gameHP += data.dailyHP;
      data.lifetimeHP += data.gameHP;
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
    icons.add(Title(game, "hp: " + data.gameHP, 36, 60, 230, true).img);
    icons.add(Title(game, "lifetime hp: " + data.lifetimeHP, 9, 60, 270, true).img);
    icons.add(Title(game, "unlocks: " + (data.gameCraftUnlocks.join(",") || "0"), 9, 60, 290, true).img);

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
