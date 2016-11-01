# Never, No Never,

## build

* `npm install`
* `npm start`

To test the level gen:

* `npm run test`

Browse on localhost:9966

## TODO

* [bug] baddies stuck when attacking. they should own you.
* [bug] pathfinding recalc on player goes wrong way for first block
* [bug] knockback direction always the same (up left or down right)
* [bug] vehicles lose tile collisions (after crafting?) - multi vehicle?
* [bug] auto-tools buggy... stop working
* [bug] auto-tools don't choose most efficient
* [bug] dead in vehicle, vehicle still visible/usable
* "arm" projectiles... tap once to arm, once to disarm.
* add attack chances (not hit always).
* knockback when attack
* attack one at a time (min re-attack time)
* Try tap baddies to attack (auto weapon, but not auto attack)
  * maybe, defend yourself by default, tap to attack.
* Try swipe to move (raycast swipe strenght, move to free spot)
* Add a "town"
* Add a road or a bridge
* craftings
  * Add segway when crafted... tap on/off!
  * add saltpeter + coal -> gunpowder? + x = fireworks
  * add gunpowder + stone? iron? -> projectiles
  * armor
* Juice
  * add skids
  * add splats
  * tween when auto-switch items
  * explode vehicle when leave
  * clouds float overhead: mechanic! hard to see.
* progression
  * floppies per day
  * store progress/stats/unlocks
  * on died, show progress hp
  * on died, showed unlocks
  * on died, "surived for" time.
  * stats on splash
  * reset unlocks for testing
* add a tower-defense module
* mining anim with tool
* [bug] passing over unwalkable area kills close zombie pathfinding perf
* [bug] after placing last placeable, clicking doesnt walk.
* zombie roaming state
* drops from mining
* drops from zombie kills
* add death screen (or modal)
* Move blocks and items from flyweight to actual objects
  * cellular autonoma ability
  * show un-obtained resources in crafting.
* system for player -> tool -> target block
* [bug] invalidate/recalc paths on build, destroy.
* [bug] Errors when destroying particle emitters after screen swap
* [bug] not auto-selecting damage tools when in vehicle
