const Phaser = window.Phaser;
import Title from "../Title";
import Items from "../Items";
import recipes from "../Recipes";
import State from "../State";
import Floppy from "../entities/Floppy";

class Info extends Phaser.Group {

  pickup = null;

  constructor (game) {
    super(game);
    game.add.existing(this);

    this.state = new State("hidden");

    this.bg = this.add(game.add.sprite(0, 0, "crafting"));
    this.bg.fixedToCamera = true;
    this.bg.alpha = 0.6;

    //this.dialog = this.add(game.add.sprite(24, 64, "dialog"));
    //this.dialog.fixedToCamera = true;
    this.pda = this.add(game.add.sprite(-6, 0, "pda"));
    this.pda.fixedToCamera = true;

    this.t1 = Title(game, "craft", 36, 60, 110, true);
    this.add(this.t1.img);
    this.t2 = Title(game, "unlock!", 36, 74, 140, true);
    this.add(this.t2.img);
    this.t1.img.visible = false;
    this.t2.img.visible = false;

    this.decrypt = Title(game, "", 9, 80, 180, true);
    this.add(this.decrypt.img);

    this.deets = game.add.group();
    this.deets.fixedToCamera = true;
    this.add(this.deets);
    this.visible = false;
  }

  hide () {
    if (Date.now() - this.shownAt < 1000) {
      return;
    }
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
    this.state.set(pickup === "intro" ? "intro" : "shown");

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


    const oxo = 60;
    const yo = 200;
    let xo = oxo;

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

    deets.add(Title(game, name + " added to", 9, oxo, yo + 50, true).img);
    deets.add(Title(game, "crafting database.", 9, oxo, yo + 70, true).img);

    description && description.split("\n")
      .map(d => d.trim())
      .filter(d => d !== "")
      .forEach((d, i) => {
        if (d === "-") d = " ";
        g.add(Title(game, d, 9, oxo, yo + 120 + (i * 16), true).img);
      });
  }

  doUpdate (game) {
    const {state} = this;
    const cur = state.get();
    const first = state.isFirst();

    switch (cur) {
    case "intro":
      if (first) {
        this.shownAt = Date.now();
        const flop = this.flop1 = new Floppy(game, 120, 270);
        flop.fixedToCamera = true;
        flop.scale.set(1.5);
        const flop2 = this.flop2 = new Floppy(game, 180, 270);
        flop2.fixedToCamera = true;
        flop2.scale.set(1.5);
        flop.tint = 0x666666;
        flop2.tint = 0x666666;
        this.deets.add(flop);
        this.deets.add(flop2);
        this.deets.add(Title(game, "find", 36, 60, 110, true).img);
        this.deets.add(Title(game, "disks.", 36, 74, 150, true).img);
        this.add(this.t2.img);

        const xo = 60;
        const yo = 220;
        this.deets.add(Title(game, "in a world where all knowledge", 9, xo - 6, yo, true).img);
        this.deets.add(Title(game, "has been lost... only digital", 9, xo, yo + 20, true).img);
        this.deets.add(Title(game, "scraps remain.", 9, xo, yo + 40, true).img);
        this.deets.add(Title(game, "Find them, for they hold the", 9, xo, yo + 80, true).img);
        this.deets.add(Title(game, "keys to survival.", 9, xo, yo + 100, true).img);
      }
      this.flop1.y += Math.sin(Date.now() / 500) * 0.5;
      this.flop2.y += Math.sin((Date.now() + 500) / 500) * 0.5;
      break;
    case "shown":
      if (first) {
        this.t1.img.visible = true;
        this.t2.img.visible = true;

        this.shownAt = Date.now();
        state.set("calculating");
      }
      break;
    case "calculating":
      if (Date.now() - state.time > 1000 && (Math.random() < 0.01 || Date.now() - state.time > 5000)) {
        state.set("ready");
      }
      this.decrypt.text = "decrypting " +
        (btoa(Date.now()/1000).slice(-10)).split("").sort(()=>0.5 - Math.random()).join("");
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
