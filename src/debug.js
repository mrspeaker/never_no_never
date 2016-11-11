//@flow
import {Game, StateManager} from "phaser";

class Debug {

  game: ?Game;

  constructor () {
    // Add key hanlder
    /// this.keys =
  }

  update (state: StateManager) {
    const cur = state.current;
    if (cur === "World") {
      //this.updateWorld(state.states.World);
    }
  }

  // updateWorld (world:State) {
  //   //
  // }

}

export default new Debug();
