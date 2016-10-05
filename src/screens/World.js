const Phaser = window.Phaser;
import EasyStar from "easystarjs";
import Player from "../entities/Player";
import Zombie from "../entities/Zombie";
import Inventory from "../Inventory";

class World extends Phaser.State {

  preload (game) {
    game.load.tilemap("world", "res/world.json", null, Phaser.Tilemap.TILED_JSON);
    game.load.image("tiles", "res/tiles.png");
    game.load.image("mid", "res/mid.png");
    game.load.image("inventory", "res/inventory.png");
    game.load.spritesheet("peeps", "res/peeps.png", 32, 32);
    game.load.spritesheet("icons", "res/icons.png", 32, 32);
  }

  create (game) {
    game.stage.backgroundColor = "#787878";
    const map = game.add.tilemap("world");
    map.addTilesetImage("tiles", "tiles");
    map.addTilesetImage("mid", "mid");
    const layer = map.createLayer("base");
    map.createLayer("mid");
    layer.resizeWorld();

    this.map = map;
    this.layer = layer;

    this.mobs = game.add.group();

    const h = map.layers[0].data.length;
    const w = map.layers[0].data[0].length;
    const grid = [];
    for (let y = 0; y < h; y++) {
      const gridRow = [];
      for (let x = 0; x < w; x++) {
        let cell = 0;
        for (let i = 0; i < map.layers.length; i++) {
          const index = map.layers[i].data[y][x].index;
          if ([2].includes(index)) cell = 1;
          else if ([1201, 1202, 1203].includes(index)) cell = 2;
        }
        gridRow.push(cell);
      }
      grid.push(gridRow);
    }

    var estar = new EasyStar.js();
    this.grid = grid;
    estar.setGrid(grid);
    estar.enableDiagonals();
    estar.setAcceptableTiles([0, 3]);
    this.estar = estar;

    this.player = new Player(game, 1, 1);
    this.inventory = new Inventory(game);

    this.mobs.add(new Zombie(game, 6, 4));
    this.mobs.add(new Zombie(game, 19, 16));
    this.mobs.add(new Zombie(game, 2, 28));

    game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

  }

  onDone (xt, yt) {
    const tile = this.map.layers[1].data[yt][xt].index;
    if ([1201, 1202, 1203].includes(tile)) {
      this.grid[yt][xt] = 0;
      this.map.putTile(-1, xt, yt, 1);

      let done = false;
      this.mobs.forEach(m => {
        if (done) return;
        const dist = Phaser.Math.distance(m.x, m.y, this.player.x, this.player.y);
        if (dist < 250) {
          done = true;
          this.makePath(m, this.player.x + 16, this.player.y + 16);
        }
      });

      if (tile === 1201) {
        this.inventory.addItem("wood");
      }
      if (tile === 1202) {
        this.inventory.addItem("coal");
      }
    }
  }

  update (game) {
    if (game.input.activePointer.isDown) {
      const xo = game.input.activePointer.worldX;
      const yo = game.input.activePointer.worldY;

      if (xo > game.camera.x + game.width - 50 && yo > game.camera.y + game.height - 50) {
        game.state.start("World");
        return;
      }
      this.makePath(
        this.player,
        xo,
        yo
      );
    }
  }

  makePath (e, tx, ty) {
    const layer = this.layer;
    const xt = layer.getTileX(tx);
    const yt = layer.getTileY(ty);
    if (xt <= -1 || yt <= -1) return;

    const oldx = this.grid[yt][xt];
    this.grid[yt][xt] = 3;
    this.estar.setGrid(this.grid);
    const lastNotWalkable = oldx !== 0;
    this.estar.findPath(
      (e.x + 16) / 32 | 0,
      (e.y + 16) / 32 | 0,
      xt,
      yt,
      path => {
        if (!path) { return; }
        if (oldx === 1) {
          // don't go in water...
          path = path.slice(0, -1);
        }
        e.setPath(path, () => this.onDone(xt, yt, oldx));
      });
    this.estar.calculate();
    this.grid[yt][xt] = oldx;
  }
}

export default World;
