const Phaser = window.Phaser;
import Title from "../Title";
import Items from "../Items";
import recipes from "../Recipes";

class Info extends Phaser.Group {

  constructor (game) {
    super(game);
    game.add.existing(this);

    const bg = this.add(game.add.sprite(0, 0, "crafting"));
    bg.fixedToCamera = true;

    this.add(Title(game, "found!", 36, 80, 100, true).img);

    this.deets = game.add.group();
    this.add(this.deets);
    this.visible = false;
  }

  show (pickup) {
    const {game} = this;
    this.redraw(pickup);
    this.visible = true;

    //this.game.camera.flash(0xffffff, 300);
    game.time.events.add(Phaser.Timer.SECOND * 0.3, () => {
      game.input.onDown.add(this.leave, this);
      game.paused = true;
    });

  }

  redraw (pickup) {
    const {game, deets} = this;
    deets.removeAll();

    const recipe = recipes.find(({name}) => name === pickup);
    const {name, source, yields, description} = recipe;

    deets.add(Title(game, name, 9, 80, 250, true).img);

    let xo = 80;
    let yo = 200;

    const g = game.add.group();
    deets.add(g);

    source.forEach(({item, amount}) => {
      const icon = g.create(xo, yo, "icons");
      icon.frame = Items[item].icon;
      icon.fixedToCamera = true;
      if (amount > 1) {
        const title = Title(game, amount, 9, xo + 24, yo + 24, true);
        g.add(title.img);
      }
      xo += 32;
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

    description && description.split("\n")
      .map(d => d.trim())
      .filter(d => d !== "")
      .forEach((d, i) => {
        if (d === "-") d = " ";
        g.add(Title(game, d, 9, 80, 320 + (i * 16), true).img);
      });

  }

  leave () {
    this.game.input.onDown.remove(this.leave, this);
    this.game.paused = false;
    this.visible = false;
  }

}

export default Info;
