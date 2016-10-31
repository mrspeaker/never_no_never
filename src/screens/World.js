const Phaser = window.Phaser;

import Map from "../Map";
import Controls from "../Controls";
import Player from "../entities/Player";
import Inventory from "../Inventory";
import Zombie from "../entities/Zombie";
import Floppy from "../entities/Floppy";
// import Car from "../entities/Car";
import Plane from "../entities/Plane";
import Segway from "../entities/Segway";
import Blocks from "../Blocks";
import Items from "../Items";
import Crafting from "./Crafting";
import Title from "../Title";
import HUD from "../HUD";
import Tween from "../Tween";
import DayTime from "../DayTime";
import Particles from "../Particles";
import State from "../State";

import data from "../data";

class World extends Phaser.State {

  _cheat = false;
  floppyGets = 0;
  recipesUnlocked = [];

  reset () {
    this.game.state.start("Splash");
  }

  create (game) {

    this.stayte = new State("getready");

    game.stage.backgroundColor = "#343436";

    const fragmentSrc = `
precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float time;
uniform vec2 pos;

void main(void) {

  vec4 texColor = texture2D(uSampler, vTextureCoord);
  float dist = 1.0 - distance(texColor.xz, vec2(0.0, 1.0));
  texColor *= vec4(abs(sin(vTextureCoord.y + time / 30.0)), 1.0, abs(cos(pos.x / 1000.0)), 1.0);
  texColor.z *= sin((pos.y - vTextureCoord.y) + (pos.x - vTextureCoord.x) * 10.0  + time * 10.0) * dist; //vec4(0.0, 1.0, dist, 1.0);
  gl_FragColor = texColor;

}
`;

    const customUniforms = {
      pos: { type: "2f", value: null },
    };

    const filter = this.filter = new Phaser.Filter(game, customUniforms, fragmentSrc.split("\n"));

    // game.stage.disableVisibilityChange = true;
    game.physics.startSystem(Phaser.Physics.ARCADE);

    this.camera.flash(0x000000, 2000);

    DayTime.wakeUp();

    Tween.game = game;

    this.maingroup = game.add.group();

    this.world = new Map(game);

    this.groundTarget = game.add.sprite(0, 0, "icons");
    this.groundTarget.frame = 31;

    this.maingroup.add(this.world.layerz.base);
    this.maingroup.add(this.groundTarget);
    this.maingroup.add(this.world.layerz.mid);

    this.perma = game.add.group();
    this.maingroup.add(this.perma);

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

    this.controls = new Controls(game);
    this.player = new Player(game, x, y, ::this.playerHurt, ::this.playerDied);
    this.maingroup.add(this.player);
    this.protagonist = this.player;

    this.particles = new Particles(game, this.player.x, this.player.y, 1);
    this.particles.emitting = false;
    this.maingroup.add(this.particles);

    this.floppies = game.add.group();
    Array.from(new Array(20), () => {
      const spot = this.world.findEmptySpot();
      this.floppies.add(new Floppy(game, spot.x * 32, spot.y * 32));
    });
    this.maingroup.add(this.floppies);

    // Focus camera slightly off center, to make up for bottom non-touch area
    this.cameraTarget = game.add.sprite(0, 0, "peeps");
    this.cameraTarget.alpha = 0;

    const mobs = this.mobs = game.add.group();
    for (let i = 0; i < 30; i++) {
      const {x, y} = this.getMobSpawnPoint();
      mobs.add(new Zombie(game, x, y, this));
    }
    this.maingroup.add(this.mobs);

    // TODO: all vehicles updating, all the time.
    this.car = new Segway(game, this.protagonist.x, this.protagonist.y, this.controls);
    this.car.visible = false;
    this.maingroup.add(this.car);

    // TODO: all vehicles updating, all the time.
    this.plane = new Plane(game, this.protagonist.x, this.protagonist.y, this.controls);
    this.plane.visible = false;
    this.maingroup.add(this.plane);

    this.night = this.game.add.bitmapData(this.game.width, this.game.height);
    const light = this.game.add.image(0, 0, this.night);
    light.blendMode = Phaser.blendModes.MULTIPLY;
    light.fixedToCamera = true;

    this.inventory = new Inventory(game, ::this.player.switchTool);
    this.player.inventory = this.inventory;

    if (DayTime.firstDayOnTheJob) {
      DayTime.addDayOverListener(() => {
        this.stayte.set("dayOver");
      });
      this.floppyGets = 0;
    }
    else {
      this.deserialize();
    }
    // this.inventory.addItem("coal", 20);
    // this.inventory.addItem("wood_sword", 10);
    // this.inventory.addItem("sand", 10);

    const title = Title(game, "bmax!", 36, 12, 12).font;
    const subtitle = Title(game, "0123456789!? You bet.", 9, 4, 36, true).font;

    this.HUD = new HUD(game);

    this.craftingScreen = new Crafting(game, this);

    this.ui = {
      title,
      subtitle,
    };

    game.camera.focusOn(this.protagonist);
    game.camera.y += 2000;
    game.camera.follow(this.cameraTarget, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

    this._cheat = false;

    this.stayte.set("exploring");

    //this.maingroup.filters = [filter];

    //this.toggleDriving("plane");

  }

  getMobSpawnPoint () {
    const {world, protagonist} = this;
    const CLOSE_PIXELS = 400;
    let close = true;
    let x = -1;
    let y = -1;
    while (close) {
      const spot = world.findEmptySpot();
      x = spot.x;
      y = spot.y;
      const dist = Phaser.Math.distance(x * 32, y * 32, protagonist.x, protagonist.y);
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
    this.serialize();
    this.world.setTileXY(Blocks.tombstone.tile, this.protagonist.x, this.protagonist.y);
    this.player.died = {
      time: Date.now(),
      onDead: ::this.reset
    };
    this.mobs.forEach(m => {
      const {x, y} = this.getMobSpawnPoint();
      this.world.makePath(m, x * 32, y * 32, () => {}, true);
    });
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

        p.emitting = false;
        world.setTile(
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

  goRandoRadius (e, radius) {
    // Figure out radious thign
    const {x, y} = this.world.findEmptySpot();
    this.world.makePath(e, x, y);
  }

  killZombie () {
    const {player, inventory} = this;
    const holding = inventory.holding();
    inventory.useItem(holding.item);
    player.state.set("idle");
  }

  update (game) {
    const {protagonist, cameraTarget, controls} = this;

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

    switch (this.stayte.get()) {
    case "getready":
      this.stayte.set("exploring");
      break;
    case "exploring":
      this.updateExploring(game);
      updateDay = true;
      break;
    case "driving":
      this.updateDriving(game);
      updateDay = true;
      break;
    case "crafting":
      if (isFirst) {
        this.craftingScreen.visible = true;
      }
      this.craftingScreen.update(game);
      updateDay = true;
      break;
    case "dayOver":
      this.serialize();
      this.state.start("DayOver");
      break;
    }

    if (updateDay && !this.player.died) {
      this.doMobStrategy();
      this.collisionsMob();
      this.collisionsPickup();
      this.updateNight();
    }
  }

  updateNight () {
    const {night, protagonist} = this;

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
  }

  doMobStrategy () {
    // Randomly run towards player
    if (Math.random() < 0.005) {
      const {mobs, protagonist} = this;
      const mob = mobs.getRandom();
      this.world.makePath(mob, protagonist.x, protagonist.y);
    }
  }

  collisionsMob () {
    const {mobs, inventory} = this;

    if (this._cheat || this.player.died) {
      return;
    }

    const protagonist = this.protagonist;

    let someoneClose = false;

    const item = Items[inventory.holding().item];
    const damage = item.damage;
    const proj = this.inventory.projectiles();

    mobs.forEach(m => {
      const dist = Phaser.Math.distance(m.x, m.y, protagonist.x, protagonist.y);

      if (dist < 200) {
        m.isClose = true;

        this.world.makePath(m, protagonist.x, protagonist.y);

        // Should we shoot?
        // todo: lol, shooting is player, not vehicle
        if (proj && this.player.shoot(m)) {
          this.inventory.useItem(proj.item);
        }

        if (dist < 60) {
          someoneClose = true;

          this.player.someoneClose(m);
          // TODO: better "stop mining" check. Particles should be triggered by mining!
          this.particles.emitting = false;

          if (damage || this.inventory.autoStab()) {
            protagonist.attack && protagonist.attack(m);
          }
          if (dist < 32) {
            this.collideWithMob(m);
          }
        }
      } else {
        m.isClose = false;
      }

    });

    if (!someoneClose) {
      protagonist.noAttack && protagonist.noAttack();
    }
  }

  collideWithMob (m) {
    // TODO: player, not vehicle
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

  collisionsPickup () {
    const {floppies, protagonist} = this;

    let closest = Number.POSITIVE_INFINITY;
    floppies.forEach(f => {
      const dist = Phaser.Math.distance(f.x, f.y, protagonist.x, protagonist.y);
      if (dist < closest) closest = dist;

      if (dist <= 32) {
        this.floppyGets++;
        this.recipesUnlocked[0] = true;
        f.destroy();
        this.toggleDriving();
      }
    });
    this.ui.subtitle.text = closest.toFixed(2);
  }

  walkToThenAct (worldX, worldY) {
    const {groundTarget} = this;
    this.particles.emitting = false;
    groundTarget.x = (worldX / 32 | 0) * 32;
    groundTarget.y = (worldY / 32 | 0) * 32;

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
      return true;
    }
    return false;
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
        (block) => this.placeBlockAt(block, worldX, worldY)
      );

    }

  }

  toggleDriving (vehicleName) {
    if (!vehicleName && this.stayte.get() === "driving") {
      this.stayte.set("exploring");
      this.protagonist.visible = false;

      this.player.visible = true;
      this.player.shadow.visible = true;
      this.player.x = this.protagonist.x;
      this.player.y = this.protagonist.y;
      this.protagonist = this.player;
      this.walkToThenAct(this.protagonist.x, this.protagonist.y);
    }
    else {
      this.stayte.set("driving");
      const vehicle = vehicleName ? this[vehicleName] :
        (Math.random() < 0.5 ? this.plane : this.car);
      this.player.visible = false;
      this.player.shadow.visible = false;
      vehicle.visible = true;
      vehicle.x = this.player.x + 16;
      vehicle.y = this.player.y + 16;
      this.protagonist = vehicle;
    }
  }

  updateDriving (game) {
    const {world, player, protagonist} = this;
    const vehicle = protagonist;
    // TODO: just so shoots from correct pos.
    player.x = vehicle.x;
    player.y = vehicle.y;

    game.physics.arcade.collide(
      vehicle,
      this.world.layerz.base,
      null,
      () => vehicle.onTheGround);

    game.physics.arcade.collide(
      vehicle,
      this.world.layerz.mid,
      (p, tile) => {
        const block = Blocks.getByTileId(tile.index);

        world.setTile(
          tile.index === Blocks.tree.tile ? Blocks.tree_hole.tile : Blocks.clear.tile,
          tile.x, tile.y);

        block.yields.forEach(({name, amount}) => {
          this.inventory.addItem(name, amount);
        });
      },
      () => vehicle.onTheGround);


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
    }
  }

  serialize () {
    data.inventory = this.inventory.serialize();
    data.floppyGets = this.floppyGets;
    data.recipesUnlocked = this.recipesUnlocked;
  }

  deserialize () {
    if (data.inventory) {
      this.inventory.deserialize(data.inventory);
    }
    if (data.floppyGets) {
      this.floppyGets = data.floppyGets;
    }
    if (data.recipesUnlocked) {
      this.recipesUnlocked = data.recipesUnlocked;
    }
  }

  /*render (game) {
    game.debug.spriteBounds(this.car);
    game.debug.body(this.car)
  }*/

}

export default World;
