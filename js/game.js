var SpriteArray = require('spriteArray');

(function (global) {
	function Game (mainCanvas, player) {
		var staticObjects = new SpriteArray();
		var movingObjects = new SpriteArray();
		var uiElements = new SpriteArray();
		var dContext = mainCanvas.getContext('2d');
		var mouseX = dContext.getCentreOfViewport();
		var mouseY = 0;
		var paused = false;
		var that = this;
		var beforeCycleCallbacks = [];
		var afterCycleCallbacks = [];
		var gameLoop;

		this.addStaticObject = function (sprite) {
			staticObjects.push(sprite);
		};

		this.addMovingObject = function (movingObject, movingObjectType) {
			if (movingObjectType) {
				staticObjects.onPush(function (obj) {
					if (obj.data && obj.data.hitBehaviour[movingObjectType]) {
						obj.onHitting(movingObject, obj.data.hitBehaviour[movingObjectType]);
					}
				}, true);
			}

			movingObjects.push(movingObject);
		};

		this.addUIElement = function (element) {
			uiElements.push(element);
		};

		this.beforeCycle = function (callback) {
			beforeCycleCallbacks.push(callback);
		};

		this.afterCycle = function (callback) {
			afterCycleCallbacks.push(callback);
		};

		this.setMouseX = function (x) {
			mouseX = x;
		};

		this.setMouseY = function (y) {
			mouseY = y;
		};

		player.setMapPosition(0, 0);
		player.setMapPositionTarget(0, -10);
		dContext.followSprite(player);

		var intervalNum = 0;

		this.cycle = function () {
			beforeCycleCallbacks.each(function(c) {
				c();
			});

			// Clear canvas
			mainCanvas.width = mainCanvas.width;
			var mouseMapPosition = dContext.canvasPositionToMapPosition([mouseX, mouseY]);

			if (!player.isJumping) {
				if (intervalNum === 0) {
					console.log('Skier targets: ' + player.movingToward[0] + ', ' + player.movingToward[1]);
				}
				player.setMapPositionTarget(mouseMapPosition[0], mouseMapPosition[1]);
				if (intervalNum === 0) {
					console.log('Skier targets: ' + player.movingToward[0] + ', ' + player.movingToward[1]);
				}
			}

			intervalNum++;

			player.draw(dContext);

			player.cycle();

			movingObjects.each(function (movingObject, i) {
				movingObject.cycle(dContext);
				movingObject.draw(dContext);
			});
			
			staticObjects.cull();
			staticObjects.each(function (staticObject, i) {
				if (staticObject.cycle) {
					staticObject.cycle();
				}
				if (staticObject.draw) {
					staticObject.draw(dContext, 'main');
				}
			});

			uiElements.each(function (uiElement, i) {
				if (uiElement.cycle) {
					uiElement.cycle();
				}
				if (uiElement.draw) {
					uiElement.draw(dContext, 'main');
				}
			});

			afterCycleCallbacks.each(function(c) {
				c();
			});
		};

		this.start = function () {
			gameLoop = setInterval(that.cycle, 10);
		};

		this.pause = function () {
			if (gameLoop) {
				paused = true;
				clearInterval(gameLoop);
			}
		};

		this.isPaused = function () {
			return paused;
		};

		this.reset = function () {
			paused = false;
			staticObjects = new SpriteArray();
			movingObjects = new SpriteArray();
			mouseX = dContext.getCentreOfViewport();
			mouseY = 0;
			if (gameLoop) {
				clearInterval(gameLoop);
			}
			gameLoop = undefined;
			player.reset();
			player.setMapPosition(0, 0, 0);
			that.start();
		};
	}

	global.game = Game;
})( this );


if (typeof module !== 'undefined') {
	module.exports = this.game;
}