import Phaser from "phaser";
import Title from "./Title";

class HUD extends Phaser.Group {

  constructor (game) {
    super(game);

    for (let i = 0; i <= 10; i++) {
      const h = this.create(i * 14 + 4, 4, "icons4x4");
      if (i >= 3 && i < 5) h.frame = 1;
      if (i >= 5) h.frame = 2;
      h.fixedToCamera = true;
    }

    for (let i = 0; i <= 10; i++) {
      const h = this.create(i * 14 + 4, 20, "icons4x4");
      if (i <= 2) h.frame = 17;
      if (i > 2) h.frame = 18;
      h.fixedToCamera = true;
    }

    this.subtitle = Title(game, "...", 9, 4, 36, true).font;

  }

  setHealth (health, maxHealth) {
    let i = 0;
    this.forEach(h => {
      if (i < health) h.frame = 0;
      else if (i < maxHealth) h.frame = 1;
      else if (i < 10) h.frame = 2;
      i++;
    });
  }
}

export default HUD;
