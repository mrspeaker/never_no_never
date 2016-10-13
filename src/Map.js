const Phaser = window.Phaser;
import Blocks from "./Blocks";
import BLOCK_TYPE from "./BLOCK_TYPE";
//import Items from "../Items";
import EasyStar from "easystarjs";
import Player from "./entities/Player";

const FastSimplexNoise = require("fast-simplex-noise");

class Map {

  constructor (game) {
    this.create(game);
  }

  create (game) {
    const noiseBase = new FastSimplexNoise({
      frequency: 0.1,
      max: 1,
      min: 0,
      octaves: 4
    });

    const noiseTrees = new FastSimplexNoise({
      frequency: 0.07,
      max: 1,
      min: 0,
      octaves: 4
    });

    const noiseOres = new FastSimplexNoise({
      frequency: 0.01,
      max: 1,
      min: 0,
      octaves: 8
    });

    const grid = [];
    const gridMid = [];
    const h = 55;
    const w = 55;

    let min = 1, max = 0;
    for (let x = 0; x < h; x++) {
      grid[x] = [];
      gridMid[x] = [];
      for (let y = 0; y < w; y++) {
        grid[x][y] = noiseBase.in2D(x, y) > 0.62 ? Blocks.water.tile : Blocks.sand.tile;
        gridMid[x][y] = 0;

        if (grid[x][y] !== Blocks.sand.tile) {
          continue;
        }
        const v = noiseTrees.in2D(x, y);
        min = Math.min(min, v);
        max = Math.max(max, v);
        if (v > 0.5 && v < 0.52) {
          gridMid[x][y] = Blocks.tree.tile;
        }

        const o = noiseOres.in2D(x, y);
        if (o > 0.5 && o < 0.503) {
          gridMid[x][y] = Blocks.coal_ore.tile;
        }
        else if (o > 0.6 && o < 0.603) {
          gridMid[x][y] = Blocks.stone_ore.tile;
        }
      }
    }

    const getNeighbours = (x, y) => {
      const l = x == 0 ? Blocks.clear.tile : grid[y][x - 1];
      const r = x >= grid[0].length - 1 ? Blocks.clear.tile : grid[y][x + 1];
      const t = y <= 0 ? Blocks.clear.tile : grid[y - 1][x];
      const b = y >= grid.length - 1 ? Blocks.clear.tile : grid[y + 1][x];
      return {
        l, r, t, b
      };
    };

    for (let y = 0; y < h; y++) {
      const row = grid[y];
      for (let x = 0; x < row.length; x++) {
        const cell = grid[y][x];
        if (cell !== Blocks.water.tile) {
          continue;
        }
        const {l, r, t, b} = getNeighbours(x, y);
        if (l === Blocks.sand.tile && t === Blocks.sand.tile) {
          grid[y][x] = Blocks.water_tl.tile;
        }
        if (r === Blocks.sand.tile && t === Blocks.sand.tile) {
          grid[y][x] = Blocks.water_tr.tile;
        }
        if (l === Blocks.sand.tile && b === Blocks.sand.tile) {
          grid[y][x] = Blocks.water_bl.tile;
        }
        if (r === Blocks.sand.tile && b === Blocks.sand.tile) {
          grid[y][x] = Blocks.water_br.tile;
        }
      }
    }

    const flatten = arr => arr.reduce((acc, el) => {
      return [...acc, ...el];
    }, []);

    const lol = {
      "height":h,
      "width": w,
      "layers":[{
        "data": flatten(grid),
        "height": h,
        "name":"base",
        "opacity":1,
        "type":"tilelayer",
        "visible": true,
        "width": w,
        "x":0,
        "y":0
      }, {
        "data": flatten(gridMid),
        "height": h,
        "name":"mid",
        "opacity": 1,
        "type":"tilelayer",
        "visible": true,
        "width": w,
        "x":0,
        "y":0
      }],
      "nextobjectid":1,
      "orientation":"orthogonal",
      "renderorder":"right-down",
      "tileheight":32,
      "tilewidth":32,
      "tilesets":[{
        "columns":16,
        "firstgid":1,
        "image":"tiles.png",
        "imageheight":512,
        "imagewidth":512,
        "margin":0,
        "name":"tiles",
        "spacing":0,
        "tilecount":256,
        "tileheight":32,
        "tilewidth":32
      }, {
        "columns":16,
        "firstgid":257,
        "image":"mid.png",
        "imageheight":512,
        "imagewidth":512,
        "margin":0,
        "name":"mid",
        "spacing":0,
        "tilecount":256,
        "tileheight":32,
        "tilewidth":32
      }],
      "version":1,
    };

    game.load.tilemap("world", null, lol, Phaser.Tilemap.TILED_JSON);

    const map = this.map = game.add.tilemap("world");
    map.addTilesetImage("tiles", "tiles");

    const layer = this.layer = map.createLayer("base");
    map.addTilesetImage("mid", "mid");
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

  getTileXY (x, y) {
    return this.getTile(x / 32 | 0, y / 32 | 0);
  }

  getTile (x, y) {
    const layers = this.map.layers;
    const baseLayer = layers[0].data;
    const midLayer = layers[1].data;
    if (x < 0 || x > baseLayer[0].length ||
        y < 0 || y > baseLayer.length) {
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
