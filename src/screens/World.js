const Phaser = window.Phaser;
import EasyStar from "easystarjs";
import Player from "../entities/Player";
import Zombie from "../entities/Zombie";
import Inventory from "../Inventory";
import Blocks from "../Blocks";
import BLOCK_TYPE from "../BLOCK_TYPE";
import Items from "../Items";

class World extends Phaser.State {

  mode = "exploring";

  preload (game) {
    game.load.tilemap("world", "res/world.json", null, Phaser.Tilemap.TILED_JSON);
    game.load.image("tiles", "res/tiles.png");
    game.load.image("mid", "res/mid.png");
    game.load.image("inventory", "res/inventory.png");
    game.load.image("bmaxFont9", "res/bmax9.png");
    game.load.image("bmaxFont9x4", "res/bmax9x4.png");
    game.load.spritesheet("peeps", "res/peeps.png", 32, 32);
    game.load.spritesheet("icons", "res/icons.png", 32, 32);
    game.load.spritesheet("inv-selection", "res/inv-selection.png", 52, 52);
  }

  mapToGrid (map) {
    const h = map.layers[0].data.length;
    const w = map.layers[0].data[0].length;

    const grid = [];
    for (let y = 0; y < h; y++) {
      const gridRow = [];
      for (let x = 0; x < w; x++) {
        let cell = BLOCK_TYPE.walkable;
        for (let i = 0; i < map.layers.length; i++) {
          const index = map.layers[i].data[y][x].index;
          const block = Blocks.getByTileId(index);
          if (!block.walk && !block.mine) {
            cell = BLOCK_TYPE.solid;
          }
          else if (block.mine) {
            cell = BLOCK_TYPE.mineable;
          }
        }
        gridRow.push(cell);
      }
      grid.push(gridRow);
    }
    return grid;
  }

  create (game) {
    game.stage.backgroundColor = "#787878";
    const map = this.map = game.add.tilemap("world");
    map.addTilesetImage("tiles", "tiles");
    map.addTilesetImage("mid", "mid");
    const layer = this.layer = map.createLayer("base");
    map.createLayer("mid");
    layer.resizeWorld();

    this.grid = this.mapToGrid(map);
    const estar = this.estar = new EasyStar.js();
    estar.setGrid(this.grid);
    estar.enableDiagonals();
    estar.disableCornerCutting();
    estar.setAcceptableTiles([0, 3]);

    this.player = new Player(game, 11, 16);
    this.inventory = new Inventory(game);
    // this.inventory.addItem({name:"wood_pick", hp: 10, hardness: 5});
    // this.inventory.addItem({name:"wood_sword", hp: 10, hardness: 2});
    this.inventory.addItem("wood_sword");
    this.inventory.addItem("wood_pick");

    const mobs = this.mobs = game.add.group();
    mobs.add(new Zombie(game, 6, 4));
    mobs.add(new Zombie(game, 19, 16));
    mobs.add(new Zombie(game, 2, 28));

    //new RetroFont(game, key, characterWidth, characterHeight, chars, charsPerRow, xSpacing, ySpacing, xOffset, yOffset)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ .,!?'\"$                  0123456789";
    const bmaxFont4 = game.add.retroFont("bmaxFont9x4", 36, 36, chars, 13, 0, 0, 0, 0);
    bmaxFont4.text = "bmax!";
    const titleImg = game.add.image(10, 10, bmaxFont4);
    titleImg.fixedToCamera = true;

    const bmaxFont = this.fonty = game.add.retroFont("bmaxFont9", 9, 9, chars, 13, 0, 0, 0, 0);
    bmaxFont.text = "0123456789!? You bet.";
    const img = game.add.image(10, 50, bmaxFont);
    img.fixedToCamera = true;

    game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
  }

  onDone (e, xt, yt) {
    if (!(e instanceof Player)) {
      return;
    }

    this.fonty.text = `${xt},${yt}`;

    const tile = this.map.layers[1].data[yt][xt];
    const block = Blocks.getByTileId(tile.index);
    if (block.mine) {
      // Chase player
      let done = false;
      this.mobs.forEach(m => {
        if (done) return;
        const dist = Phaser.Math.distance(m.x, m.y, this.player.x, this.player.y);
        if (dist < 250) {
          done = true;
          this.makePath(m, this.player.x + 16, this.player.y + 16);
        }
      });

      const tool = this.inventory.holding();
      const toolEfficiency = (tool && Items[tool].efficiency) || 1;
      e.mineTile(block, tile, toolEfficiency, () => {
        this.grid[yt][xt] = 0;
        this.map.putTile(Blocks.clear.tile, xt, yt, 1);
        block.yields.forEach(({name, amount}) => {
          this.inventory.addItem(name, amount);
        });
      });
    } else {
      e.stopWalking();
    }
  }

  update (game) {
    this.fonty.text = this.mode;

    if (this.mode === "exploring") {
      this.updateExploring(game);
    }
    else {
      this.updateCrafting(game);
    }

  }

  updateExploring (game) {
    if (game.input.activePointer.isDown) {
      const xo = game.input.activePointer.worldX;
      const yo = game.input.activePointer.worldY;
      const bottomOfTouchable = this.inventory.box.y - 10;
      if (yo > bottomOfTouchable) {
        if (xo > game.camera.x + game.width - 50) {
          game.state.start("World");
        }
        if (xo < game.camera.x + 50) {
          // Crafting...
          this.mode = "crafting";
        }
        return;
      }

      this.makePath(
        this.player,
        xo,
        yo
      );
    }
  }

  updateCrafting (game) {
    if (game.input.activePointer.isDown) {
      const xo = game.input.activePointer.worldX;
      const yo = game.input.activePointer.worldY;
      if (yo < game.camera.y + 50) {
        this.mode = "exploring";
      }
    }
  }

  makePath (e, tx, ty) {
    const layer = this.layer;
    const xt = layer.getTileX(tx);
    const yt = layer.getTileY(ty);
    if (xt <= -1 || yt <= -1) return;

    const oldx = this.grid[yt][xt];
    this.grid[yt][xt] = BLOCK_TYPE.tmpwalkable;
    this.estar.setGrid(this.grid);
    this.estar.findPath(
      (e.x + 16) / 32 | 0,
      (e.y + 16) / 32 | 0,
      xt,
      yt,
      path => {
        if (!path) { return; }
        if (oldx === BLOCK_TYPE.solid) {
          // don't go in water...
          path = path.slice(0, -1);
        }
        e.setPath(path, () => this.onDone(e, xt, yt, oldx));
      });
    this.estar.calculate();
    this.grid[yt][xt] = oldx;
  }
}

export default World;
