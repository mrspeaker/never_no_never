const Recipes = [{
  name: "wood_pick",
  source: [{item: "wood", amount: 2}],
  yields: [{item: "wood_pick", amount: 4}]
},{
  name: "wood_sword",
  source: [{item: "wood", amount: 2}],
  yields: [{item: "wood_sword", amount: 4}]
},{
  name: "stone_pick",
  source: [{item: "wood", amount: 1}, {item: "stone", amount: 1}],
  yields: [{item: "stone_pick", amount: 6}]
},{
  name: "stone_sword",
  source: [{item: "wood", amount: 1}, {item: "stone", amount: 1}],
  yields: [{item: "stone_sword", amount: 5}]
},{
  name: "iron_pick",
  source: [{item: "wood", amount: 1}, {item: "iron", amount: 1}],
  yields: [{item: "iron_pick", amount: 6}]
},{
  name: "iron_sword",
  source: [{item: "wood", amount: 1}, {item: "iron", amount: 1}],
  yields: [{item: "iron_sword", amount: 6}]
},{
  name: "sand",
  source: [{item: "coal", amount: 1}],
  yields: [{item: "sand", amount: 3}]
},{
  name: "brick",
  source: [{item: "stone", amount: 1}],
  yields: [{item: "brick", amount: 5}]
},{
  name: "fireworks",
  source: [{item: "coal", amount: 1}, {item: "saltpeter", amount: 1}],
  yields: [{item: "fireworks", amount: 5}]
},{
  name: "tire",
  source: [{item: "rubber", amount: 2}],
  yields: [{item: "tire", amount: 1}]
},{
  name: "segway",
  source: [{item: "tire", amount: 2}, {item: "iron", amount: 2}],
  yields: [{item: "segway", amount: 1}]
}];

export default Recipes;
