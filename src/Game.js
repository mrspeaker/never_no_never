import Preload from "./screens/Preload";
import Splash from "./screens/Splash";
import World from "./screens/World";
import DayOver from "./screens/DayOver";

import debug from "./debug";

const Phaser = window.Phaser;

class Game extends Phaser.Game {

  constructor (game) {
    super(374, 559, Phaser.AUTO, "bmax", null);
    this.state.add("Preload", Preload, false);
    this.state.add("Splash", Splash, false);
    this.state.add("World", World, false);
    this.state.add("DayOver", DayOver, false);
    this.state.start("Preload");

    debug.game = game;
  }

  update (game) {
    super.update(game);
    debug.update(this.state);
  }

}

export default Game;
