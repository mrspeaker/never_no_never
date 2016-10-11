export default {
  "clear": { name: "clear", tile: -1, walk: true },
  "empty": { name: "empty", tile: 0, walk: true },
  "tree": { name: "tree", tile: 257, mine: true, hardness: 10, yields: [{name: "wood", amount: 1}]},
  "coal_ore": { name: "coal_ore", tile: 258, mine: true, hardness: 20, yields: [{name: "coal", amount: 1}]},
  "stone_ore": { name: "stone_ore", tile: 259, mine: true, hardness: 50, yields: [{name: "stone", amount: 1}]},
  "water": { name: "water", tile: 2, mine: false },
  "water_tl": { name: "water_tl", tile: 3, mine: false },
  "water_tr": { name: "water_tr", tile: 4, mine: false },
  "water_bl": { name: "water_bl", tile: 19, mine: false },
  "water_br": { name: "water_br", tile: 20, mine: false },

  "sand": { name: "sand", tile: 1, mine: false, walk: true },
  "brick": { name: "brick", tile: 260, mine: true, hardness: 10, yields: [{name: "stone", amount: 1}] },

  getByTileId: function (id) {
    for (let e in this) {
      if (this[e].tile && this[e].tile === id) {
        return this[e];
      }
    }
    return this.empty;
  }
};
