export default {
  "clear": { name: "clear", tile: -1, walk: true },
  "empty": { name: "empty", tile: 0, walk: true },
  "tree": { name: "tree", tile: 257, mine: true, yields: [{name: "wood", amount: 1}]},
  "coalOre": { name: "coalOre", tile: 258, mine: true, yields: [{name: "coal", amount: 1}]},
  "stoneOre": { name: "stoneOre", tile: 259, mine: true, yields: [{name: "stone", amount: 1}]},
  "water": { name: "water", tile: 2, mine: false },
  "sand": { name: "sand", tile: 1, mine: false, walk: true },

  getByTileId: function (id) {
    for (let e in this) {
      if (this[e].tile && this[e].tile === id) {
        return this[e];
      }
    }
    return this.empty;
  }
};
