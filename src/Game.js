//@flow

import Phaser from "phaser";
import Preload from "./screens/Preload";
import Splash from "./screens/Splash";
import World from "./screens/World";
import DayOver from "./screens/DayOver";
import debug from "./debug";

const { Game, AUTO } = Phaser;

class Bmax extends Game {

  constructor (game: Game) {
    super(374, 559, AUTO, "bmax", null);
    this.state.add("Preload", Preload, false);
    this.state.add("Splash", Splash, false);
    this.state.add("World", World, false);
    this.state.add("DayOver", DayOver, false);
    this.state.start("Preload");

    // Needed for taking screen shots.
    this.preserveDrawingBuffer = true;

    debug.game = game;
  }

  update (time: number) {
    super.update(time);
    debug.update(this.state);
  }

}

export default Bmax;
