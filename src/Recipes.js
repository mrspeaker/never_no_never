export type Recipe = {
  name: string,
  source: Array<{item: string, amount: Number}>,
  yields: Array<{item: string, amount: Number}>,
  description: string
};

const Recipes: Array<Recipe> = [{
  name: "wood_pick",
  source: [{item: "wood", amount: 2}],
  yields: [{item: "wood_pick", amount: 4}],
  description: `
    a wood pick is a super
    duper thing to have.
    -
    digs rocks, cuts trees.`
},{
  name: "wood_sword",
  source: [{item: "wood", amount: 2}],
  yields: [{item: "wood_sword", amount: 4}],
  description: `
    a pointy stick. It can be formed
    by sharpening two bits of wood.
    -
    better than nothing, i suppose.`
},{
  name: "stone_pick",
  source: [{item: "wood", amount: 1}, {item: "stone", amount: 1}],
  yields: [{item: "stone_pick", amount: 6}],
  description: `
    upgrade! stone picks
    are stronger and better.
    -
    better than wood.`
},{
  name: "stone_sword",
  source: [{item: "wood", amount: 1}, {item: "stone", amount: 1}],
  yields: [{item: "stone_sword", amount: 5}],
  description: `
    a stone sword cuts like
    a knife.
    -
    Cuts like a stone knife.`
},{
  name: "fireworks",
  source: [{item: "coal", amount: 1}, {item: "saltpeter", amount: 1}],
  yields: [{item: "fireworks", amount: 5}],
  description: `
    firepower! fireworks are
    pretty, but also dangerous
    -
    do not aim directly
    at anybody.`
},{
  name: "sand",
  source: [{item: "coal", amount: 1}],
  yields: [{item: "sand", amount: 3}],
  description: `it's sand.

  Covers water`
},{
  name: "brick",
  source: [{item: "stone", amount: 1}],
  yields: [{item: "brick", amount: 5}],
  description: `it's brick.

  build a wall`
},{
  name: "tire",
  source: [{item: "rubber", amount: 2}],
  yields: [{item: "tire", amount: 1}],
  description: `tires!
  not really useful`
},{
  name: "segway",
  source: [{item: "tire", amount: 2}, {item: "iron", amount: 2}],
  yields: [{item: "segway", amount: 1}],
  description: `the segway!
    now you're travelling with style.
    -
    hold to accelerate.
    left or right to turn.`
},{
  name: "iron_pick",
  source: [{item: "wood", amount: 1}, {item: "iron", amount: 1}],
  yields: [{item: "iron_pick", amount: 6}],
  description: `
    Iron is like the best.
    Iron picks are super strong`
},{
  name: "iron_sword",
  source: [{item: "wood", amount: 1}, {item: "iron", amount: 1}],
  yields: [{item: "iron_sword", amount: 6}],
  description: `
    Iron swords are not
    to be trifled with.`
},{
  name: "wings",
  source: [{item: "wood", amount: 1}],
  yields: [{item: "wings", amount: 1}],
  description: `the wings!
    now you're flying.
    -
    hold to accelerate.
    up/down to take off.
    left or right to turn.`
}];

export default Recipes;
