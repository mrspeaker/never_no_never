// @flow
import Phaser, {Game} from "phaser";
import Crafting from "./Crafting";
import GameOver from "./GameOver";
import Info from "./Info";
import World from "../World";

interface Overlay {
  x: number;
  y: number;
  hide(): boolean;
  show(): boolean;
  doUpdate(): void;
}

class Overlays {
  onDone = null;
  current: ?string = null;

  game: Game;
  overlays: {[key: string]: Overlay};
  world: World;

  constructor (game: Game, world: World) {
    this.game = game;
    this.world = world;
    this.overlays = {
      crafting: new Crafting(game, world),
      gameOver: new GameOver(game, world),
      info: new Info(game)
    };
  }

  show (overlayName: string, params: Object = {}) {
    const {game} = this;
    const {onDone, data}:{onDone: ?() => void, data: any} = params;
    const o = this.overlays[overlayName];
    if (!o) {
      console.error("no overlay called ", overlayName);
      return;
    }
    if (this.current) {
      this.hide(this.current);
      this.current = null;
    }
    this.current = overlayName;
    if (onDone) this.onDone = onDone;
    if (o.pauseGame) {
      if (!o.noclick)
        game.input.onDown.add(this.pausedClickHandler, this);
      game.paused = true;
    }
    //const t0 = performance.now();
    o.show(data);
    //const t1 = performance.now();
    //console.log((t1 - t0) + " milliseconds.")

  }

  hide (): boolean {
    const o = this.current && this.overlays[this.current];
    if (o && o.hide()) {
      this.onDone && this.onDone();
      this.onDone = null;
      this.current = null;
      return true;
    }
    return false;
  }

  pausedClickHandler () {
    const {game} = this;
    if (this.hide()) {
      game.input.onDown.remove(this.pausedClickHandler, this);
      game.paused = false;
    }
  }

  update (): void {
    if (!this.current) return;
    const o = this.overlays[this.current];
    o.doUpdate();
  }
}

export default Overlays;
