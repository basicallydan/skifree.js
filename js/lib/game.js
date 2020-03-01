import SpriteArray from './spriteArray';
import EventedLoop from 'eventedloop';

class Game {
	constructor(mainCanvas, player) {
		this.mainCanvas = mainCanvas;
		this.player = player;

		this.staticObjects = new SpriteArray();
		this.movingObjects = new SpriteArray();
		this.uiElements = new SpriteArray();
		this.dContext = this.mainCanvas.getContext('2d');
		this.mouseX = this.dContext.getCentreOfViewport();
		this.mouseY = 0;
		this.paused = false;
		this.beforeCycleCallbacks = [];
		this.afterCycleCallbacks = [];
		this.gameLoop = new EventedLoop();

		this.player.setMapPosition(0, 0);
		this.player.setMapPositionTarget(0, -10);
		this.dContext.followSprite(this.player);

		this.intervalNum = 0;

		this.gameLoop.on('20', this.cycle.bind(this));
		this.gameLoop.on('20', this.draw.bind(this));
	}

	addStaticObject(sprite) {
		this.staticObjects.push(sprite);
	}

	addStaticObjects(sprites) {
		sprites.forEach(this.addStaticObject.bind(this));
	}

	addMovingObject(movingObject, movingObjectType) {
		if (movingObjectType) {
			this.staticObjects.onPush(function (obj) {
				if (obj.data && obj.data.hitBehaviour[movingObjectType]) {
					obj.onHitting(movingObject, obj.data.hitBehaviour[movingObjectType]);
				}
			}, true);
		}

		this.movingObjects.push(movingObject);
	}

	addUIElement(element) {
		this.uiElements.push(element);
	}

	beforeCycle(callback) {
		this.beforeCycleCallbacks.push(callback);
	}

	afterCycle(callback) {
		this.afterCycleCallbacks.push(callback);
	}

	setMouseX(x) {
		this.mouseX = x;
	}

	setMouseY(y) {
		this.mouseY = y;
	}

	cycle() {
		this.beforeCycleCallbacks.each(function(c) {
			c();
		});

		// Clear canvas
		var mouseMapPosition = this.dContext.canvasPositionToMapPosition([this.mouseX, this.mouseY]);

		if (!this.player.isJumping) {
			this.player.setMapPositionTarget(mouseMapPosition[0], mouseMapPosition[1]);
		}

		this.intervalNum++;

		this.player.cycle();

		this.movingObjects.each(movingObject => {
			movingObject.cycle(this.dContext);
		});
		
		this.staticObjects.cull();
		this.staticObjects.each(staticObject => {
			if (staticObject.cycle) {
				staticObject.cycle();
			}
		});

		this.uiElements.each(uiElement => {
			if (uiElement.cycle) {
				uiElement.cycle();
			}
		});

		this.afterCycleCallbacks.each(c => {
			c();
		});
	}

	draw() {
		// Clear canvas
		this.mainCanvas.width = this.mainCanvas.width;

		this.player.draw(this.dContext);

		this.player.cycle();

		this.movingObjects.each((movingObject, i) => {
			movingObject.draw(this.dContext);
		});
		
		this.staticObjects.each((staticObject, i) => {
			if (staticObject.draw) {
				staticObject.draw(this.dContext, 'main');
			}
		});

		this.uiElements.each((uiElement, i) => {
			if (uiElement.draw) {
				uiElement.draw(this.dContext, 'main');
			}
		});
	}

	start() {
		this.gameLoop.start();
	}

	pause() {
		this.paused = true;
		this.gameLoop.stop();
	}

	isPaused() {
		return this.paused;
	}

	reset() {
		paused = false;
		staticObjects = new SpriteArray();
		movingObjects = new SpriteArray();
		mouseX = dContext.getCentreOfViewport();
		mouseY = 0;
		player.reset();
		player.setMapPosition(0, 0, 0);
		this.start();
	}
}
	
export default Game;
