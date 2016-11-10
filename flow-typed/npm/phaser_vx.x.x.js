declare module "phaser" {

  declare class Sprite {
    frame: any;
    scale: any;
    tint: any;
    alpha: number;
  }

  declare class GameObjectFactory {
    sprite: (x: number, y: number, key: string) => Sprite;
    tween: (props: Object) => Tween;
  }

  declare class Loader {
    image: any;
    spritesheet: any;
  }

  declare class StateManager {
    constructor(game: Game, state: ?State): StateManager;
    add: (key: string, state: Class<State> | () => State, autoStart: bool) => void;
    start: (key: string, clearWorld: ?bool, clearCache: ?bool) => void;
  }

  declare class State {
    game: Game;
    update: (game: Game) => void;
  }

  declare class Stage {
    backgroundColor: number|string;
  }

  declare class Tween {
    to: any;
  }

  declare class Game {
    constructor(
      width: number | string,
      height: number | string,
      renderer: ?number,
      parent: ?string | HTMLElement,
      state: ?Object,
      transparent: ?boolean,
      antialias: ?boolean,
      physicsConfig: ?Object): Game;
    width: number;
    height: number;
    state: StateManager;
    stage: Stage;
    update: (time: number) => void;
    add: GameObjectFactory;
    load: Loader;
    preserveDrawingBuffer: bool;
  }

  declare module.exports: {
    Game: Class<Game>;
    State: Class<State>;
    // Games: Array<Game>,

    // renderer constants
    AUTO: number;
    CANVAS: number;
    WEBGL: number;
    HEADLESS: number;
  }
}

declare module "phaser/index" {
  declare module.exports: $Exports<"phaser">
}
declare module "phaser/index.js" {
  declare module.exports: $Exports<"phaser">
}
