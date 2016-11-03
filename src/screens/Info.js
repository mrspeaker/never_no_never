const Phaser = window.Phaser;
import Title from "../Title";
import Items from "../Items";
import recipes from "../Recipes";
import State from "../State";

class Info extends Phaser.Group {

  pickup = null;

  constructor (game) {
    super(game);
    game.add.existing(this);

    this.state = new State("hidden");

    const bg = this.add(game.add.sprite(0, 0, "crafting"));
    bg.fixedToCamera = true;

    const t = this.c = Title(game, "craft", 36, 80, 70, true);
    this.add(t.img);
    this.add(Title(game, "unlock!", 36, 100, 110, true).img);

    this.decrypt = Title(game, "", 9, 80, 180, true);
    this.add(this.decrypt.img);

    this.deets = game.add.group();
    this.deets.fixedToCamera = true;
    this.add(this.deets);
    this.visible = false;
  }

  hide () {
    this.visible = false;
    this.game.input.onDown.remove(this.hide, this);
    this.game.paused = false;
    this.state.set("hidden");
  }

  show (pickup) {
    const {game} = this;
    this.pickup = pickup;
    this.deets.removeAll();
    this.visible = true;
    this.state.set("shown");

    //this.game.camera.flash(0xffffff, 300);
    game.time.events.add(Phaser.Timer.SECOND * 0.3, () => {
      game.input.onDown.add(this.hide, this);
      game.paused = true;
    });

  }

  redraw (game) {
    const {deets, pickup} = this;

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

  doUpdate (game) {
    const {state} = this;
    const cur = state.get();
    const first = state.isFirst();

    switch (cur) {
    case "shown":
      if (first) {
        state.set("calculating");
      }
      break;
    case "calculating":
      if (Math.random() < 0.01) {
        state.set("ready");
      }
      this.decrypt.text = "decrypting " +
        (btoa(Date.now()/1000).slice(-10)).split("").sort(()=>Math.random()<0.5?-1:1).join("");
      break;
    case "ready":
      if (first) {
        this.decrypt.text = "";
        this.redraw(game);
        this.state.set("rendered");
      }
      break;
    case "rendered":
      break;
    }
  }

}

export default Info;
