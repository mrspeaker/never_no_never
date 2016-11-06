# Never, No Never,

## build

* `npm install`
* `npm start`

To test the level gen:

* `npm run test`

Browse on localhost:9966

## TODO

* intro explanation...
  * "start" button at base of ladder... click and player path-finds to ladder, then climbs
  * glowing floppy? make it obvious to click it.
  * floppy screen opens, explains... how to punch? need to find floppies? How to open craft.
* Death screen
  * "survived for" time.
* Treat all entities the same... dispatch behaviour
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
  * store progress/stats/unlocks
  * stats on splash
  * reset unlocks for testing
* add a tower-defense module
* mining anim with tool
* zombie roaming state
* drops from mining
* drops from zombie kills
* add food
* Move blocks and items from flyweight to actual objects
  * cellular autonoma ability
  * show un-obtained resources in crafting.
* system for player -> tool -> target block

## Bugs

* crafting should be paused game
* zombie sometimes stays after player dead
* screen close button inconsistent
* crafting menu getting "backgrounded"? weird alpha.
* multi vehicle when switching / crafting in vehicle
* times (day time) based on Date.now()! use game time.
* knockback direction always the same (up left or down right)
* knockback knocksback into solid tiles.
* auto-tools buggy... stops working
* auto-tools don't choose most efficient
* dead in vehicle, vehicle still visible/usable
* mine from several blocks away
* passing over unwalkable area kills close zombie pathfinding perf
* after placing last placeable, clicking doesnt walk.
* invalidate/recalc paths on build, destroy.
* Errors when destroying particle emitters after screen swap
* not auto-selecting damage tools when in vehicle

---

* axis of skill progression: give feedback.
