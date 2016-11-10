import Phaser from "phaser";
import Map from "../Map";
import Controls from "../Controls";
import Player from "../entities/Player";
import Inventory from "../Inventory";
import Zombie from "../entities/Zombie";
import Cow from "../entities/Cow";
import Floppy from "../entities/Floppy";
import Plane from "../entities/Plane";
import Segway from "../entities/Segway";
import Blocks from "../Blocks";
import Items from "../Items";
import Overlays from "./overlays/";
import HUD from "../HUD";
import Tween from "../Tween";
import DayTime from "../DayTime";
import Particles from "../Particles";
import State from "../State";
import data from "../data";
import shaders from "../shaders";

class World extends Phaser.State {

  _cheat = false;

  reset () {
    this.stats.dailyHP = 0;
    this.stats.gameCraftUnlocks = [];
    this.stats.dailyCraftUnlocks = [];
    this.serialize();
    this.game.state.start("Splash");
  }

  create (game) {

    //game.time.advancedTiming = true;
    //game.time.desiredFps = 60;
    //game.time.slowMotion = 10.0;

    this.stayte = new State("getready");
    this.stats = {
      dailyHP: 0,
      gameHP: 0,
      lifetimeHP: 0,
      dailyCraftUnlocks: [],
      permanentUnlocks: [],
      gameCraftUnlocks: []
    };

    game.stage.backgroundColor = "#343436";

    this.filter = new Phaser.Filter(game, shaders.green.uniforms, shaders.green.frag.split("\n"));

    //game.stage.disableVisibilityChange = true;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.camera.flash(0x000000, 2000);

    DayTime.wakeUp();

    Tween.game = game;
    this.maingroup = game.add.group();
    this.map = new Map(game);
    this.groundTarget = game.add.sprite(0, 0, "icons");
    this.groundTarget.frame = 31;

    this.maingroup.add(this.map.layerz.base);
    this.maingroup.add(this.groundTarget);
    this.maingroup.add(this.map.layerz.mid);

    this.perma = game.add.group();
    this.maingroup.add(this.perma);

    // Position the player and manhole
    let {x, y} = this.map.findEmptySpotAtCenter();
    this.map.setTile(Blocks.manhole.tile, x, y);
    const above = this.map.getTile(x, y - 1);
    const right = this.map.getTile(x + 1, y);
    if (above.base.name === "sand" && above.mid.name === "clear") {
      y -= 1;
    }
    else if (right.base.name === "sand" && right.mid.name === "clear") {
      x += 1;
    }

    this.controls = new Controls(game);
    this.player = new Player(game, x, y, ::this.playerHurt, ::this.playerDied);
    this.maingroup.add(this.player);
    this.protagonist = this.player;

    this.particles = new Particles(game, this.player.x, this.player.y, 1);
    this.particles.emitting = false;
    this.maingroup.add(this.particles);

    this.floppies = game.add.group();
    Array.from(new Array(12), () => {
      const spot = this.map.findEmptySpotFurtherThan(this.protagonist, 100);
      this.floppies.add(new Floppy(game, spot.x * 32, spot.y * 32));
    });
    this.maingroup.add(this.floppies);

    // Focus camera slightly off center, to make up for bottom non-touch area
    this.cameraTarget = game.add.sprite(0, 0, "peeps");
    this.cameraTarget.alpha = 0;

    const mobs = this.mobs = game.add.group();
    for (let i = 0; i < 30; i++) {
      const {x, y} = this.map.findEmptySpotFurtherThan(this.protagonist);
      mobs.add(new Zombie(game, x, y, this));
    }
    this.maingroup.add(this.mobs);

    const animals = this.animals = game.add.group();
    for (let i = 0; i < 100; i++) {
      const {x, y} = this.map.findEmptySpotFurtherThan(this.protagonist, 150);
      animals.add(new Cow(game, x, y, this));
    }
    this.maingroup.add(this.animals);

    // TODO: all vehicles updating, all the time.
    this.segway = new Segway(game, this.protagonist.x, this.protagonist.y, this.controls);
    this.segway.visible = false;
    this.maingroup.add(this.segway);

    // TODO: all vehicles updating, all the time.
    this.plane = new Plane(game, this.protagonist.x, this.protagonist.y, this.controls);
    this.plane.visible = false;
    this.maingroup.add(this.plane);

    /*this.night = this.game.add.bitmapData(this.game.width, this.game.height);
    const light = this.game.add.image(0, 0, this.night);
    light.blendMode = Phaser.blendModes.MULTIPLY;
    light.fixedToCamera = true;*/

    this.inventory = new Inventory(game, this.switchedTool.bind(this));
    this.player.inventory = this.inventory;

    if (DayTime.firstDayOnTheJob) {
      this.deserialize(false);
      DayTime.addDayOverListener(() => {
        this.stayte.set("dayOver");
      });
      this.stats.gameHP = 0;
    } else {
      this.deserialize(true);
    }
    this.stats.dailyCraftUnlocks = 0;
    this.stats.dailyHP = 0;

    // this.inventory.addItem("coal", 20);
    // this.inventory.addItem("wood_sword", 10);
    //this.inventory.addItem("wood", 3);
    //this.inventory.addItem("wings", 1);
    //this.inventory.addItem("segway", 1);

    this.HUD = new HUD(game);

    this.overlays = new Overlays(game, this);

    game.camera.focusOn(this.protagonist);
    game.camera.y += 2000;
    game.camera.follow(this.cameraTarget, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

    // Filters stop camera shake from working... need to pass in shake offset to shader
    // this.maingroup.filters = [this.filter];
  }

  switchedTool (tool) {
    // TODO: this should delegate to "use tool", "stop using tool"
    if (tool.item === "empty") {
      if (this.stayte.is("driving")) {
        this.toggleDriving();
      }
      return;
    }
    if (tool.item === "segway" || tool.item === "wings") {
      this.toggleDriving(tool.item === "segway" ? "segway" : "plane");
    } else {
      this.player.switchTool(tool);
    }

    if (tool.item === "steak") {
      this.player.health.powerUp(1, this.player);
      this.inventory.useItem(tool.item);
    }
  }

  playerHurt (health, maxHealth) {
    console.log("oh here!");
    this.HUD.setHealth(health, maxHealth);
  }

  playerDied () {
    const {stayte, player, protagonist, map, mobs} = this;
    if (player.died) {
      // I don't think this check is necessary
      console.error("already dead.");
      return;
    }
    this.serialize();
    map.setTileXY(Blocks.tombstone.tile, protagonist.x, protagonist.y);
    player.died = {
      time: Date.now(),
      onDead: (() => {
        if (!stayte.is("gameOver")) {
          stayte.set("gameOver");
        }
      }).bind(this)
    };

    // this.mobManager.disperseMobs();
    mobs.forEach(m => {
      const {x, y} = map.findEmptySpotFurtherThan(protagonist);
      map.makePath(m, x * 32, y * 32, () => {}, true);
    });
  }

  addHP (amount) {
    if (!amount) return;
    this.stats.dailyHP += amount;
    this.HUD.subtitle.text = `HP: ${this.stats.dailyHP}`;
  }

  toggleCheat () {
    this._cheat = !this._cheat;
    return this._cheat;
  }

  onPathWalked (xt, yt) {
    const {map, player, mobs} = this;

    const tile = map.map.layers[1].data[yt][xt];
    const block = Blocks.getByTileId(tile.index);

    if (block.mine) {
      // this.mobManager.closestZombieChasePlayer();
      let done = false;
      mobs.forEach(m => {
        if (done) return;
        const dist = Phaser.Math.distance(m.x, m.y, player.x, player.y);
        if (dist < 400) {
          done = true;
          // TODO: check player on walkable tile, else go to nearest walkable
          map.makePath(m, player.x, player.y);
        }
      });

      this.inventory.autoDig();
      const tool = this.inventory.holding();
      const toolEfficiency = Items[tool.item].efficiency || 1;

      // TODO: handle nicer: player -> tool -> target block
      const p = this.particles;
      p.tile = Items[block.yields[0].name].icon;
      p.emitting = true;
      p.x = xt * 32 + 16;
      p.y = yt * 32 + 8;

      player.mineTile(block, tile, toolEfficiency, () => {
        this.addHP(block.hp || 0);
        p.emitting = false;

        map.setTile(
          tile.index === Blocks.tree.tile ? Blocks.tree_hole.tile :
          Blocks.clear.tile
          , xt, yt);

        block.yields.forEach(({name, amount}) => {
          this.inventory.addItem(name, amount);
        });

        if (toolEfficiency > 1) {
          this.inventory.useItem(tool.item);
        }

      });
    }
  }

  update (game) {
    const {protagonist, cameraTarget, controls, stayte, inventory} = this;

    controls.update();
    DayTime.update(game.time.elapsedMS / 1000);

    this.filter.uniforms.pos.value = {
      x: protagonist.x,
      y: protagonist.y
    };
    this.filter.update();

    cameraTarget.x = protagonist.x + 10;
    cameraTarget.y = protagonist.y + 50;

    let updateDay = false;
    const isFirst = this.stayte.isFirst();

    switch (stayte.get()) {

    case "getready":
      if (isFirst && !this.haveEverFoundRecipe) {
        // Positin first ever floppy in view.
        const flops = this.floppies.children.map(({x, y}, i) => ({x, y, i})).sort((a, b) => {
          const aDist = Phaser.Math.distance(a.x * 32, a.y * 32, protagonist.x, protagonist.y);
          const bDist = Phaser.Math.distance(b.x * 32, b.y * 32, protagonist.x, protagonist.y);
          return aDist - bDist;
        });
        const flop = flops[0];
        let count = 0;
        let goodDist = false;
        while (count++ < 100 && !goodDist) {
          let {x, y} = this.map.findEmptySpotAtCenter(10);
          const dist = Phaser.Math.distance(x * 32, y * 32, protagonist.x, protagonist.y);
          if (dist > 100 && dist < 180) {
            goodDist = true;
            this.floppies.children[flop.i].x = x * 32;
            this.floppies.children[flop.i].y = y * 32;
          }
        }
      }

      if (!this.stats.lifetimeHP) {
        this.haveEverCrafted = false;
        stayte.set("pre-intro");
      }
      else {
        stayte.set("exploring");
      }
      break;

    case "pre-intro":
      if (Date.now() - stayte.time > 2000) {
        stayte.set("intro");
      }
      break;

    case "intro":
      if (isFirst) {
        inventory.miniPDA.visible = false;
        this.overlays.show("info", { data: "intro", onDone: () => {
          stayte.set("exploring");
          inventory.miniPDA.visible = true;
        }});
      }
      break;

    case "exploring":
      this.updateExploring(game);
      if (this.haveEverFoundRecipe && !this.haveEverCrafted) { // TODO: move haveEverCrafted to data.
        inventory.pda.scale.set(0.5 + Math.abs(Math.sin(Date.now() /300)) * 0.5);
      }
      updateDay = true;
      break;

    case "driving":
      this.updateDriving(game);
      updateDay = true;
      break;

    case "crafting":
      if (isFirst) {
        this.haveEverCrafted = true;
        inventory.pda.scale.set(1);
        inventory.miniPDA.visible = false;
        this.overlays.show("crafting", {onDone: () => {
          this.stayte.set("exploring");
          inventory.miniPDA.visible = true;
        }});
      }
      updateDay = true;
      break;

    case "dayOver":
      this.addHP(250);
      this.serialize();
      this.state.start("DayOver");
      break;

    case "gameOver":
      if (isFirst) {
        this.serialize();
        this.overlays.show("gameOver");
      }
    }

    this.overlays.update();

    if (updateDay && !this.player.died) {
      this.doMobStrategy();
      this.collisionsMob();
      this.collisionsAnimals();
      this.collisionsPickup();
      this.updateNight();
    }

    // Confine to playfield
    if (protagonist.x < 0) protagonist.x = 0;
    else if (protagonist.y < 0) protagonist.y = 0;
    else if (protagonist.x > (this.map.map.width - 1) * 32) protagonist.x = (this.map.map.width - 1) * 32;
    else if (protagonist.y > (this.map.map.height - 4) * 32) protagonist.y = (this.map.map.height - 4) * 32;

  }

  updateNight () {
    /*const {night, protagonist} = this;

    const tx = protagonist.x + 16;
    const ty = protagonist.y + 16;

    const dark = ((Math.sin(DayTime.time / (DayTime.DAY_LENGTH * 220) * 1000) + 1) / 2) * 255 | 0;
    const dark2 = dark > 100 ? dark : Math.min(255, dark + 60);

    night.context.fillStyle = `rgb(${dark}, ${dark}, ${dark})`;
    night.context.fillRect(0, 0, this.game.width, this.game.height);

    night.context.beginPath();
    night.context.fillStyle = `rgb(${dark2}, ${dark2}, ${dark2})`;
    night.context.arc(
      tx - this.camera.x,
      ty - this.camera.y,
      55,
      100, 0, Math.PI*2);
    night.context.fill();

    night.dirty = true;
    */
  }

  doMobStrategy () {
    // Randomly run towards player
    if (Math.random() < 0.005) {
      const {mobs, protagonist} = this;
      const mob = mobs.getRandom();
      // TODO: check player on walkable tile, else go to nearest walkable
      this.map.makePath(mob, protagonist.x, protagonist.y);
    }
  }

  collisionsAnimals () {
    const {player, game, animals, inventory} = this;
    animals.forEach(m => {
      const dist = Phaser.Math.distance(m.x, m.y, player.x, player.y);
      if (dist < 60) {
        const item = Items[inventory.holding().item];
        const damage = item.damage;
        if (damage) {
          player.startSwinging(m);
        }
        if (dist < 32) {
          if (damage) {
            m.dead();
            m.destroy();
          }
          else {
            const angle = game.math.angleBetween(
              player.x, player.y,
              m.x, m.y
            );
            const xo = Math.sin(angle) * 40;
            const yo = Math.cos(angle) * 40;
            Tween.to(player, {x: player.x + xo, y: player.y + yo}, 50);
            player.state.set("idle");
          }
        }
      }
    });
  }

  collisionsMob () {
    const {mobs, inventory, protagonist, player} = this;

    if (this._cheat) {
      return;
    }

    let someoneClose = false;

    const item = Items[inventory.holding().item];
    const damage = item.damage;
    const proj = inventory.projectiles();

    mobs.forEach(m => {
      const dist = Phaser.Math.distance(m.x, m.y, protagonist.x, protagonist.y);

      m.isClose = false;
      if (dist < 400) {

        m.walkSpeed = Math.min(4.5, m.walkSpeed + 0.003);
        if (dist < 200) {
          m.isClose = true;
          const path = player.pathWalker.path;
          const skateToPuck = path.length > 2;
          const target = skateToPuck ? path[2] : player;
          const multiplier = skateToPuck ? 32 : 1;
          // TODO: check player on walkable tile, else go to nearest walkable
          // TODO: if line of sight, run at player.
          this.map.makePath(m, target.x * multiplier + 16, target.y * multiplier + 16);

          // Should we shoot?
          // todo: lol, shooting is player, not vehicle
          if (proj && this.player.shoot(m)) {
            inventory.useItem(proj.item);
          }

          if (dist < 60) {
            someoneClose = true;

            this.player.someoneClose(m);
            // TODO: better "stop mining" check. Particles should be triggered by mining!
            this.particles.emitting = false;

            if (damage || this.inventory.autoStab()) {
              protagonist.startSwinging && protagonist.startSwinging(m);
            }
            if (dist < 32) {
              this.collideWithMob(m);
            }
          }
        }
      } else {
        m.walkSpeed = Math.max(m.defaultWalkSpeed, m.walkSpeed - 0.1);
      }

    });

    if (!someoneClose) {
      protagonist.stopSwinging && protagonist.stopSwinging();
    }
  }

  collideWithMob (m) {
    // TODO: player, not vehicle
    const {player, inventory} = this;

    const holding = inventory.holding();
    const damage = Items[holding.item].damage;

    if (damage && player.chargedForAttack()) {
      player.rechargeAttack();
      if (m.health.damage(damage, player) <= 0) {
        // Kill zombie!
        inventory.useItem(holding.item);
        this.addHP(42);
        player.state.set("idle");
      }
    }
    else {
      if (m.chargedForAttack()) {
        m.rechargeAttack();
        player.health.damage(1, m);
      }
    }

  }

  collisionsPickup () {
    const {floppies, protagonist} = this;

    let closest = Number.POSITIVE_INFINITY;
    floppies.forEach(f => {
      const dist = Phaser.Math.distance(f.x, f.y, protagonist.x, protagonist.y);
      if (dist < closest) closest = dist;

      if (dist <= 32) {
        this.stats.dailyCraftUnlocks++;
        this.stats.permanentUnlocks[0] = true;
        f.destroy();
        this.unlockRecipe();
      }
    });
  }

  unlockRecipe () {
    const unlocks = [
      ["wood_sword"],
      ["wood_pick"],
      ["stone_pick"],
      ["stone_sword"],
      ["wings"],
      ["fireworks"],
      ["iron_pick"],
      ["iron_sword"],
      ["brick", "sand"],
      ["tire"],
      ["segway"],
    ];

    let un = [];
    for (let i = 0; i < unlocks.length; i++) {
      un = unlocks[i];
      if (data.recipes[un[0]]) {
        continue;
      }
      un.forEach(u => {
        data.recipes[u] = true;
      });
      this.HUD.subtitle.text = un.join(", ");
      break;
    }
    this.haveEverFoundRecipe = true;
    this.stats.gameCraftUnlocks.push(...un);
    this.overlays.show("info", {data: un[0]});
  }

  walkToThenAct (worldX, worldY) {
    const {groundTarget} = this;
    this.particles.emitting = false;
    groundTarget.x = (worldX / 32 | 0) * 32;
    groundTarget.y = (worldY / 32 | 0) * 32;

    // Walk to spot
    this.map.makePath(
      this.player,
      worldX,
      worldY,
      () => {
        this.onPathWalked(worldX / 32 | 0, worldY / 32 | 0);
      }
    );
  }

  updateExploring (game) {
    const {controls, inventory} = this;
    const {justPressed, x, y, worldX, worldY} = controls;

    if (justPressed) {
      const bottomOfTouchable = inventory.ui.box.cameraOffset.y - 5;
      if (y > bottomOfTouchable - 5) return;

      // Crafting button - TODO: factorize it.
      if (y < 70 && x > game.width - 70) {
        this.stayte.set("crafting");
        return;
      }

      this.player.handleClick(
        inventory.holding(),
        this.walkToThenAct.bind(this, worldX, worldY),
        (block) => this.map.placeBlockAt(block, worldX, worldY)
      );

    }

  }

  toggleDriving (vehicleName) {
    const {protagonist, player, stayte} = this;
    if (!vehicleName && stayte.is("driving")) {
      stayte.set("exploring");
      protagonist.visible = false;
      player.visible = true;
      player.shadow.visible = true; // TODO: do this in player!
      player.x = protagonist.x;
      player.y = protagonist.y;
      this.protagonist = player;
      this.walkToThenAct(protagonist.x, protagonist.y);
    }
    else {
      stayte.set("driving");
      const vehicle = vehicleName ? this[vehicleName] :
        (Math.random() < 0.5 ? this.plane : this.segway);
      player.visible = false;
      player.shadow.visible = false; // TODO: do this in player!
      vehicle.visible = true;
      vehicle.x = this.player.x + 16;
      vehicle.y = this.player.y + 16;
      this.protagonist = vehicle;
    }
  }

  updateDriving (game) {
    const {map, player, protagonist} = this;
    const vehicle = protagonist;
    // TODO: just so shoots from correct pos.
    player.x = vehicle.x;
    player.y = vehicle.y;

    game.physics.arcade.collide(
      vehicle,
      this.map.layerz.base,
      null,
      () => vehicle.onTheGround);

    game.physics.arcade.collide(
      vehicle,
      this.map.layerz.mid,
      (p, tile) => {
        const block = Blocks.getByTileId(tile.index);

        map.setTile(
          tile.index === Blocks.tree.tile ? Blocks.tree_hole.tile : Blocks.clear.tile,
          tile.x, tile.y);

        block.yields.forEach(({name, amount}) => {
          this.inventory.addItem(name, amount);
        });
      },
      () => vehicle.onTheGround);


    const {controls, inventory} = this;
    const {justPressed, x, y} = controls;

    if (justPressed) {
      const bottomOfTouchable = inventory.ui.box.cameraOffset.y - 5;
      if (y > bottomOfTouchable - 5) return;

      // Crafting button - TODO: factorize it.
      if (y < 70 && x > game.width - 70) {
        this.stayte.set("crafting");
        return;
      }
    }
  }

  serialize () {
    data.inventory = this.inventory.serialize();
    data.dailyCraftUnlocks = this.stats.dailyCraftUnlocks;
    data.gameCraftUnlocks = this.stats.gameCraftUnlocks.slice(0);
    data.permanentUnlocks = this.stats.permanentUnlocks;
    data.dailyHP = this.stats.dailyHP;
    data.gameHP = this.stats.gameHP;
    data.haveEverFoundRecipe = this.haveEverFoundRecipe;
    //data.lifetimeHP = this.stats.lifetimeHP; um, why comment?...
  }

  deserialize (doInventory = true) {
    if (doInventory && data.inventory) {
      this.inventory.deserialize(data.inventory);
    }
    this.stats.dailyCraftUnlocks = data.dailyCraftUnlocks;
    this.stats.gameCraftUnlocks = data.gameCraftUnlocks.slice(0);
    this.stats.permanentUnlocks = data.permanentUnlocks;
    this.stats.dailyHP = data.dailyHP;
    this.stats.gameHP = data.gameHP;
    this.stats.lifetimeHP = data.lifetimeHP;

    this.haveEverFoundRecipe = data.haveEverFoundRecipe;
  }

  pauseUpdate (game) {
    super.pauseUpdate(game);
    this.overlays.update(game);
  }

  /*render (game) {
    game.debug.spriteBounds(this.segway);
    game.debug.body(this.segway)
  }*/

}

export default World;
