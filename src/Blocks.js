export default {
  "clear": { name: "clear", tile: -1, walk: true },
  "empty": { name: "empty", tile: 0, walk: true },
  "manhole": { name: "manhole", tile: 259 + 16, walk: true },
  "tombstone": { name: "tombstone", tile: 262, walk: true },
  "tree": { name: "tree", tile: 257, mine: true, hardness: 10, yields: [{name: "wood", amount: 1}], hp: 1},
  "tree_hole": { name: "tree", tile: 257 + 17, walk: true},
  "coal_ore": { name: "coal_ore", tile: 258, mine: true, hardness: 20, yields: [{name: "coal", amount: 5}], hp: 5},
  "stone_ore": { name: "stone_ore", tile: 259, mine: true, hardness: 50, yields: [{name: "stone", amount: 2}], hp: 10},
  "iron_ore": { name: "iron_ore", tile: 279, mine: true, hardness: 50, yields: [{name: "iron", amount: 2}], hp: 25},
  "rubber_sap": { name: "rubber_sap", tile: 264, mine: true, hardness: 15, yields: [{name: "rubber", amount: 3}, {name: "wood", amount: 1}], hp: 10},
  "stalegmite": { name: "stalegmite", tile: 280, mine: true, hardness: 20, yields: [{name: "saltpeter", amount: 3}], hp: 25},
  "water": { name: "water", tile: 2, },
  "water_tl": { name: "water_tl", tile: 3 },
  "water_tr": { name: "water_tr", tile: 4 },
  "water_bl": { name: "water_bl", tile: 19 },
  "water_br": { name: "water_br", tile: 20 },

  "sand": { name: "sand", tile: 1, walk: true },
  "brick": { name: "brick", tile: 276, mine: true, hardness: 10, yields: [{name: "stone", amount: 1}] },

  "mountain": { name: "mountain", tile: 50 },

  // TODO: Get this out of here.
  getByTileId: function (id) {
    for (let e in this) {
      if (this[e].tile && this[e].tile === id) {
        return this[e];
      }
    }
    return this.empty;
  }
};
