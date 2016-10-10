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
    // Generate 2D noise in a 1024x768 grid, scaled to [0, 255]
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
        grid[x][y] = noiseBase.in2D(x, y) > 0.62 ? 2 : 1;
        gridMid[x][y] = 0;

        if (grid[x][y] !== 1) {
          continue;
        }
        const v = noiseTrees.in2D(x, y);
        min = Math.min(min, v);
        max = Math.max(max, v);
        if (v > 0.5 && v < 0.52) {
          gridMid[x][y] = 257;
        }

        const o = noiseOres.in2D(x, y);
        if (o > 0.5 && o < 0.504) {
          gridMid[x][y] = 258;
        }
        else if (o > 0.6 && o < 0.601) {
          gridMid[x][y] = 259;
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
