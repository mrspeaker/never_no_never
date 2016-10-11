const Phaser = window.Phaser;
import Map from "../Map";
import Controls from "../Controls";
import Player from "../entities/Player";
import Inventory from "../Inventory";
import Zombie from "../entities/Zombie";
import Blocks from "../Blocks";
import Items from "../Items";
import Crafting from "./Crafting";

class World extends Phaser.State {

  mode = "exploring";
  _cheat = false;

  preload (game) {
    //game.load.tilemap("world", "res/world.json", null, Phaser.Tilemap.TILED_JSON);
    game.load.image("tiles", "res/tiles.png");
    game.load.image("mid", "res/mid.png");
    game.load.image("inventory", "res/inventory.png");
    game.load.image("bmaxFont9", "res/bmax9.png");
    game.load.image("bmaxFont9x4", "res/bmax9x4.png");
    game.load.image("crafting", "res/crafting-back.png");
    game.load.spritesheet("craft-tmp", "res/craft-tmp.png", 34 * 4, 40);
    game.load.spritesheet("peeps", "res/peeps.png", 32, 32);
    game.load.spritesheet("icons", "res/icons.png", 32, 32);
    game.load.spritesheet("icons4x4", "res/icons4x4.png", 16, 16);
    game.load.spritesheet("inv-selection", "res/inv-selection.png", 52, 48);
  }

  reset () {
    this.mode = "exploring";
    this.game.state.start("Splash");
  }

  create (game) {
    game.stage.backgroundColor = "#343436";

    this.world = new Map(game);
    const {x, y} = this.world.findEmptySpot();
    this.player = new Player(game, x, y, ::this.playerHurt, ::this.playerDied);
    this.cameraTarget = game.add.sprite(0, 0, "peeps");
    this.cameraTarget.alpha = 0;

    this.controls = new Controls(game);
    this.inventory = new Inventory(game, ::this.player.switchTool);
    // this.inventory.addItem("wood_pick", 10);
    // this.inventory.addItem("wood_sword", 10);
    // this.inventory.addItem("brick", 10);

    const mobs = this.mobs = game.add.group();
    for (let i = 0; i < 4; i++) {
      const {x, y} = this.world.findEmptySpot();
      mobs.add(new Zombie(game, x, y));
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ .,!?'\":-$                0123456789";
    const title = game.add.retroFont("bmaxFont9x4", 36, 36, chars, 13, 0, 0, 0, 0);
    title.text = "bmax!";
    game.add.image(10, 10, title);//.fixedToCamera = true;

    const subtitle = game.add.retroFont("bmaxFont9", 9, 9, chars, 13, 0, 0, 0, 0);
    subtitle.text = "0123456789!? You bet.";
    game.add.image(4, 36, subtitle).fixedToCamera = true;

    const hearts = this.hearts = game.add.group();

    for (let i = 0; i <= 10; i++) {
      const h = hearts.create(i * 14 + 4, 4, "icons4x4");
      if (i >= 3 && i < 5) h.frame = 1;
      if (i >= 5) h.frame = 2;
      h.fixedToCamera = true;
    }

    for (let i = 0; i <= 10; i++) {
      const h = hearts.create(i * 14 + 4, 20, "icons4x4");
      if (i <= 2) h.frame = 17;
      if (i > 2) h.frame = 18;
      h.fixedToCamera = true;
    }

    this.craftingScreen = new Crafting(game, this);

    this.ui = {
      title,
      subtitle,
    };

    game.camera.follow(this.cameraTarget, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
  }

  playerHurt (health, maxHealth) {
    // Update player health ui
    let i = 0;
    this.hearts.forEach(h => {
      if (i < health) h.frame = 0;
      else if (i < maxHealth) h.frame = 1;
      else if (i < 10) h.frame = 2;
      i++;
    });
  }

  playerDied () {
    this.reset();
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
        world.grid[yt][xt] = 0;
        world.map.putTile(Blocks.clear.tile, xt, yt, 1);
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

  update (game) {
    const {mode, player, cameraTarget, mobs, controls} = this;

    cameraTarget.x = player.x + 10;
    cameraTarget.y = player.y + 50;

    controls.update();
    switch (mode) {
    case "exploring":
      this.updateExploring(game);
      break;
    case "crafting":
      this.craftingScreen.update(game);
      break;
    }

    // Collision detect
    mobs.forEach(m => {
      const dist = Phaser.Math.distance(m.x, m.y, player.x, player.y);
      if (dist < 200) {
        this.world.makePath(m, player.x, player.y);
      }

      if (dist < 60) {
        const holding = this.inventory.holding();
        const damage = Items[holding.item].damage;
        if (damage) {
          player.animations.play("attack");
        }
        if (dist < 32) {
          m.y -= 64; // "knockback"
          if (damage) {
            // kill zombie
            const {x, y} = this.world.findEmptySpot();
            m.reset(x, y);
            this.world.makePath(m, m.x, m.y);
            player.state.set("idle");
            holding.addItem(-1);
            return;
          }
          else {
            player.health.damage(1);
          }
        }
      }

    });

    // Randomly run towards player
    if (Math.random() < 0.005) {
      const mob = mobs.getRandom();
      this.world.makePath(mob, player.x, player.y);
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
      if (y < 70) {
        if (x > game.width - 70) {
          //if (x < 50) {
          this.setMode("crafting");
          //}
          return;
        }
      }

      this.player.handleClick(
        this.walkToThenAct.bind(this, worldX, worldY),
        this.placeBlockAt.bind(this, Blocks.brick.tile, worldX, worldY)
      );

    }
  }

}

export default World;
