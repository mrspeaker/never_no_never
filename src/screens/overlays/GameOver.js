import Title from "../../Title";
import data from "../../data";

class GameOver {

  pauseGame = false;

  recipeXo = 20;
  recipeYo = 80;
  recipeLineSpacing = 55;
  columnWidth = 180;
  columnLength = 6;

  constructor (game, world) {
    this.world = world;
    this.game = game;

    const group = this.group = game.add.group();
    group.fixedToCamera = true;
    group.visible = false;

    const bg = group.create(0, 0, "crafting");
    group.add(bg);

    const craft = group.create(game.width - 64, 30, "icons");
    craft.frame = 21;

    const icons = this.icons = game.add.group();
    group.add(icons);

    this.redraw();
  }

  show () {
    data.gameHP += data.dailyHP;
    data.lifetimeHP += data.gameHP;
    this.redraw();
    this.group.visible = true;
  }

  hide () {
    this.group.visible = false;
    return true;
  }

  redraw () {
    const {game, icons} = this;

    icons.removeAll();

    icons.add(Title(game, "death.", 36, 50, 120).img);
    icons.add(Title(game, "but you did good, kid.", 9, 50, 180).img);
    icons.add(Title(game, "here's the deets...", 9, 50, 200).img);
    icons.add(Title(game, "hp: " + data.gameHP, 36, 60, 230).img);
    icons.add(Title(game, "lifetime hp: " + data.lifetimeHP, 9, 60, 270).img);
    icons.add(Title(game, "unlocks: " + (data.gameCraftUnlocks.join(",") || "0"), 9, 60, 290).img);
  }

  doUpdate () {
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
