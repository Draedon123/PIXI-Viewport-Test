import { Viewport, Plugin, } from 'pixi-viewport';
import { Application, Sprite, Texture, Point as PIXI_Point } from 'pixi.js';

type AccelerationDirections = {
  UP: boolean,
  DOWN: boolean,
  LEFT: boolean,
  RIGHT: boolean,
}

type KeyboardPanningOptions = Partial<{
  impulseVelocity: number,
  maxVelocity: number,
  acceleration: number,
  deceleration: number;
}>

class KeyboardPanning extends Plugin{
  private readonly velocity: Point;
  private moveCount: number;
  private readonly accelerationDirections: AccelerationDirections;
  private readonly options: Required<KeyboardPanningOptions>;

  static DEFAULT_OPTIONS = {
    impulseVelocity: 500,
    maxVelocity: 2000,
    acceleration: 1000,
    deceleration: 2000,
  }
  constructor(parent: Viewport, options: KeyboardPanningOptions = {}){
    super(parent);

    this.velocity = new Point(0, 0);
    this.moveCount = 0;
    this.accelerationDirections = {
      UP: false,
      DOWN: false,
      LEFT: false,
      RIGHT: false,
    }
    this.options = Object.assign({}, options, KeyboardPanning.DEFAULT_OPTIONS);
    this.parent.on("moved", event => {
      if(!this.isMoving) return;
      switch(event.type){
        case "clamp-x":
          this.velocity.x = 0;
          break;
        case "clamp-y":
          this.velocity.y = 0;
          break;
      }
    });
  }

  get isMoving(): boolean{
    return this.velocity.x !== 0 || this.velocity.y !== 0;
  }

  get isAccelerating(): boolean{
    return this.moveCount > 0;
  }

  public setMove(direction: keyof AccelerationDirections): void{
    if(this.accelerationDirections[direction]) return;
    this.accelerationDirections[direction] = true;
    this.moveCount++;
    switch(direction){
      case 'UP':
      this.velocity.y = -this.options.impulseVelocity;  
      break;
      case 'DOWN':
      this.velocity.y = this.options.impulseVelocity;  
      break;
      case 'LEFT':
      this.velocity.x = -this.options.impulseVelocity;  
      break;
      case 'RIGHT':
      this.velocity.x = this.options.impulseVelocity;  
      break;
    }
  }

  public removeMove(direction: keyof AccelerationDirections): void{
    if(!this.accelerationDirections[direction]) return;
    this.accelerationDirections[direction] = false;
    this.moveCount--;
  }

  override update(elapsedMilliseconds: number): void{
    if(!(this.isMoving || this.isAccelerating)) return;
    const elapsedSeconds = elapsedMilliseconds / 1000;
    let velocityChange = this.options.acceleration * elapsedSeconds;
    if(this.accelerationDirections.UP) this.velocity.y -= velocityChange;
    if(this.accelerationDirections.DOWN) this.velocity.y += velocityChange;
    if(this.accelerationDirections.LEFT) this.velocity.x -= velocityChange;
    if(this.accelerationDirections.RIGHT) this.velocity.x += velocityChange;

    this.velocity.x = clamp(this.velocity.x, -this.options.maxVelocity, this.options.maxVelocity);
    this.velocity.y = clamp(this.velocity.y, -this.options.maxVelocity, this.options.maxVelocity);

    velocityChange = this.options.deceleration * elapsedSeconds;

    const speed = Point.originDistance(this.velocity);

    if(!this.accelerationDirections.UP && !this.accelerationDirections.DOWN){
      let velocityChangeY = (-this.velocity.y / speed) * velocityChange;
      velocityChangeY = this.velocity.y > 0 ? Math.max(velocityChangeY, -this.velocity.y) : Math.min(velocityChangeY, -this.velocity.y);
      this.velocity.y += velocityChangeY;
    }

    if(!this.accelerationDirections.LEFT && !this.accelerationDirections.RIGHT){
      let velocityChangeX = (-this.velocity.x / speed) * velocityChange;
      velocityChangeX = this.velocity.x > 0 ? Math.max(velocityChangeX, -this.velocity.x) : Math.min(velocityChangeX, -this.velocity.x);
      this.velocity.x += velocityChangeX;
    }

    const original = new PIXI_Point(this.parent.x, this.parent.y);
    this.parent.x -= this.velocity.x * elapsedSeconds;
    this.parent.y -= this.velocity.y * elapsedSeconds;

    this.parent.emit("moved", {
      viewport: this.parent,
      type: "animate",
      original,
    })

    if(this.velocity.x === 0 && this.velocity.y === 0) this.parent.emit("moved-end", this.parent);
  }
}

class Point{
  constructor(public x: number, public y: number){}

  public static originDistance(point: Point): number{
    return Math.sqrt(point.x**2 + point.y**2);
  }
}

function clamp(value: number, minimumValue: number, maximumValue: number): number{
  return Math.max(Math.min(maximumValue, value), minimumValue);
}

const canvas = document.querySelector("canvas")!;

const app = new Application({view: canvas, autoDensity: true, antialias: true, sharedTicker: true, autoStart: false});
const viewport = new Viewport({events: app.renderer.events, passiveWheel: false, screenHeight: canvas.offsetHeight, screenWidth: canvas.offsetWidth});
viewport.drag({}).decelerate({minSpeed: 0.3, friction: 0.96}).pinch({}).wheel({});

// const keyboardPanning = new KeyboardPanning(viewport, {deceleration: 3000});
// viewport.plugins.add("keyboard-pan", keyboardPanning);

app.stage.addChild(viewport);
viewport.addChild(new Sprite(Texture.WHITE));