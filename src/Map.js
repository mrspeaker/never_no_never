import Blocks from "./Blocks";
import BLOCK_TYPE from "./BLOCK_TYPE";
//import Items from "../Items";
import EasyStar from "easystarjs";
import Player from "./entities/Player";

class Map {

  constructor (game) {
    this.create(game);
  }

  create (game) {
    const map = this.map = game.add.tilemap("world");
    map.addTilesetImage("tiles", "tiles");
    map.addTilesetImage("mid", "mid");
    const layer = this.layer = map.createLayer("base");
    map.createLayer("mid");
    layer.resizeWorld();

    this.grid = this.mapToGrid(map);

    const estar = this.estar = new EasyStar.js();
    estar.setGrid(this.grid);
    estar.enableDiagonals();
    estar.disableCornerCutting();
    estar.setAcceptableTiles([0, 3]);
  }

  mapToGrid (map) {
    const h = map.layers[0].data.length;
    const w = map.layers[0].data[0].length;

    const grid = [];
    for (let y = 0; y < h; y++) {
      const gridRow = [];
      for (let x = 0; x < w; x++) {
        let cell = BLOCK_TYPE.walkable;
        for (let i = 0; i < map.layers.length; i++) {
          const index = map.layers[i].data[y][x].index;
          const block = Blocks.getByTileId(index);
          if (!block.walk && !block.mine) {
            cell = BLOCK_TYPE.solid;
          }
          else if (block.mine) {
            cell = BLOCK_TYPE.mineable;
          }
        }
        gridRow.push(cell);
      }
      grid.push(gridRow);
    }
    return grid;
  }

  makePath (e, tx, ty, onWalked) {
    const layer = this.layer;
    const xt = layer.getTileX(tx);
    const yt = layer.getTileY(ty);
    if (xt <= -1 || yt <= -1) return;

    const oldx = this.grid[yt][xt];
    this.grid[yt][xt] = BLOCK_TYPE.tmpwalkable;
    this.estar.setGrid(this.grid);
    this.estar.findPath(
      e.x / 32 | 0,
      e.y / 32 | 0,
      xt, yt,
      path => {
        if (!path) { return; }
        // TODO: still a bug with this on diagonals
        if (oldx === BLOCK_TYPE.solid ||
          (e instanceof Player && oldx !== BLOCK_TYPE.walkable)) {
          path = path.slice(0, -1);
        }
        if (path.length === 1 && oldx !== BLOCK_TYPE.walkable) {
          onWalked && onWalked();
        }
        else {
          e.setPath(path, onWalked || (() => {}));
        }
      });
    this.estar.calculate();
    this.grid[yt][xt] = oldx;
  }

  findEmptySpot () {
    let y = null;
    let x = null;
    let spot = -1;

    while (spot !== 0) {
      y = Math.random() * this.map.height | 0;
      x = Math.random() * this.map.width | 0;
      spot = this.grid[y][x];
    }
    return {x, y};
  }

}

export default Map;
