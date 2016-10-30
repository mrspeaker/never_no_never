# Never, No Never,

## build

* `npm install`
* `npm start`

To test the level gen:

* `npm run test`

Browse on localhost:9966

## TODO

* [bug] pathfinding recalc on player goes wrong way for first block
* [bug] baddies stuck when attacking
* [bug] knockback direction always the same (up left or down right)
* [bug] vehicles lose tile collisions (after crafting?) - multi vehicle?
* Try tap baddies to attack (auto weapon, but not auto attack)
* Try swip to move (raycast swipe strenght, move to free spot)
* Add a "town"
* some way to leave vehicle
* craftings
  * placable/usable Segway
  * add saltpeter + coal -> gunpowder
  * add gunpowder + wood -> fireworks
  * add gunpowder + stone? iron? -> projectiles
  * armor
* Juice
  * add skids
  * one-up on floppy get
  * add splats
  * tween when auto-switch items
  * explode vehicle when leave
  * clouds float overhead
* progression
  * floppies per day
  * find a recipe, unlock
  * store progress/stats/unlocks
  * on died, show progress hp
  * on died, "surived for" time.
  * stats on splash
  * reset unlocks for testing
* add a tower-defense module
* zombie roaming state
* roam on player death
* drops from mining
* drops from zombie kills
* add death screen (or modal)
* Move blocks and items from flyweight to actual objects
  * cellular autonoma ability
  * show un-obtained resources in crafting.
* system for player -> tool -> target block
* [ref] fix state machine: don't allow bad states
* [bug] invalidate/recalc paths on build, destroy.
* [bug] Errors when destroying particle emitters after screen swap
* [bug] dead in vehicle, vehicle still visible/usable
* [bug] not using damage tools when in vehicle
