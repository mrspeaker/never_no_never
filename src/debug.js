class Debug {

  constructor () {
    // Add key hanlder
    /// this.keys =
  }

  update (state) {
    const cur = state.current;
    if (cur === "World") {
      this.updateWorld(state.states.World);
    }
  }

  updateWorld (world) {

  }

}

export default new Debug();
