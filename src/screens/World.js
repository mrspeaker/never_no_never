const Phaser = window.Phaser;

import Map from "../Map";
import Controls from "../Controls";
import Player from "../entities/Player";
import Inventory from "../Inventory";
import Zombie from "../entities/Zombie";
import Floppy from "../entities/Floppy";
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
    // game.stage.disableVisibilityChange = true;
    this.camera.flash(0x0095E9, 500);

    Tween.game = game;

    this.world = new Map(game);

    this.groundTarget = game.add.sprite(0, 0, "icons");
    this.groundTarget.frame = 21;
    //this.groundTarget.blendMode = window.PIXI.blendModes.DARKEN;
    this.groundTarget.alpha = 0.5;

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

    Array.from(new Array(10), () => {
      const spot = this.world.findEmptySpot();
      new Floppy(game, spot.x * 32, spot.y * 32);
    });

    // Focus camera slightly off center, to make up for bottom non-touch area
    this.cameraTarget = game.add.sprite(0, 0, "peeps");
    this.cameraTarget.alpha = 0;

    this.controls = new Controls(game);
    this.inventory = new Inventory(game, ::this.player.switchTool);
    // this.inventory.addItem("coal", 20);
    // this.inventory.addItem("wood_sword", 10);
    // this.inventory.addItem("sand", 10);

    const mobs = this.mobs = game.add.group();
    for (let i = 0; i < 6; i++) {
      const {x, y} = this.getMobSpawnPoint();
      mobs.add(new Zombie(game, x, y, this));
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

    this.setMode("exploring");

    this.night = this.game.add.bitmapData(this.game.width, this.game.height);
    const light = this.game.add.image(0, 0, this.night);
    light.blendMode = Phaser.blendModes.MULTIPLY;
    light.fixedToCamera = true;

  }

  getMobSpawnPoint () {
    const {world, player} = this;
    const CLOSE_PIXELS = 400;
    let close = true;
    let x = -1;
    let y = -1;
    while (close) {
      const spot = world.findEmptySpot();
      x = spot.x;
      y = spot.y;
      const dist = Phaser.Math.distance(x * 32, y * 32, player.x, player.y);
      if (dist > CLOSE_PIXELS) {
        close = false;
      }
    }
    return {x, y};
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
    }
  }

  setMode (mode) {
    this.mode = mode;
    const isCrafting = this.mode == "crafting";
    this.craftingScreen.visible = isCrafting;
  }

  killZombie () {
    const {player} = this;
    const holding = this.inventory.holding();
    player.state.set("idle");
    holding.addItem(-1);
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

    this.updateNight();
  }

  updateNight () {
    const {night} = this;

    const dark = ((Math.sin(Date.now() / 10000) + 1) / 2) * 255 | 0;
    const dark2 = dark > 100 ? dark : Math.min(255, dark + 60);

    night.context.fillStyle = `rgb(${dark}, ${dark}, ${dark})`;
    night.context.fillRect(0, 0, this.game.width, this.game.height);

    night.context.beginPath();
    night.context.fillStyle = `rgb(${dark2}, ${dark2}, ${dark2})`;
    night.context.arc(
      this.player.x - this.camera.x + 16,
      this.player.y - this.camera.y + 16,
      45,
      100, 0, Math.PI*2);
    night.context.fill();

    night.dirty = true;
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
        const holding = this.inventory.holding();
        const damage = Items[holding.item].damage;

        m.isClose = true;
        this.world.makePath(m, player.x, player.y);

        const proj = this.inventory.projectiles();
        if (proj && this.player.shoot(m)) {
          this.inventory.useItem(proj.item, 1);
        }

        if (dist < 60) {

          if (damage) {
            // Hmm, ok... attacking needs to be a state.
            // else the mining/walking anim will quickly override this
            player.animations.play("attack");
          }

          if (dist < 32) {
            this.collideWithMob(m);
          }
        }
      } else {
        m.isClose = false;
      }

    });
  }

  collideWithMob (m) {
    const {player} = this;

    const holding = this.inventory.holding();
    const damage = Items[holding.item].damage;

    if (damage) {
      if (m.health.damage(damage, player) <= 0) {
        this.killZombie(m);
      }
    }
    else {
      player.health.damage(1, m);
    }

  }

  walkToThenAct (worldX, worldY) {
    this.groundTarget.x = (worldX / 32 | 0) * 32;
    this.groundTarget.y = (worldY / 32 | 0) * 32;

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
    if (mid.name === "clear") {
      if (block === Blocks.sand.tile) {
        this.world.setTileXY(block, worldX, worldY, 0);
      }
      else if (base.name === "sand") {
        this.world.setTileXY(block, worldX, worldY);
      }
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
        inventory.holding(),
        this.walkToThenAct.bind(this, worldX, worldY),
        (block) => this.placeBlockAt(block, worldX, worldY)
      );

    }
  }

}

export default World;
