const Phaser = window.Phaser;
import Controls from "../Controls";

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
    game.stage.backgroundColor = "#4B962A";

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ .,!?'\":-$                0123456789";
    const title = game.add.retroFont("bmaxFont9x4", 36, 36, chars, 13, 0, 0, 0, 0);
    title.text = "bmax!";
    game.add.image(10, 10, title);

    const subtitle = game.add.retroFont("bmaxFont9", 9, 9, chars, 13, 0, 0, 0, 0);
    subtitle.text = "0123456789!? You bet.";
    game.add.image(12, 56, subtitle);

    this.controls = new Controls(game);

    this.ui = {
      title,
      subtitle,
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
