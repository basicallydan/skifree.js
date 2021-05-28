import Sprite from './sprite';
if (typeof navigator !== 'undefined') {
	navigator.vibrate = navigator.vibrate ||
		navigator.webkitVibrate ||
		navigator.mozVibrate ||
		navigator.msVibrate;
} else {
	navigator = {
		vibrate: false
	};
}

class Skier extends Sprite {
	constructor(data) {
		super(data);
		this.discreteDirections = {
			'west': 270,
			'wsWest': 240,
			'sWest': 195,
			'south': 180,
			'sEast': 165,
			'esEast': 120,
			'east': 90
		};
		this.sup = {
			draw: this.superior('draw'),
			cycle: this.superior('cycle'),
			getSpeedX: this.superior('getSpeedX'),
			getSpeedY: this.superior('getSpeedY'),
			hits: this.superior('hits')
		};
		this.directions = {
			esEast: function(xDiff) { return xDiff > 300; },
			sEast: function(xDiff) { return xDiff > 75; },
			wsWest: function(xDiff) { return xDiff < -300; },
			sWest: function(xDiff) { return xDiff < -75; }
		};
	
		this.cancelableStateTimeout;
		this.cancelableStateInterval;
	
		this.canSpeedBoost = true;
	
		this.obstaclesHit = [];
		this.pixelsTravelled = 0;
		this.standardSpeed = 5;
		this.boostMultiplier = 2;
		this.turnEaseCycles = 70;
		this.speedX = 0;
		this.speedXFactor = 0;
		this.speedY = 0;
		this.speedYFactor = 1;
		this.trickStep = 0; // There are three of these
	
		this.isMoving = true;
		this.hasBeenHit = false;
		this.isJumping = false;
		this.isPerformingTrick = false;
		this.onHitObstacleCb = function() {};
		this.setSpeed(this.standardSpeed);
	}

	reset() {
		this.obstaclesHit = [];
		this.pixelsTravelled = 0;
		this.isMoving = true;
		this.hasBeenHit = false;
		this.canSpeedBoost = true;
		this.setNormal();
	}

	setNormal() {
		// console.log('back to normal')
		this.setSpeed(this.standardSpeed);
		this.isMoving = true;
		this.hasBeenHit = false;
		this.isJumping = false;
		this.isPerformingTrick = false;
		if (this.cancelableStateInterval) {
			clearInterval(this.cancelableStateInterval);
		}
		this.setMapPosition(undefined, undefined, 0);
	}

	setCrashed() {
		this.isMoving = false;
		this.hasBeenHit = true;
		this.isJumping = false;
		this.isPerformingTrick = false;
		if (this.cancelableStateInterval) {
			clearInterval(this.cancelableStateInterval);
		}
		this.setMapPosition(undefined, undefined, 0);
	}

	setJumping() {
		var currentSpeed = this.getSpeed();
		this.setSpeed(currentSpeed + 2);
		this.setSpeedY(currentSpeed + 2);
		this.isMoving = true;
		this.hasBeenHit = false;
		this.isJumping = true;
		this.setMapPosition(undefined, undefined, 1);
	}

	getDiscreteDirection() {
		if (this.direction) {
			if (this.direction <= 90) {
				return 'east';
			} else if (this.direction > 90 && this.direction < 150) {
				return 'esEast';
			} else if (this.direction >= 150 && this.direction < 180) {
				return 'sEast';
			} else if (this.direction === 180) {
				return 'south';
			} else if (this.direction > 180 && this.direction <= 210) {
				return 'sWest';
			} else if (this.direction > 210 && this.direction < 270) {
				return 'wsWest';
			} else if (this.direction >= 270) {
				return 'west';
			} else {
				return 'south';
			}
		} else {
			var xDiff = this.movingToward[0] - this.mapPosition[0];
			var yDiff = this.movingToward[1] - this.mapPosition[1];
			if (yDiff <= 0) {
				if (xDiff > 0) {
					return 'east';
				} else {
					return 'west';
				}
			}

			if (this.directions.esEast(xDiff)) {
				return 'esEast';
			} else if (this.directions.sEast(xDiff)) {
				return 'sEast';
			} else if (this.directions.wsWest(xDiff)) {
				return 'wsWest';
			} else if (this.directions.sWest(xDiff)) {
				return 'sWest';
			}
		}
		return 'south';
	}

