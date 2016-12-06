declare module "phaser" {

  declare class DisplayObject {
    x: number;
    y: number;
    cameraOffset: {
      x: number,
      y: number
    };
    visible: boolean;
    rotation: number;
    scale: any;
    tint: any;
    alpha: number;
    destroy: () => void;
    fixedToCamera: boolean;
    data: Object;
    game: Game;
    inputEnabled: boolean;
    events: Object;

    addChild<T:DisplayObject> (child: T): T;
  }

  declare class Frame {
    index: number;
    x: number;
    y: number;
    name: string;
  }

  declare class Animation {
    name: string;
    currentFrame: Frame;
    delay: number;
    isFinished: boolean;
    isPaused: boolean;
    isPlaying: boolean;
    isReversed: boolean;
    killOnComplete: boolean;
    loop: boolean;
    loopCount: number;
  }

  declare class AnimationManager {
    add (name: string, frames: ?Array<string | number>, frameRate: ?number, loop: ?boolean, useNumericIndex: ?boolean): Animation;
    stop (name: ?string, resetFrame: ?boolean): Animation;
    play (name: string, frameRate: ?number, loop: ?boolean, killOnComplete: ?boolean): Animation;
    currentAnim: Animation;
  }

  declare class Sprite extends DisplayObject {
    frame: number;
    animations: AnimationManager;
  }

  declare class Image extends DisplayObject {

  }

  declare class SpriteSheet extends DisplayObject {

  }

  declare class Text extends DisplayObject {

  }

  declare class DisplayObjectContainer extends DisplayObject {
    children: Array<DisplayObject>;
  }

  declare class Group extends DisplayObjectContainer {
    constructor(
      game: Game,
      parent: ?DisplayObject,
      name: ?string,
      addToStage: ?boolean,
      enableBody: ?boolean,
      physicsBodyType: ?number):this;
    children: Array<DisplayObject>;
    add<T: DisplayObject> (child: T, silent?: boolean, index?: number): T;
    removeAll<T: DisplayObject> (): void;
    create (x: number, y: number, key?: string, frame?: number, exists?: boolean, index?: number): Sprite;
    forEach<T: DisplayObject> (callback: (child: T) => void, context?: Object, checkExists?: boolean): void;
    getRandom: () => DisplayObject;
  }

  declare class RenderTexture {}

  declare class RetroFont extends RenderTexture {
    text: string
  }

  declare class Tilemap {
    constructor (
      game: Game,
      key?: string,
      tileWidth?: number,
      tileHeight?: number,
      width: ?number,
      height: ?number
    ):this;
    addTilesetImage (): Tileset;
    createLayer (): TilemapLayer;
    setCollision (): void;

    TILED_JSON: number
  }

  declare class Tileset {}
  declare class TilemapLayer {
    layer: any;
    resizeWorld (): any;
  }

  declare class GameObjectFactory {
    group: () => Group;
    sprite: (x: number, y: number, key: string) => Sprite;
    image: (x: number, y: number, key: string | RenderTexture) => Image;
    existing: (displayObject: DisplayObject) => DisplayObject;
    tween (props: Object): Tween;
    retroFont (font: string, characterWidth: number,
      characterHeight: number, chars: string, charsPerRow: number,
      xSpacing?: number, ySpacing?: number, xOffset?: number, yOffset?: number): RetroFont;
    tilemap (key: ?string, tileWidth: ?number, tileHeight: ?number, width: ?number, height: ?number): Tilemap;
  }

  declare class Loader {
    image (key: string, url?: string, overwrite?: boolean):this;
    spritesheet (
      key: string,
      url: string,
      frameWidth: number,
      frameHeight: number,
      frameMax?: number,
      margin?: number,
      spacing?: number):this;
    tilemap (key: string, url: ?string, data: ?(Object | string), format: ?number): Tilemap;
  }

  declare class StateManager {
    constructor(game: Game, state: ?State):this;
    current: string;
    add (key: string, state: Class<State> | () => State, autoStart: boolean): void;
    start (key: string, clearWorld?: boolean, clearCache?: boolean): void;
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
    backgroundColor: number | string;
  }

  declare class Tween {
    to (): Tween;
  }

  declare class Camera {
    x: number;
    y: number;
    focusOn (displayObject: DisplayObject): void;
    follow (target: Sprite | Image | Text, style?: number, lerpX?: number, lerpY: number): void;
    flash (tint: number, duration: number): void;
    shake (): void;

    FOLLOW_LOCKON: number;
  }

  declare class Math {
    distance: (x1: number, y1: number, x2: number, y2: number) => number;
    angleBetween: (x1: number, y1: number, x2: number, y2: number) => number;
  }

  declare class Physics {
    startSystem: any;
    arcade: any;
    ARCADE: number;
  }

  declare class Input {
    onDown: any;
    activePointer: {
      x: number,
      y: number,
      worldX: number,
      worldY: number
    };
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
    paused: boolean;
    state: StateManager;
    stage: Stage;
    add: GameObjectFactory;
    load: Loader;
    camera: Camera;
    input: Input;
    math: Math;
    physics: Physics;
    time: any;
    preserveDrawingBuffer: boolean;
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
    RetroFont: Class<RetroFont>;

    Tilemap: Tilemap;
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
