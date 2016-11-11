//@flow

type Data = {
  dailyHP: number,
  gameHP: number,
  lifetimeHP: number,
  permanentUnlocks: Array<any>,
  gameCraftUnlocks: Array<any>,
  dailyCraftUnlocks: number,
  recipes: any,
  haveEverFoundRecipe: boolean,
  inventory: Object
};

export default ({
  dailyHP: 0,
  gameHP: 0,
  lifetimeHP: 0,
  permanentUnlocks: [],
  gameCraftUnlocks: [],
  dailyCraftUnlocks: 0,
  recipes: {
  },
  haveEverFoundRecipe: false,
  inventory: {}
}: Data);