	setDiscreteDirection(d) {
		if (this.discreteDirections[d]) {
			this.setDirection(this.discreteDirections[d]);
		}

		if (d === 'west' || d === 'east') {
			this.isMoving = false;
		} else {
			this.isMoving = true;
		}
	}

	getBeingEatenSprite() {
		return 'blank';
	}

	getJumpingSprite() {
		return 'jumping';
	}

	getTrickSprite() {
		if (this.trickStep === 0) {
			return 'jumping';
		} else if (this.trickStep === 1) {
			return 'somersault1';
		} else {
			return 'somersault2';
		}
	}

	stop() {
		if (this.direction > 180) {
			this.setDiscreteDirection('west');
		} else {
			this.setDiscreteDirection('east');
		}
	}

	turnEast() {
		var discreteDirection = this.getDiscreteDirection();

		switch (discreteDirection) {
			case 'west':
				this.setDiscreteDirection('wsWest');
				break;
			case 'wsWest':
				this.setDiscreteDirection('sWest');
				break;
			case 'sWest':
				this.setDiscreteDirection('south');
				break;
			case 'south':
				this.setDiscreteDirection('sEast');
				break;
			case 'sEast':
				this.setDiscreteDirection('esEast');
				break;
			case 'esEast':
				this.setDiscreteDirection('east');
				break;
			default:
				this.setDiscreteDirection('south');
				break;
		}
	}

	turnWest() {
		var discreteDirection = this.getDiscreteDirection();

		switch (discreteDirection) {
			case 'east':
				this.setDiscreteDirection('esEast');
				break;
			case 'esEast':
				this.setDiscreteDirection('sEast');
				break;
			case 'sEast':
				this.setDiscreteDirection('south');
				break;
			case 'south':
				this.setDiscreteDirection('sWest');
				break;
			case 'sWest':
				this.setDiscreteDirection('wsWest');
				break;
			case 'wsWest':
				this.setDiscreteDirection('west');
				break;
			default:
				this.setDiscreteDirection('south');
				break;
		}
	}

	stepWest() {
		this.mapPosition[0] -= this.speed * 2;
	}

	stepEast() {
		this.mapPosition[0] += this.speed * 2;
	}

	setMapPositionTarget(x, y) {
		if (this.hasBeenHit) return;

		if (Math.abs(this.mapPosition[0] - x) <= 75) {
			x = this.mapPosition[0];
		}

		this.movingToward = [ x, y ];

		// this.resetDirection();
	}

	startMovingIfPossible() {
		if (!this.hasBeenHit && !this.isBeingEaten) {
			this.isMoving = true;
		}
	}

	setTurnEaseCycles(c) {
		this.turnEaseCycles = c;
	}

	getPixelsTravelledDownMountain() {
		return this.pixelsTravelled;
	}

	resetSpeed() {
		this.setSpeed(this.standardSpeed);
	}

	cycle() {
		if (this.getSpeedX() <= 0 && this.getSpeedY() <= 0) {
					this.isMoving = false;
		}
		if (this.isMoving) {
			this.pixelsTravelled += this.speed;
		}

		if (this.isJumping) {
			this.setMapPositionTarget(undefined, this.mapPosition[1] + this.getSpeed());
		}

		super.cycle();
	}

	draw(dContext) {
		const spritePartToUse = () => {
			if (this.isBeingEaten) {
				return this.getBeingEatenSprite();
			}

			if (this.isJumping) {
				if (this.isPerformingTrick) {
					return this.getTrickSprite();
				}
				return this.getJumpingSprite();
			}

			if (this.hasBeenHit) {
				return 'hit';
			}

			return this.getDiscreteDirection();
		};

		return super.draw(dContext, spritePartToUse());
	}

	hits(obs) {
		if (this.obstaclesHit.indexOf(obs.id) !== -1) {
			return false;
		}

		if (!obs.occupiesZIndex(this.mapPosition[2])) {
			return false;
		}

		if (super.hits(obs)) {
			return true;
		}

		return false;
	}

	speedBoost() {
		if (this.canSpeedBoost) {
			var originalSpeed = this.getSpeed();
			this.canSpeedBoost = false;
			this.setSpeed(this.speed * this.boostMultiplier);
			setTimeout(() => {
				this.setSpeed(originalSpeed);
				setTimeout(() => {
					this.canSpeedBoost = true;
				}, 10000);
			}, 2000);
		}
	}

