const Phaser = window.Phaser;
import Controls from "../Controls";
import Title from "../Title";
import Items from "../Items";

const startWiths = [
  [{item: "wood", amount: 2, unlocked: false, question: false}],
  [{item: "wood_sword", amount: 4, unlocked: false, question: false}],
  [{item: "stone_sword", amount: 4, unlocked: false, question: true}],
  [{item: "stone_pick", amount: 4, unlocked: false, question: true}],
];

class Splash extends Phaser.State {

  preload (game) {
    game.load.image("tiles", "res/tiles.png");
    game.load.image("mid", "res/mid.png");
    game.load.image("bmaxFont9", "res/bmax9.png");
    game.load.image("bmaxFont9x4", "res/bmax9x4.png");
    game.load.spritesheet("craft-tmp", "res/craft-tmp.png", 34 * 4, 40);
    game.load.spritesheet("peeps", "res/peeps.png", 32, 32);
    game.load.spritesheet("icons", "res/icons.png", 32, 32);
    game.load.spritesheet("icons4x4", "res/icons4x4.png", 16, 16);
  }

  create (game) {
    game.stage.backgroundColor = "#0095E9";

    const title = Title(game, "bmax!", 36, 100, 112).font;
    const start = Title(game, "Start with?", 9, 130, 210, true).font;

    startWiths.forEach(([item], i) => {
      const xo = 50;
      const yo = 280;
      const space = 80;

      if (item.question) {
        const {img} = Title(game, "?", 36, i * space + xo - 6, yo);
        img.tint = Math.random() * 0xffffff;
      }
      else {
        const icon = game.add.sprite(i * space + xo, yo, "icons");
        icon.frame = Items[item.item].icon;
      }

      if (item.unlocked) {
        Title(game, item.amount, 9, i * space + xo + 4, yo + 24);
      }
      else {
        Title(game, "locked", 9, i * space + xo - 16, yo + 12);
      }
    });


    this.controls = new Controls(game);

    this.ui = {
      title,
      start,
    };
  }

  update (game) {
    const {controls} = this;
    const {justPressed} = controls;

    controls.update();

    if (justPressed) {
      game.state.start("World");
    }

  }


}

export default Splash;
