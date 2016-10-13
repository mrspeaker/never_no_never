const Phaser = window.Phaser;

class Tween {

  _game = null;

  set game (game) {
    this._game = game;
  }

  to (e, props, speed) {
    // properties, duration, ease, autoStart, delay, repeat, yoyo
    this._game.add.tween(e).to(props, speed, Phaser.Easing.Linear.None, true);
  }

  flash (e, props, speed = 100) {
    this._game.add.tween(e)
      .to(props, speed, Phaser.Easing.Linear.None, true, 0, 2, true);
  }
}

export default new Tween();
