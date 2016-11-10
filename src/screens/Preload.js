// @flow
import {Game, State} from "phaser";

class Preload extends State {

  preload (game: Game) {
    game.load.image("tiles", "res/tiles.png");
    game.load.image("mid", "res/mid.png");
    game.load.image("inventory", "res/inventory.png");
    game.load.image("bmaxFont9", "res/bmax9.png");
    game.load.image("bmaxFont9x4", "res/bmax9x4.png");
    game.load.image("crafting", "res/crafting-back.png");
    game.load.image("splash", "res/splash.png");
    game.load.image("splash-cover", "res/splash-cover.png");
    game.load.image("dialog", "res/dialog.png");
    game.load.image("pda", "res/pda.png");
    game.load.spritesheet("craft-tmp", "res/craft-tmp.png", 34 * 4, 40);
    game.load.spritesheet("peeps", "res/peeps.png", 32, 32);
    game.load.spritesheet("icons", "res/icons.png", 32, 32);
    game.load.spritesheet("icons4x4", "res/icons4x4.png", 16, 16);
    game.load.spritesheet("mediums", "res/mediums.png", 40, 40);
    game.load.spritesheet("segway", "res/segway.png", 32, 48);
    game.load.spritesheet("inv-selection", "res/inv-selection.png", 52, 48);
  }

  update (game: Game) {
    game.state.start("Splash");
  }

}

export default Preload;
