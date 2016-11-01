const Phaser = window.Phaser;
import Title from "../Title";

class Info extends Phaser.Group {

  constructor (game, pickup) {
    super(game);
    game.add.existing(this);
    //this.fixedToCamera = true;

    this.addChild(Title(game, "unlock!", 36, 50, 100, true).img);
    this.addChild(Title(game, pickup, 9, 50, 180, true).img);

    this.game.camera.flash(0xffffff, 300);
    game.time.events.add(Phaser.Timer.SECOND * 0.3, () => {
      game.input.onDown.add(this.leave, this);
      game.paused = true;
    });

  }

  leave () {

    this.game.input.onDown.remove(this.leave, this);
    this.game.paused = false;
    this.destroy();
  }

  update () {
    this.y += Math.sin(Date.now() / 100) * 0.1;
  }

}

export default Info;
