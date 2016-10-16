import Preload from "./screens/Preload";
import Splash from "./screens/Splash";
import World from "./screens/World";
import DayOver from "./screens/DayOver";

const Phaser = window.Phaser;

class Game extends Phaser.Game {

  constructor () {
    super(374, 559, Phaser.AUTO, "bmax", null);
    this.state.add("Preload", Preload, false);
    this.state.add("Splash", Splash, false);
    this.state.add("World", World, false);
    this.state.add("DayOver", DayOver, false);
    this.state.start("Preload");
  }

}

export default Game;
