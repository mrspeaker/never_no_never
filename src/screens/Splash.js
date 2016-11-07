const Phaser = window.Phaser;

import Controls from "../Controls";
import Title from "../Title";
import Items from "../Items";
import DayTime from "../DayTime";
import data from "../data";
import Explosion from "../entities/Explosion";
import Player from "../entities/Player";

const startWiths = [
  [{item: "wood", amount: 2, unlocked: false, question: false}],
  [{item: "wood_sword", amount: 4, unlocked: false, question: false}],
  [{item: "stone_sword", amount: 4, unlocked: false, question: true}],
  [{item: "stone_pick", amount: 4, unlocked: false, question: true}],
];

class Splash extends Phaser.State {

  create (game) {
    game.stage.backgroundColor = "#000000";

    if (data.permanentUnlocks[0]) {
      startWiths[0][0].unlocked = true;
    }

    game.add.sprite(0, 0, "splash");
    this.p = new Player(game, 3, 13);
    this.p.scale.set(2);
    this.p.shadow.scale.set(2);
    this.p.update = () => {};

    game.add.sprite(32 * 4, 0, "splash-cover");
    game.add.sprite(32 * 4, 2, "splash-cover");

    this.goingToNext = false;

    const xo = 90;
    const yo = 100;
    const title = Title(game, "never,", 36, xo, yo).font;
    Title(game, "no", 36, xo, yo + 40).font;
    Title(game, "never,", 36, xo, yo + 80).font;
    //const start = Title(game, "Start with?", 9, 130, 210, true).font;

    const x = 160;
    const y = 140;
    Array.from(new Array(40), () => {
      setTimeout(() => {
        new Explosion(game,
          x + Math.random() * 120 - 60,
          y + Math.random() * 60 - 30
        );
      }, Math.random() * 800);
    });

    this.starts = startWiths.map(([item], i) => {
      const xo = 50;
      const yo = 280;
      const space = 80;

      let t = null;

      if (item.question) {
        const {img} = Title(game, "?", 36, i * space + xo - 6, yo);
        img.tint = Math.random() * 0xffffff;

        const {img:shadow} = Title(game, "?", 36, i * space + xo - 6, yo + 50);
        shadow.scale.y = 0.4;
        shadow.tint = 0;
        shadow.alpha = 0.2;

        t = img;
      }
      else {
        const icon = game.add.sprite(i * space + xo, yo, "icons");
        icon.frame = Items[item.item].icon;

        const shadow = game.add.sprite(i * space + xo, yo + 50, "icons");
        shadow.frame = Items[item.item].icon;
        shadow.scale.y = 0.4;
        shadow.tint = 0;
        shadow.alpha = 0.2;

        t = icon;
      }

      if (item.unlocked) {
        Title(game, item.amount, 9, i * space + xo + 4, yo + 24);
      }
      else {
        Title(game, "locked", 9, i * space + xo - 16, yo + 12);
      }
      return t;
    });


    this.controls = new Controls(game);

    this.ui = {
      title,
    };
  }

  update (game) {

    this.p.syncShadow();
    if (this.goingToNext) {
      return;
    }

    const {controls} = this;
    const {justPressed} = controls;

    controls.update();

    this.starts.forEach((s, i) => {
      s.y += Math.sin(i + Date.now() / 300) * 0.1;
    });

    const xo = Math.sign(Math.sin(Date.now() / 500));
    this.p.x += xo;
    this.p.doAnim("walk_" + (xo > 0 ? "right": "left"));


    if (justPressed) {
      this.goingToNext = true;
      this.p.doAnim("walk_right");
      const tweenA = game.add.tween(this.p).to({ x: 145, y: 300 }, 1000);
      const tweenB = game.add.tween(this.p).to({ y: -40 }, 1000, "Quart.easeOut");
      tweenA.chain(tweenB);
      tweenA.start();
      tweenA.onComplete.add(() => this.p.doAnim("walk_up"), this);
      tweenB.onComplete.add(this.next, this);
    }
  }

  next () {
    DayTime.reset();
    this.game.state.start("World");
  }

}

export default Splash;