	attemptTrick() {
		if (this.isJumping) {
			this.isPerformingTrick = true;
			this.cancelableStateInterval = setInterval(() => {
				if (this.trickStep >= 2) {
					this.trickStep = 0;
				} else {
					this.trickStep += 1;
				}
			}, 300);
		}
	}

	getStandardSpeed() {
		return this.standardSpeed;
	}

	easeSpeedToTargetUsingFactor(sp, targetSpeed, f) {
		if (f === 0 || f === 1) {
			return targetSpeed;
		}

		if (sp < targetSpeed) {
			sp += this.getSpeed() * (f / this.turnEaseCycles);
		}

		if (sp > targetSpeed) {
			sp -= this.getSpeed() * (f / this.turnEaseCycles);
		}

		return sp;
	}

	getSpeedX() {
		if (this.getDiscreteDirection() === 'esEast' || this.getDiscreteDirection() === 'wsWest') {
			this.speedXFactor = 0.5;
			this.speedX = this.easeSpeedToTargetUsingFactor(this.speedX, this.getSpeed() * this.speedXFactor, this.speedXFactor);

			return this.speedX;
		}

		if (this.getDiscreteDirection() === 'sEast' || this.getDiscreteDirection() === 'sWest') {
			this.speedXFactor = 0.33;
			this.speedX = this.easeSpeedToTargetUsingFactor(this.speedX, this.getSpeed() * this.speedXFactor, this.speedXFactor);

			return this.speedX;
		}

		// So it must be south

		this.speedX = this.easeSpeedToTargetUsingFactor(this.speedX, 0, this.speedXFactor);

		return this.speedX;
	}

	setSpeedY(sy) {
		this.speedY = sy;
	}

	getSpeedY() {
		var targetSpeed;

		if (this.isJumping) {
			return this.speedY;
		}

		if (this.getDiscreteDirection() === 'esEast' || this.getDiscreteDirection() === 'wsWest') {
			this.speedYFactor = 0.6;
			this.speedY = this.easeSpeedToTargetUsingFactor(this.speedY, this.getSpeed() * 0.6, 0.6);

			return this.speedY;
		}

		if (this.getDiscreteDirection() === 'sEast' || this.getDiscreteDirection() === 'sWest') {
			this.speedYFactor = 0.85;
			this.speedY = this.easeSpeedToTargetUsingFactor(this.speedY, this.getSpeed() * 0.85, 0.85);

			return this.speedY;
		}

		if (this.getDiscreteDirection() === 'east' || this.getDiscreteDirection() === 'west') {
			this.speedYFactor = 1;
			this.speedY = 0;

			return this.speedY;
		}

		// So it must be south

		this.speedY = this.easeSpeedToTargetUsingFactor(this.speedY, this.getSpeed(), this.speedYFactor);

		return this.speedY;
	}

	hasHitObstacle(obs) {
		this.setCrashed();

		if (navigator.vibrate) {
			navigator.vibrate(500);
		}

		this.obstaclesHit.push(obs.id);

		this.resetSpeed();
		this.onHitObstacleCb(obs);

		if (this.cancelableStateTimeout) {
			clearTimeout(this.cancelableStateTimeout);
		}
		this.cancelableStateTimeout = setTimeout(() => {
			this.setNormal();
		}, 1500);
	}

	hasHitJump() {
		this.setJumping();

		if (this.cancelableStateTimeout) {
			clearTimeout(this.cancelableStateTimeout);
		}
		this.cancelableStateTimeout = setTimeout(() => {
			this.setNormal();
		}, 1000);
	}

	isEatenBy(monster, whenEaten) {
		this.hasHitObstacle(monster);
		monster.startEating(whenEaten);
		this.obstaclesHit.push(monster.id);
		this.isMoving = false;
		this.isBeingEaten = true;
	}

	reset() {
		this.obstaclesHit = [];
		this.pixelsTravelled = 0;
		this.isMoving = true;
		this.isJumping = false;
		this.hasBeenHit = false;
		this.canSpeedBoost = true;
	}

	setHitObstacleCb(fn) {
		this.onHitObstacleCb = fn || function() {};
	}
}

export default Skier