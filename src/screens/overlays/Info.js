import {Group} from "phaser";
import Title from "../../Title";
import Items from "../../Items";
import recipes from "../../Recipes";
import State from "../../State";
import Floppy from "../../entities/Floppy";

class Info {

  pauseGame = true;
  pickup = null;

  group: Group;

  constructor (game, world) {
    this.world = world;
    this.game = game;

    const group = this.group = game.add.group();
    group.fixedToCamera = true;
    group.visible = false;

    this.state = new State("hidden");

    //const bg = group.add(game.add.sprite(0, 0, "crafting"));
    //bg.alpha = 0.6;
    this.pda = group.add(game.add.sprite(-6, 0, "pda"));

    this.t1 = Title(game, "craft", 36, 60, 110);
    group.add(this.t1.img);
    this.t2 = Title(game, "unlock!", 36, 74, 140);
    group.add(this.t2.img);
    this.t1.img.visible = false;
    this.t2.img.visible = false;

    this.decrypt = Title(game, "", 9, 80, 180);
    group.add(this.decrypt.img);

    this.deets = game.add.group();
    group.add(this.deets);
  }

  get isOpen () {
    return !!this.current;
  }

  hide () {
    if (Date.now() - this.shownAt < 1000) {
      return false;
    }
    const t = this.game.add.tween(this.pda)
      .to( { y: this.game.height - 130 }, 700, Phaser.Easing.Exponential.InOut, true);
    t.onComplete.add(() => {
      this.group.visible = false;
    }, this);
    return true;
  }

  show (pickup) {
    this.pickup = pickup;
    this.deets.removeAll();
    this.state.set(pickup === "intro" ? "intro" : "shown");
    this.pda.y = this.game.height - 130;
    this.group.visible = true;
    this.game.add.tween(this.pda).to( { y: 0 }, 700, Phaser.Easing.Exponential.InOut, true);
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
        const title = Title(game, amount, 9, xo + 24, yo + 24);
        g.add(title.img);
      }
      xo += 32;
    });

    const arrow = g.create(xo, yo, "icons");
    arrow.frame = 30;

    xo += 32;
    yields.forEach(({item, amount}) => {
      const icon = g.create(xo, yo, "icons");
      icon.frame = Items[item].icon;
      const title = Title(game, amount, 9, xo + 24, yo + 24, true);
      g.add(title.img);
      xo += 32;
    });

    deets.add(Title(game, name + " added to", 9, oxo, yo + 50).img);
    deets.add(Title(game, "crafting database.", 9, oxo, yo + 70).img);

    description && description.split("\n")
      .map(d => d.trim())
      .filter(d => d !== "")
      .forEach((d, i) => {
        if (d === "-") d = " ";
        g.add(Title(game, d, 9, oxo, yo + 120 + (i * 16)).img);
      });
  }

  doUpdate () {
    const {state, game, deets} = this;
    const cur = state.get();
    const first = state.isFirst();

    switch (cur) {
    case "intro":
      if (first) {
        this.shownAt = Date.now();

        const g = game.add.group();
        deets.add(g);

        const flop = this.flop1 = new Floppy(game, 120, 270);
        flop.scale.set(1.5);
        const flop2 = this.flop2 = new Floppy(game, 180, 270);
        flop2.scale.set(1.5);
        flop.tint = 0x666666;
        flop2.tint = 0x666666;
        g.add(flop);
        g.add(flop2);
        g.add(Title(game, "find", 36, 60, 110).img);
        g.add(Title(game, "disks.", 36, 74, 150).img);

        const xo = 60;
        const yo = 220;
        g.add(Title(game, "in a world where all knowledge", 9, xo - 6, yo).img);
        g.add(Title(game, "has been lost... only digital", 9, xo, yo + 20).img);
        g.add(Title(game, "scraps remain.", 9, xo, yo + 40).img);
        g.add(Title(game, "Find them, for they hold the", 9, xo, yo + 80).img);
        g.add(Title(game, "keys to survival.", 9, xo, yo + 100).img);
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
      this.decrypt.text(
        "decrypting " +
        (btoa(Date.now()/1000).slice(-10)).split("").sort(()=>0.5 - Math.random()).join(""));
      break;

    case "ready":
      if (first) {
        this.decrypt.text("");
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
