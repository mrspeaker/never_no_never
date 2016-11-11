declare module "phaser" {

  declare class DisplayObject {
    x: number;
    y: number;
    scale: any;
    tint: any;
    alpha: number;
    destroy: () => void;
    fixedToCamera: bool;
    data: Object;

    // I need to implement in superclasses!
    dead: bool;
    isClose: bool;
    walkSpeed: number;
    defaultWalkSpeed: number;
  }

  declare class Sprite extends DisplayObject {
    frame: number;
    animations: any;
  }

  declare class Image extends DisplayObject {

  }

  declare class SpriteSheet extends DisplayObject {

  }

  declare class Text extends DisplayObject {

  }

  declare class Group extends DisplayObject {
    constructor(
      game: Game,
      parent: ?DisplayObject,
      name: ?string,
      addToStage: ?bool,
      enableBody: ?bool,
      physicsBodyType: ?number):this;
    add: (child: DisplayObject, silent?: bool, index?: number) => DisplayObject;
    forEach: (callback: (child:DisplayObject) => void, context?: Object, checkExists?: bool) => void;
    children: Array<DisplayObject>;
    getRandom: () => DisplayObject;
  }

  declare class RenderTexture {}

  declare class RetroFont extends RenderTexture {
    text: string
  }

  declare class GameObjectFactory {
    group: () => Group;
    sprite: (x: number, y: number, key: string) => Sprite;
    image: (x: number, y: number, key: string|RenderTexture) => Image;
    existing: (displayObject: DisplayObject) => DisplayObject;
    tween: (props: Object) => Tween;
    retroFont: (font: string, characterWidth: number,
      characterHeight: number, chars: string, charsPerRow: number,
      xSpacing?: number, ySpacing?: number, xOffset?: number, yOffset?: number) => RetroFont;
  }

  declare class Loader {
    image (key: string, url?: string, overwrite?: bool):this;
    spritesheet (
      key: string,
      url: string,
      frameWidth: number,
      frameHeight: number,
      frameMax?: number,
      margin?: number,
      spacing?: number):this;
  }

  declare class StateManager {
    constructor(game: Game, state: ?State):this;
    current: string;
    add (key: string, state: Class<State> | () => State, autoStart: bool): void;
    start (key: string, clearWorld?: bool, clearCache?: bool): void;
    states: {[key: string]: State};
  }

  declare class State {
    game: Game;
    camera: Camera;
    state: StateManager;
    update(game: Game): void;
    pauseUpdate (game: Game): void;
  }

  declare class Stage {
    backgroundColor: number|string;
  }

  declare class Tween {
    to: any;
  }

  declare class Camera {
    x: number;
    y: number;
    focusOn (displayObject: DisplayObject): void;
    follow (target:Sprite|Image|Text, style?:number, lerpX?:number, lerpY:number): void;
    flash (tint: number, duration: number): void;

    FOLLOW_LOCKON: number;
  }

  declare class Math {
    static distance: (x1: number, y1: number, x2: number, y2: number) => number;
    static angleBetween: (x1: number, y1: number, x2: number, y2: number) => number;
  }

  declare class Physics {
    startSystem: any;
    arcade: any;
    ARCADE: number;
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
      physicsConfig: ?Object):this;
    width: number;
    height: number;
    state: StateManager;
    stage: Stage;
    add: GameObjectFactory;
    load: Loader;
    camera: Camera;
    math: Math;
    physics: Physics;
    time: any;
    preserveDrawingBuffer: bool;
    update (time: number): void;
  }

  declare module.exports: {
    Game: Class<Game>;
    State: Class<State>;
    Group: Class<Group>;
    Sprite: Class<Sprite>;
    Image: Class<Image>;
    DisplayObject: Class<DisplayObject>;
    StateManager: Class<StateManager>;

    Camera: Camera;
    Physics: Physics;
    Math: Math;
    Filter: any;

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
