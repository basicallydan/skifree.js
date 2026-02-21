import SpriteArray from './spriteArray.js';
import EventedLoop from 'eventedloop';

class Game {
	constructor(camera, player) {
		this._camera = camera;
		this._player = player;
		this._staticObjects = new SpriteArray();
		this._movingObjects = new SpriteArray();
		this._uiElements = new SpriteArray();
		this._mouseX = camera.getCentreOfViewport();
		this._mouseY = 0;
		this._paused = false;
		this._beforeCycleCallbacks = [];
		this._afterCycleCallbacks = [];
		this._gameLoop = new EventedLoop();

		player.setMapPosition(0, 0);
		player.setMapPositionTarget(0, -10);
		camera.followSprite(player);

		this._gameLoop.on('20', this.cycle.bind(this));
		this._gameLoop.on('20', this.draw.bind(this));
	}

	addStaticObject(sprite) {
		this._staticObjects.push(sprite);
	}

	addStaticObjects(sprites) {
		sprites.forEach(this.addStaticObject.bind(this));
	}

	addMovingObject(movingObject, movingObjectType) {
		if (movingObjectType) {
			this._staticObjects.onPush(obj => {
				if (obj.data && obj.data.hitBehaviour[movingObjectType]) {
					obj.onHitting(movingObject, obj.data.hitBehaviour[movingObjectType]);
				}
			}, true);
		}
		this._movingObjects.push(movingObject);
	}

	addUIElement(element) {
		this._uiElements.push(element);
	}

	beforeCycle(callback) {
		this._beforeCycleCallbacks.push(callback);
	}

	afterCycle(callback) {
		this._afterCycleCallbacks.push(callback);
	}

	setMouseX(x) { this._mouseX = x; }
	setMouseY(y) { this._mouseY = y; }

	cycle() {
		this._beforeCycleCallbacks.forEach(c => c());

		var mouseMapPosition = this._camera.canvasPositionToMapPosition([this._mouseX, this._mouseY]);

		if (!this._player.isJumping) {
			this._player.setMapPositionTarget(mouseMapPosition[0], mouseMapPosition[1]);
		}

		this._player.cycle();

		this._movingObjects.forEach(movingObject => movingObject.cycle(this._camera));

		this._staticObjects.cull();
		this._staticObjects.forEach(staticObject => {
			if (staticObject.cycle) staticObject.cycle();
		});

		this._uiElements.forEach(uiElement => {
			if (uiElement.cycle) uiElement.cycle();
		});

		this._afterCycleCallbacks.forEach(c => c());
	}

	draw() {
		this._camera.clearRect(0, 0, this._camera.canvas.width, this._camera.canvas.height);

		this._player.draw(this._camera);
		this._player.cycle();

		this._movingObjects.forEach(movingObject => movingObject.draw(this._camera));

		this._staticObjects.forEach(staticObject => {
			if (staticObject.draw) staticObject.draw(this._camera, 'main');
		});

		this._uiElements.forEach(uiElement => {
			if (uiElement.draw) uiElement.draw(this._camera, 'main');
		});
	}

	start() { this._gameLoop.start(); }

	pause() {
		this._paused = true;
		this._gameLoop.stop();
	}

	isPaused() { return this._paused; }

	reset() {
		this._paused = false;
		this._staticObjects = new SpriteArray();
		this._movingObjects = new SpriteArray();
		this._mouseX = this._camera.getCentreOfViewport();
		this._mouseY = 0;
		this._player.reset();
		this._player.setMapPosition(0, 0, 0);
		this.start();
	}
}

export default Game;
