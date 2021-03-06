import Phaser from "phaser";
import MapGen from "./MapGen";
import Blocks from "./Blocks";

const getCol = (base, mid) => {
  if (base >= 2 && base <= 20) return "#0095E9";
  if (base === Blocks.sand.tile) {
    if (mid === Blocks.empty.tile) return "#E8C789";
    if (mid === Blocks.tree.tile) return "#4B962A";
    if (mid === Blocks.coal_ore.tile) return "#333333";
    if (mid === Blocks.stone_ore.tile) return "#888888";
    if (mid === Blocks.rubber_sap.tile) return "#C57BDB";
    if (mid === Blocks.stalegmite.tile) return "#F9406C";
    return "#" + Math.floor(Math.random()*16777215).toString(16);
  }
  if (base === Blocks.mountain.tile) return "#880000";
  return "#" + Math.floor(Math.random()*16777215).toString(16);
};

class TestState extends Phaser.State {
  create (game) {
    const m = new MapGen(game);
    const size = 2;
    const bmd = game.add.bitmapData(m.width * size, m.height * size);
    for (let y = 0; y < m.height; y++) {
      for (let x = 0; x < m.width; x++) {
        const base = m.layers[0].data[y * m.width + x];
        const mid = m.layers[1].data[y * m.width + x];
        const col = getCol(base, mid);
        bmd.ctx.beginPath();
        bmd.ctx.rect(x * size, y * size, size, size);
        bmd.ctx.fillStyle = col;
        bmd.ctx.fill();
      }
    }
    game.add.sprite(20, 20, bmd);
  }
}

class Test extends Phaser.Game {

  constructor () {
    super(800, 600, Phaser.AUTO, "bmax", null);

    this.state.add("Test", TestState, false);
    this.state.start("Test");
  }

  //update (game) {
//    super.update(game);

  //}

}

export default Test;
