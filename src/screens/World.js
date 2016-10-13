const Phaser = window.Phaser;

import Map from "../Map";
import Controls from "../Controls";
import Player from "../entities/Player";
import Inventory from "../Inventory";
import Zombie from "../entities/Zombie";
import Blocks from "../Blocks";
import Items from "../Items";
import Crafting from "./Crafting";
import Title from "../Title";
import HUD from "../HUD";
import Tween from "../Tween";

class World extends Phaser.State {

  mode = "getready";
  _cheat = false;

  reset () {
    this.game.state.start("Splash");
  }

  create (game) {
    game.stage.backgroundColor = "#343436";

    Tween.game = game;

    this.world = new Map(game);
    this.perma = game.add.group();

    // Position the player and manhole
    let {x, y} = this.world.findEmptySpot();
    this.world.setTile(Blocks.manhole.tile, x, y);
    const above = this.world.getTile(x, y - 1);
    const right = this.world.getTile(x + 1, y);
    if (above.base.name === "sand" && above.mid.name === "clear") {
      y -= 1;
    }
    else if (right.base.name === "sand" && right.mid.name === "clear") {
      x += 1;
    }
    this.player = new Player(game, x, y, ::this.playerHurt, ::this.playerDied);
    if (this.player.y > 0) { this.player.y -= 1; } // 1px above the manhole.

    // Focus camera slightly off center, to make up for bottom non-touch area
    this.cameraTarget = game.add.sprite(0, 0, "peeps");
    this.cameraTarget.alpha = 0;

    this.controls = new Controls(game);
    this.inventory = new Inventory(game, ::this.player.switchTool);
    // this.inventory.addItem("wood_pick", 10);
    // this.inventory.addItem("wood_sword", 10);
    // this.inventory.addItem("brick", 10);

    const mobs = this.mobs = game.add.group();
    for (let i = 0; i < 7; i++) {
      const {x, y} = this.world.findEmptySpot();
      mobs.add(new Zombie(game, x, y));
    }

    const title = Title(game, "bmax!", 36, 12, 12).font;
    const subtitle = Title(game, "0123456789!? You bet.", 9, 4, 36, true).font;

    this.HUD = new HUD(game);

    this.craftingScreen = new Crafting(game, this);

    this.ui = {
      title,
      subtitle,
    };

    game.camera.focusOn(this.player);
    game.camera.y += 300;
    game.camera.follow(this.cameraTarget, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
  }

  playerHurt (health, maxHealth) {
    this.HUD.setHealth(health, maxHealth);
  }

  playerDied () {
    if (this.player.died) {
      return;
    }
    this.world.setTileXY(Blocks.tombstone.tile, this.player.x, this.player.y);
    this.player.died = {
      time: Date.now(),
      onDead: ::this.reset
    };
  }

  toggleCheat () {
    this._cheat = !this._cheat;
    return this._cheat;
  }

  onPathWalked (xt, yt) {
    const {ui, world, player, mobs} = this;
    ui.subtitle.text = `${xt},${yt}`;

    const tile = world.map.layers[1].data[yt][xt];
    const block = Blocks.getByTileId(tile.index);
    if (block.mine) {
      // Closest zombie chase player
      let done = false;
      mobs.forEach(m => {
        if (done) return;
        const dist = Phaser.Math.distance(m.x, m.y, player.x, player.y);
        if (dist < 300) {
          done = true;
          world.makePath(m, player.x, player.y);
        }
      });

      const tool = this.inventory.holding();
      const toolEfficiency = Items[tool.item].efficiency || 1;

      // TODO: handle nicer: player -> tool -> target block
      player.mineTile(block, tile, toolEfficiency, () => {

        world.setTile(
          tile.index === Blocks.tree.tile ? Blocks.tree_hole.tile :
          Blocks.clear.tile
          , xt, yt);

        block.yields.forEach(({name, amount}) => {
          this.inventory.addItem(name, amount);
        });

        if (toolEfficiency > 1) {
          tool.addItem(-1);
        }

      });
    } else {
      player.stop();
    }
  }

  setMode (mode) {
    this.mode = mode;
    const isCrafting = this.mode == "crafting";
    this.craftingScreen.visible = isCrafting;
  }

  killZombie (m) {
    const {player} = this;
    const holding = this.inventory.holding();
    const oldX = m.x;
    const oldY = m.y;

    let close = true;
    let x = -1;
    let y = -1;
    while (close) {
      const spot = this.world.findEmptySpot();
      x = spot.x;
      y = spot.y;
      const dist = Phaser.Math.distance(x * 32, y * 32, player.x, player.y);
      if (dist > 400) {
        close = false;
      }
    }
    m.reset(x, y);
    this.world.makePath(m, m.x, m.y);
    player.state.set("idle");
    holding.addItem(-1);
    const corpse = this.perma.create(oldX, oldY, "peeps");
    corpse.frame = Math.random() < 0.5 ? 30 : 31;
  }


  update (game) {
    const {mode, player, cameraTarget, controls} = this;

    controls.update();

    cameraTarget.x = player.x + 10;
    cameraTarget.y = player.y + 50;

    switch (mode) {
    case "getready":
      this.mode = "exploring";
      break;
    case "exploring":
      this.updateExploring(game);
      break;
    case "crafting":
      this.craftingScreen.update(game);
      break;
    }

    this.doMobStrategy();
    this.detectMobCollisions();

  }

  doMobStrategy () {
    // Randomly run towards player
    if (Math.random() < 0.005) {
      const {mobs, player} = this;
      const mob = mobs.getRandom();
      this.world.makePath(mob, player.x, player.y);
    }
  }

  detectMobCollisions () {
    const {mobs, player} = this;

    mobs.forEach(m => {
      const dist = Phaser.Math.distance(m.x, m.y, player.x, player.y);

      if (dist < 200) {
        this.world.makePath(m, player.x, player.y);
      }

      if (dist < 60) {
        const holding = this.inventory.holding();
        const damage = Items[holding.item].damage;
        if (damage) {
          // Hmm, ok... attacking needs to be a state.
          // else the mining/walking anim will quickly override this
          player.animations.play("attack");
        }

        if (dist < 32) {
          this.collideWithMob(m);
        }
      }
    });
  }

  collideWithMob (m) {
    const {player} = this;
    const xd = player.x - m.x;
    const yd = player.y - m.y;
    const knockH = Math.abs(xd) > Math.abs(yd);

    const holding = this.inventory.holding();
    const damage = Items[holding.item].damage;
    if (damage) {
      if (m.health.damage(damage) <= 0) {
        this.killZombie(m);
      }
      else {
        const tweenH = {x: m.x + Math.sign(xd) * -64};
        const tweenV = {y: m.y + Math.sign(yd) * -64};
        Tween.to(m, knockH ? tweenH : tweenV, 150);
      }
      return;
    }

    // Zombie got the player
    if (player.health.damage(1) > 0) {
      if (knockH) {
        player.x += Math.sign(xd) * 16;
      } else {
        player.y += Math.sign(yd) * 16;
      }
    }

  }

  walkToThenAct (worldX, worldY) {
    // Walk to spot
    this.world.makePath(
      this.player,
      worldX,
      worldY,
      () => {
        this.onPathWalked(worldX / 32 | 0, worldY / 32 | 0);
      }
    );
  }

  placeBlockAt (block, worldX, worldY) {
    const {base, mid} = this.world.getTileXY(worldX, worldY);
    if (mid.name === "clear" && base.name === "sand") {
      this.world.setTileXY(block, worldX, worldY);
    }
  }

  updateExploring (game) {
    const {controls, inventory} = this;
    const {justPressed, x, y, worldX, worldY} = controls;

    if (justPressed) {
      const bottomOfTouchable = inventory.ui.box.cameraOffset.y - 5;
      if (y > bottomOfTouchable - 5) return;

      // Crafting button - TODO: factorize it.
      if (y < 70 && x > game.width - 70) {
        this.setMode("crafting");
        return;
      }

      this.player.handleClick(
        this.walkToThenAct.bind(this, worldX, worldY),
        this.placeBlockAt.bind(this, Blocks.brick.tile, worldX, worldY)
      );

    }
  }

}

export default World;
