import Blocks from "./Blocks";
import FastSimplexNoise from "fast-simplex-noise";

export default function () {
  const noiseBase = new FastSimplexNoise({
    frequency: 0.09,
    max: 1,
    min: 0,
    octaves: 1
  });

  const noiseTrees = new FastSimplexNoise({
    frequency: 0.2,
    max: 1,
    min: 0,
    octaves: 3
  });

  const noiseTrees2 = new FastSimplexNoise({
    amplitude: 0.1,
    frequency: 0.1,
    max: 1,
    min: 0,
    octaves: 1
  });

  const noiseOres = new FastSimplexNoise({
    frequency: 0.01,
    max: 1,
    min: 0,
    octaves: 8
  });

  const grid = [];
  const gridMid = [];
  const h = 100;
  const w = 100;

  let min = 1, max = 0;
  for (let x = 0; x < h; x++) {
    grid[x] = [];
    gridMid[x] = [];
    for (let y = 0; y < w; y++) {
      grid[x][y] = noiseBase.in2D(x, y) > 0.7 ? Blocks.water.tile : Blocks.sand.tile;
      gridMid[x][y] = 0;

      if (grid[x][y] !== Blocks.sand.tile) {
        continue;
      }
      const v = noiseTrees.in2D(x, y);
      if (v > 0.7) {
        gridMid[x][y] = Blocks.tree.tile;
      }

      const t2 = noiseTrees2.in2D(x, y);
      if (t2 > 0.9) {
        gridMid[x][y] = Blocks.rubber_sap.tile;
      }

      const o = noiseOres.in2D(x, y);
      if (o > 0.4 && o < 0.404) {
        gridMid[x][y] = Blocks.stalegmite.tile;
      }
      else if (o > 0.5 && o < 0.503) {
        gridMid[x][y] = Blocks.coal_ore.tile;
      }
      else if (o > 0.6 && o < 0.606) {
        gridMid[x][y] = Blocks.stone_ore.tile;
      }
      else if (o > 0.7 && o < 0.705) {
        gridMid[x][y] = Blocks.iron_ore.tile;
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
  return lol;
}
