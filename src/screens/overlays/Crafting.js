import Phaser, {Game, Sprite, Group} from "phaser";
import Items from "../../Items";
import Title from "../../Title";
import Recipes from "../../Recipes";
import data from "../../data";
import Floppy from "../../entities/Floppy";
import World from "../World";

class Crafting {

  world: World;
  game: Game;
  group: Group;
  pda: Sprite;
  icons: Group;

  recipeRow: Array<any>;

  pauseGame = true;
  noclick = true;

  recipeXo = 60;
  recipeYo = 110;
  recipeLineSpacing = 50;
  columnWidth = 150;
  columnLength = 6;

  constructor (game: Game, world: World) {
    this.world = world;
    this.game = game;

    const group = this.group = game.add.group();
    group.fixedToCamera = true;
    group.visible = false;

    const body = this.body = game.add.group();
    group.add(body);

    this.pda = body.add(game.add.sprite(-6, 0, "pda"));

    const bottomOfTouchable = this.world.inventory.ui.box.cameraOffset.y;
    const craft = body.create(game.width - 64, 30, "icons");
    craft.frame = 21;

    const tmpReset = this.tmpReset = body.create(game.width - 140, game.height - 60, "craft-tmp");
    tmpReset.frame = 2;
    tmpReset.inputEnabled = true;
    tmpReset.events.onInputDown.add(() => {
      this.visible = false;
      this.world.reset();
    }, this);

    const cheat = this.cheat = body.create(0, game.height - 60, "craft-tmp");
    cheat.frame = this.world._cheat ? 1 : 0;
    cheat.inputEnabled = true;
    cheat.events.onInputDown.add(() => {
      const isCheat = this.world.toggleCheat();
      cheat.frame = isCheat ? 1 : 0;
    }, this);

    //cheat.blendMode = window.PIXI.blendModes.DIFFERENCE;

    const icons = this.icons = game.add.group();
    body.add(icons);

    this.redraw();
  }

  show () {
    this.redraw();
    this.group.visible = true;
    this.body.y = this.game.height - 130;
    this.game.add.tween(this.body).to( { y: 0 }, 500, Phaser.Easing.Exponential.Out, true);

  }

  hide () {
    this.group.visible = false;
    this.game.paused = false;
    return true;
  }

  fadeChoice (idx) {
    // properties, duration, ease, autoStart, delay, repeat, yoyo
    // FIXME: why don't this.recipeRow[idx] alpha fade the row?
    // fading everything for now.
    this.game.add.tween(this.icons).to(
      {alpha: 0.2},
      100,
      Phaser.Easing.Linear.None,
      true,
      0,
      0,
      true);
  }

  redraw () {
    const {game, icons} = this;
    const {inventory} = this.world;

    icons.removeAll();

    let dbIsEmpty = true;

    this.recipeRow = Recipes.map(({name, source, yields}, i) => {
      let xo = this.recipeXo + (i / this.columnLength | 0) * this.columnWidth;
      let yo = this.recipeYo + ((i % this.columnLength) * this.recipeLineSpacing);
      if (!data.recipes[name]) {
        return null;
      }
      dbIsEmpty = false;
      const g = game.add.group();
      icons.add(g);

      source.forEach(({item, amount}) => {
        const icon = g.create(xo, yo, "icons");
        icon.frame = Items[item].icon;
        if (amount > 1) {
          const title = Title(game, amount, 9, xo + 24, yo + 24);
          g.add(title.img);
        }
        icon.alpha = inventory.hasItem(item, amount) ? 1 : 0.2;
        xo += 32;
      });
      const arrow = g.create(xo, yo, "icons");
      arrow.frame = 30;
      xo += 32;
      yields.forEach(({item, amount}) => {
        const icon = g.create(xo, yo, "icons");
        icon.frame = Items[item].icon;
        const title = Title(game, amount, 9, xo + 24, yo + 24);
        g.add(title.img);
        xo += 32;
      });
      return g;
    });

    if (dbIsEmpty) {
      const flop:Sprite = new Floppy(game, 80, 200);
      flop.scale.set(3);
      icons.add(flop);
      icons.add(Title(game, "error.", 36, 60, 120).img);
      icons.add(Title(game, "no knowledge found in", 9, 60, 320).img);
      icons.add(Title(game, "database.", 9, 60, 340).img);
      icons.add(Title(game, "seek digital information.", 9, 60, 380).img);
    }
  }

  doUpdate () {
    const {game, world, recipeYo, recipeLineSpacing} = this;
    const {controls, inventory} = world;
    const {justReleased, x, y} = controls;

    if (justReleased) {
      if (y < 70) {
        // TODO: crafting shouldn't know about world state
        this.world.overlays.hide();
      }

      if (y >= recipeYo && y <= game.height - 60) {
        const xo = x - this.recipeXo;
        const yo = y - this.recipeYo;
        const col = xo / this.columnWidth | 0;
        const row = yo / recipeLineSpacing | 0;

        if (row > this.columnLength - 1) {
          return;
        }
        const idx = col * this.columnLength + row;
        if (idx > Recipes.length - 1) {
          return;
        }
        const {source, yields, name} = Recipes[idx];
        const isCheat = this.world._cheat;
        const hasRecipe = isCheat || !!data.recipes[name];
        const hasSources = isCheat || source.every(({item, amount}) => inventory.hasItem(item, amount));
        if (hasRecipe && hasSources) {
          yields.forEach(({item, amount}) => {
            const slot = inventory.addItem(item, amount);
            inventory.selectItem(slot.idx, true);
          });
          !isCheat && source.forEach(({item, amount}) => inventory.useItem(item, amount));
          this.redraw();
          this.fadeChoice(idx);
        }
        else {
          game.camera.shake(0.01, 200);
        }
        this.visible = true;
      }
    }
  }

}

export default Crafting;
