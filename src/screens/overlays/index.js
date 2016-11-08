import Crafting from "./Crafting";
import GameOver from "./GameOver";
import Info from "./Info";

class Overlays {
  onDone = null;
  current = null;

  constructor (game, world) {
    this.game = game;
    this.world = world;
    this.overlays = {
      crafting: new Crafting(game, world),
      gameOver: new GameOver(game, world),
      info: new Info(game)
    };
  }

  show (overlayName, {onDone, data} = {}) {
    const {game} = this;
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
      game.input.onDown.add(this.pausedClickHandler, this);
      game.paused = true;
    }
    o.show(data);
  }

  hide () {
    const o = this.overlays[this.current];
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

  update () {
    if (!this.current) return;
    const o = this.overlays[this.current];
    o.doUpdate();
  }
}

export default Overlays;
