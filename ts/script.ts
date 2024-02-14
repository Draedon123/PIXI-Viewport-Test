import { Viewport } from 'pixi-viewport';
import { Application, Sprite, Texture } from 'pixi.js';

const canvas = document.querySelector("canvas")!;

const app = new Application({view: canvas, autoDensity: true, antialias: true, sharedTicker: true, autoStart: false});
const viewport = new Viewport({events: app.renderer.events, passiveWheel: false, screenHeight: canvas.offsetHeight, screenWidth: canvas.offsetWidth});
viewport.drag({}).decelerate({minSpeed: 0.3, friction: 0.96}).pinch({}).wheel({});

app.stage.addChild(viewport);
viewport.addChild(new Sprite(Texture.WHITE));