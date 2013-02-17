var Sprite = require('./Sprite');

(function(global) {
	function Skier(data) {
		var that = new Sprite(data);
		var sup = {
			draw: that.superior('draw'),
			cycle: that.superior('cycle'),
			hits: that.superior('hits')
		};
		var directions = {
			esEast: function(xDiff) { return xDiff > 300; },
			sEast: function(xDiff) { return xDiff > 75; },
			wsWest: function(xDiff) { return xDiff < -300; },
			sWest: function(xDiff) { return xDiff < -75; }
		};

		var cancelableStateTimeout;

		var canSpeedBoost = true;

		var obstaclesHit = [];
		var pixelsTravelled = 0;
		var standardSpeed = 5;

		that.isMoving = true;
		that.hasBeenHit = false;
		that.isJumping = false;
		that.setSpeed(standardSpeed);

		that.reset = function () {
			obstaclesHit = [];
			pixelsTravelled = 0;
			that.isMoving = true;
			that.hasBeenHit = false;
			canSpeedBoost = true;
		};

		function getDirection() {
			var xDiff = that.movingToward[0] - that.mapPosition[0];
			var yDiff = that.movingToward[1] - that.mapPosition[1];
			if (yDiff <= 0) {
				if (xDiff > 0) {
					return 'east';
				} else {
					return 'west';
				}
			}

			if (directions.esEast(xDiff)) {
				return 'esEast';
			} else if (directions.sEast(xDiff)) {
				return 'sEast';
			} else if (directions.wsWest(xDiff)) {
				return 'wsWest';
			} else if (directions.sWest(xDiff)) {
				return 'sWest';
			}
			return 'south';
		}

		function getBeingEatenSprite() {
			return 'blank';
		}

		function getJumpingSprite() {
			return 'jumping';
		}

		that.setMapPositionTarget = function (x, y) {
			if (that.hasBeenHit) return;

			if (y > that.mapPosition[1]) {
				that.isMoving = true;
			} else {
				that.isMoving = false;
				// y = that.mapPosition[1];
			}

			if (Math.abs(that.mapPosition[0] - x) <= 75) {
				x = that.mapPosition[0];
			}

			that.movingToward = [ x, y ];
		};

		that.getPixelsTravelledDownMountain = function () {
			return pixelsTravelled;
		};

		that.resetSpeed = function () {
			that.setSpeed(standardSpeed);
		};

		that.cycle = function () {
			if (that.isMoving) {
				pixelsTravelled += that.speed;
			}

			sup.cycle();
			
			that.checkHittableObjects();
		};

		that.draw = function(dContext) {
			var spritePartToUse = function () {
				if (that.isBeingEaten) {
					return getBeingEatenSprite();
				}

				if (that.isJumping) {
					return getJumpingSprite();
				}

				if (that.hasBeenHit) {
					return 'hit';
				}

				return getDirection();
			};

			return sup.draw(dContext, spritePartToUse());
		};

		that.hits = function (obs) {
			if (obstaclesHit.indexOf(obs.id) !== -1) {
				return false;
			}

			if (!obs.occupiesZIndex(that.canvasZ)) {
				return false;
			}

			if (sup.hits(obs)) {
				return true;
			}

			return false;
		};

		that.speedBoost = function () {
			var originalSpeed = that.speed;
			if (canSpeedBoost) {
				canSpeedBoost = false;
				that.setSpeed(that.speed * 2);
				setTimeout(function () {
					that.setSpeed(originalSpeed);
					setTimeout(function () {
						canSpeedBoost = true;
					}, 10000);
				}, 2000);
			}
		};

		that.hasHitObstacle = function (obs) {
			that.isMoving = false;
			that.hasBeenHit = true;
			that.canvasZ = 0;
			that.isJumping = false;

			obstaclesHit.push(obs.id);

			that.resetSpeed();

			if (cancelableStateTimeout) {
				clearTimeout(cancelableStateTimeout);
			}
			cancelableStateTimeout = setTimeout(function() {
				that.isMoving = true;
				that.hasBeenHit = false;
			}, 1500);
		};

		that.hasHitJump = function () {
			that.isMoving = true;
			that.hasBeenHit = false;
			that.isJumping = true;
			that.canvasZ = 1;
			// that.incrementSpeedBy(1);
			if (cancelableStateTimeout) {
				clearTimeout(cancelableStateTimeout);
			}
			cancelableStateTimeout = setTimeout(function() {
				that.canvasZ = 0;
				that.isJumping = false;
				// that.incrementSpeedBy(-1);
			}, 1000);
		};

		that.isEatenBy = function (monster, whenEaten) {
			that.hasHitObstacle(monster);
			monster.startEating(whenEaten);
			obstaclesHit.push(monster.id);
			that.isMoving = false;
			that.isBeingEaten = true;
		};

		that.reset = function () {
			obstaclesHit = [];
			pixelsTravelled = 0;
			that.isMoving = true;
			that.hasBeenHit = false;
			canSpeedBoost = true;
		};

		return that;
	}

	global.skier = Skier;
})(this);

if (typeof module !== 'undefined') {
	module.exports = this.skier;
}
