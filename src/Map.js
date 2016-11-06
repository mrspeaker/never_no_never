const Phaser = window.Phaser;
import Blocks from "./Blocks";
import BLOCK_TYPE from "./BLOCK_TYPE";
import EasyStar from "easystarjs";
import Player from "./entities/Player";
import MapGen from "./MapGen";
class Map {

  constructor (game) {
    this.create(game);
  }

  create (game) {

    game.load.tilemap("world", null, MapGen(), Phaser.Tilemap.TILED_JSON);

    const map = this.map = game.add.tilemap("world");
    map.addTilesetImage("tiles", "tiles");

    this.layerz = {};
    const base = this.layerz.base = map.createLayer("base");
    base.resizeWorld();
    map.addTilesetImage("mid", "mid");
    const mid = this.layerz.mid = map.createLayer("mid");

    Object.keys(Blocks)
      .map(k => Blocks[k])
      .filter(b => b.tile !== undefined && !b.walk)
      .map(b => b.tile)
      .sort((a, b) => a - b)
      .forEach(t => {
        map.setCollision(t, true, t < 256 ? base : mid);
      });
    //base.debug = true;
    //mid.debug = true;

    this.grid = this.mapToGrid(map);

    const estar = this.estar = new EasyStar.js();
    estar.setGrid(this.grid);
    estar.enableDiagonals();
    estar.disableCornerCutting();
    estar.setAcceptableTiles([0, 3]);
    // estar.setIterationsPerCalculation(1000);
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

  getTileXY (x, y) {
    return this.getTile(x / 32 | 0, y / 32 | 0);
  }

  getTile (x, y) {
    const layers = this.map.layers;
    const baseLayer = layers[0].data;
    const midLayer = layers[1].data;
    if (x < 0 || x >= baseLayer[0].length ||
        y < 0 || y >= baseLayer.length) {
      return {
        base: Blocks.clear,
        mid: Blocks.clear
      };
    }

    const base = baseLayer[y][x].index;
    const mid = midLayer[y][x].index;
    return {
      base: Blocks.getByTileId(base),
      mid: Blocks.getByTileId(mid)
    };
  }

  setTileXY (tile, x, y, layer = 1) {
    this.setTile(tile, x / 32 | 0, y / 32 | 0, layer);
  }

  setTile (tile, xt, yt, layer = 1) {
    this.map.putTile(tile, xt, yt, layer);
    const block = Blocks.getByTileId(tile);
    this.grid[yt][xt] = block.walk ? BLOCK_TYPE.walkable : BLOCK_TYPE.solid;
  }

  getNeighbours (x, y)  {
    // nope... need to think it out... base vs mid.
    const grid = this.map;
    const l = x == 0 ? Blocks.clear.tile : grid[y][x - 1];
    const r = x >= grid[0].length - 1 ? Blocks.clear.tile : grid[y][x + 1];
    const t = y <= 0 ? Blocks.clear.tile : grid[y - 1][x];
    const b = y >= grid.length - 1 ? Blocks.clear.tile : grid[y + 1][x];
    return {
      l, r, t, b
    };
  }

  makePath (e, tx, ty, onWalked, force) {
    const layer = this.layerz.base;
    const xt = layer.getTileX(tx);
    const yt = layer.getTileY(ty);
    if (xt <= -1 || yt <= -1) return;

    if (e.lastPathSet && Date.now() - e.lastPathSet < 500) {
      //console.log("too soon");
      // this prevents starting more calcs - but not sure if it's useful
      return;
    }

    const oldx = this.grid[yt][xt];
    this.grid[yt][xt] = BLOCK_TYPE.tmpwalkable;
    this.estar.setGrid(this.grid);
    this.estar.findPath(
      e.x / 32 | 0,
      e.y / 32 | 0,
      xt, yt,
      path => {
        if (!path) { return; }

        if (path.length > 1) {
          // find out if path[0] is in the right direction or not...
          // and slice it if not.
          const xo = path[1].x - path[0].x;
          const yo = path[1].y - path[0].y;
          if (xo > 0 || yo > 0) {
            path = path.slice(1);
          }
        }

        // TODO: still a bug with this on diagonals
        if (oldx === BLOCK_TYPE.solid ||
          (e instanceof Player && oldx !== BLOCK_TYPE.walkable)) {
          path = path.slice(0, -1);
        }
        if (path.length === 1 && oldx !== BLOCK_TYPE.walkable) {
          onWalked && onWalked();
        }
        else {
          e.setPath(path, onWalked || (() => {}), force);
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

  findEmptySpotAtCenter () {
    let y = null;
    let x = null;
    let spot = -1;

    let midX = this.map.width / 2 | 0;
    let midY = this.map.height / 2 | 0;

    let area = 4;
    let halfArea = area / 2;

    while (spot !== 0) {
      y = (Math.random() * area - halfArea) + midX | 0;
      x = (Math.random() * area - halfArea) + midY | 0;
      spot = this.grid[y][x];
      area += 0.5;
      halfArea = area / 2;
    }
    return {x, y};
  }

  findEmptySpotFurtherThan (e, CLOSE_PIXELS = 400) {
    let close = true;
    let x = -1;
    let y = -1;
    while (close) {
      const spot = this.findEmptySpot();
      x = spot.x;
      y = spot.y;
      const dist = Phaser.Math.distance(x * 32, y * 32, e.x, e.y);
      if (dist > CLOSE_PIXELS) {
        close = false;
      }
    }
    return {x, y};
  }

  placeBlockAt (block, worldX, worldY) {
    const {base, mid} = this.getTileXY(worldX, worldY);
    if (mid.name === "clear") {
      if (block === Blocks.sand.tile) {
        this.setTileXY(block, worldX, worldY, 0);
      }
      else if (base.name === "sand") {
        this.setTileXY(block, worldX, worldY);
      }
      return true;
    }
    return false;
  }

}

export default Map;
