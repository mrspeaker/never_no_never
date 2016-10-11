import Splash from "./screens/Splash";
import World from "./screens/World";

const Phaser = window.Phaser;

class Game extends Phaser.Game {

  constructor () {
    super(374, 559, Phaser.AUTO, "bmax", null);
    this.state.add("World", World, false);
    this.state.add("Splash", Splash, false);
    this.state.start("Splash");
  }

}

export default Game;
