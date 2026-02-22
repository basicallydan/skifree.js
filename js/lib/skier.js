import Sprite from './sprite.js';
import {
	SKIER_STANDARD_SPEED,
	SKIER_BOOST_MULTIPLIER,
	SKIER_TURN_EASE_CYCLES,
	SKIER_DEAD_ZONE_X,
	SKIER_DIRECTION_THRESHOLD_SHARP,
	SKIER_BOOST_DURATION_MS,
	SKIER_BOOST_COOLDOWN_MS,
	SKIER_CRASH_RECOVERY_MS,
	SKIER_JUMP_DURATION_MS,
	SKIER_JUMP_SPEED_BONUS,
	SKIER_TRICK_INTERVAL_MS,
} from './constants.js';

if (typeof navigator !== 'undefined') {
	navigator.vibrate = navigator.vibrate ||
		navigator.webkitVibrate ||
		navigator.mozVibrate ||
		navigator.msVibrate;
} else {
	globalThis.navigator = { vibrate: false };
}

const DISCRETE_DIRECTIONS = {
	west:   270,
	wsWest: 240,
	sWest:  195,
	south:  180,
	sEast:  165,
	esEast: 120,
	east:   90
};

class Skier extends Sprite {
	constructor(data) {
		super(data);

		this._cancelableStateTimeout = null;
		this._cancelableStateInterval = null;
		this._canSpeedBoost = true;
		this._obstaclesHit = [];
		this._pixelsTravelled = 0;
		this._standardSpeed = SKIER_STANDARD_SPEED;
		this._turnEaseCycles = SKIER_TURN_EASE_CYCLES;
		this._speedX = 0;
		this._speedXFactor = 0;
		this._speedY = 0;
		this._speedYFactor = 1;
		this._trickStep = 0;

		this.isMoving = true;
		this.hasBeenHit = false;
		this.isJumping = false;
		this.isPerformingTrick = false;
		this.onHitObstacleCb = function() {};

		this.setSpeed(this._standardSpeed);
	}

	_setNormal() {
		this.setSpeed(this._standardSpeed);
		this.isMoving = true;
		this.hasBeenHit = false;
		this.isJumping = false;
		this.isPerformingTrick = false;
		if (this._cancelableStateInterval) clearInterval(this._cancelableStateInterval);
		this.setMapPosition(undefined, undefined, 0);
	}

	_setCrashed() {
		this.isMoving = false;
		this.hasBeenHit = true;
		this.isJumping = false;
		this.isPerformingTrick = false;
		if (this._cancelableStateInterval) clearInterval(this._cancelableStateInterval);
		this.setMapPosition(undefined, undefined, 0);
	}

	_setJumping() {
		var currentSpeed = this.getSpeed();
		this.setSpeed(currentSpeed + SKIER_JUMP_SPEED_BONUS);
		this.setSpeedY(currentSpeed + SKIER_JUMP_SPEED_BONUS);
		this.isMoving = true;
		this.hasBeenHit = false;
		this.isJumping = true;
		this.setMapPosition(undefined, undefined, 1);
	}

	_getDiscreteDirection() {
		if (this.direction) {
			if (this.direction <= 90) return 'east';
			if (this.direction > 90 && this.direction < 150) return 'esEast';
			if (this.direction >= 150 && this.direction < 180) return 'sEast';
			if (this.direction === 180) return 'south';
			if (this.direction > 180 && this.direction <= 210) return 'sWest';
			if (this.direction > 210 && this.direction < 270) return 'wsWest';
			if (this.direction >= 270) return 'west';
			return 'south';
		}

		var xDiff = this.movingToward[0] - this.mapPosition[0];
		var yDiff = this.movingToward[1] - this.mapPosition[1];

		if (yDiff <= 0) {
			return xDiff > 0 ? 'east' : 'west';
		}

		if (xDiff > SKIER_DIRECTION_THRESHOLD_SHARP) return 'esEast';
		if (xDiff > SKIER_DEAD_ZONE_X) return 'sEast';
		if (xDiff < -SKIER_DIRECTION_THRESHOLD_SHARP) return 'wsWest';
		if (xDiff < -SKIER_DEAD_ZONE_X) return 'sWest';

		return 'south';
	}

	_setDiscreteDirection(d) {
		if (DISCRETE_DIRECTIONS[d]) {
			this.setDirection(DISCRETE_DIRECTIONS[d]);
		}
		this.isMoving = (d !== 'west' && d !== 'east');
	}

	_getBeingEatenSprite() { return 'blank'; }
	_getJumpingSprite() { return 'jumping'; }

	_getTrickSprite() {
		if (this._trickStep === 0) return 'jumping';
		if (this._trickStep === 1) return 'somersault1';
		return 'somersault2';
	}

	_easeSpeedToTargetUsingFactor(sp, targetSpeed, f) {
		if (f === 0 || f === 1) return targetSpeed;
		if (sp < targetSpeed) sp += this.getSpeed() * (f / this._turnEaseCycles);
		if (sp > targetSpeed) sp -= this.getSpeed() * (f / this._turnEaseCycles);
		return sp;
	}

	stop() {
		if (this.isJumping) return;
		if (this.direction > 180) {
			this._setDiscreteDirection('west');
		} else {
			this._setDiscreteDirection('east');
		}
	}

	turnEast() {
		if (this.hasBeenHit) return;
		switch (this._getDiscreteDirection()) {
			case 'west':   this._setDiscreteDirection('wsWest'); break;
			case 'wsWest': this._setDiscreteDirection('sWest'); break;
			case 'sWest':  this._setDiscreteDirection('south'); break;
			case 'south':  this._setDiscreteDirection('sEast'); break;
			case 'sEast':  this._setDiscreteDirection('esEast'); break;
			case 'esEast': this._setDiscreteDirection('east'); break;
			default:       this._setDiscreteDirection('south'); break;
		}
	}

	turnWest() {
		if (this.hasBeenHit) return;
		switch (this._getDiscreteDirection()) {
			case 'east':   this._setDiscreteDirection('esEast'); break;
			case 'esEast': this._setDiscreteDirection('sEast'); break;
			case 'sEast':  this._setDiscreteDirection('south'); break;
			case 'south':  this._setDiscreteDirection('sWest'); break;
			case 'sWest':  this._setDiscreteDirection('wsWest'); break;
			case 'wsWest': this._setDiscreteDirection('west'); break;
			default:       this._setDiscreteDirection('south'); break;
		}
	}

	stepWest() {
		if (this.hasBeenHit) return;
		this.mapPosition[0] -= this.speed * 2;
	}

	stepEast() {
		if (this.hasBeenHit) return;
		this.mapPosition[0] += this.speed * 2;
	}

	setMapPositionTarget(x, y) {
		if (this.hasBeenHit) return;
		if (Math.abs(this.mapPosition[0] - x) <= SKIER_DEAD_ZONE_X) {
			x = this.mapPosition[0];
		}
		this.movingToward = [x, y];
	}

	startMovingIfPossible() {
		if (!this.hasBeenHit && !this.isBeingEaten) {
			this.isMoving = true;
		}
	}

	setTurnEaseCycles(c) {
		this._turnEaseCycles = c;
	}

	getPixelsTravelledDownMountain() {
		return this._pixelsTravelled;
	}

	getStandardSpeed() {
		return this._standardSpeed;
	}

	resetSpeed() {
		this.setSpeed(this._standardSpeed);
	}

	setSpeedY(sy) {
		this._speedY = sy;
	}

	getSpeedX() {
		var dir = this._getDiscreteDirection();

		if (dir === 'esEast' || dir === 'wsWest') {
			this._speedXFactor = 0.5;
			this._speedX = this._easeSpeedToTargetUsingFactor(this._speedX, this.getSpeed() * 0.5, 0.5);
			return this._speedX;
		}

		if (dir === 'sEast' || dir === 'sWest') {
			this._speedXFactor = 0.33;
			this._speedX = this._easeSpeedToTargetUsingFactor(this._speedX, this.getSpeed() * 0.33, 0.33);
			return this._speedX;
		}

		this._speedX = this._easeSpeedToTargetUsingFactor(this._speedX, 0, this._speedXFactor);
		return this._speedX;
	}

	getSpeedY() {
		var dir = this._getDiscreteDirection();

		if (this.isJumping) return this._speedY;

		if (dir === 'esEast' || dir === 'wsWest') {
			this._speedYFactor = 0.6;
			this._speedY = this._easeSpeedToTargetUsingFactor(this._speedY, this.getSpeed() * 0.6, 0.6);
			return this._speedY;
		}

		if (dir === 'sEast' || dir === 'sWest') {
			this._speedYFactor = 0.85;
			this._speedY = this._easeSpeedToTargetUsingFactor(this._speedY, this.getSpeed() * 0.85, 0.85);
			return this._speedY;
		}

		if (dir === 'east' || dir === 'west') {
			this._speedYFactor = 1;
			this._speedY = 0;
			return this._speedY;
		}

		// south
		this._speedY = this._easeSpeedToTargetUsingFactor(this._speedY, this.getSpeed(), this._speedYFactor);
		return this._speedY;
	}

	cycle(dt = 1) {
		if (this.getSpeedX() <= 0 && this.getSpeedY() <= 0) {
			this.isMoving = false;
		}
		if (this.isMoving) {
			this._pixelsTravelled += this.speed * dt;
		}
		if (this.isJumping) {
			this.setMapPositionTarget(undefined, this.mapPosition[1] + this.getSpeed() * dt);
		}
		super.cycle(dt);
		this.checkHittableObjects();
	}

	draw(dContext) {
		const spritePartToUse = () => {
			if (this.isBeingEaten) return this._getBeingEatenSprite();
			if (this.isJumping) {
				return this.isPerformingTrick ? this._getTrickSprite() : this._getJumpingSprite();
			}
			if (this.hasBeenHit) return 'hit';
			return this._getDiscreteDirection();
		};

		return super.draw(dContext, spritePartToUse());
	}

	hits(obs) {
		if (this._obstaclesHit.indexOf(obs.id) !== -1) return false;
		if (!obs.occupiesZIndex(this.mapPosition[2])) return false;
		return super.hits(obs);
	}

	speedBoost() {
		var originalSpeed = this.speed;
		if (this._canSpeedBoost) {
			this._canSpeedBoost = false;
			this.setSpeed(this.speed * SKIER_BOOST_MULTIPLIER);
			setTimeout(() => {
				this.setSpeed(originalSpeed);
				setTimeout(() => {
					this._canSpeedBoost = true;
				}, SKIER_BOOST_COOLDOWN_MS);
			}, SKIER_BOOST_DURATION_MS);
		}
	}

	attemptTrick() {
		if (this.isJumping) {
			this.isPerformingTrick = true;
			this._cancelableStateInterval = setInterval(() => {
				this._trickStep = this._trickStep >= 2 ? 0 : this._trickStep + 1;
			}, SKIER_TRICK_INTERVAL_MS);
		}
	}

	hasHitObstacle(obs) {
		this._setCrashed();

		if (navigator.vibrate) {
			navigator.vibrate(500);
		}

		this._obstaclesHit.push(obs.id);
		this.resetSpeed();
		this.onHitObstacleCb(obs);

		if (this._cancelableStateTimeout) clearTimeout(this._cancelableStateTimeout);
		this._cancelableStateTimeout = setTimeout(() => this._setNormal(), SKIER_CRASH_RECOVERY_MS);
	}

	hasHitJump() {
		if (!this.isMoving) return;
		this._setJumping();

		if (this._cancelableStateTimeout) clearTimeout(this._cancelableStateTimeout);
		this._cancelableStateTimeout = setTimeout(() => this._setNormal(), SKIER_JUMP_DURATION_MS);
	}

	isEatenBy(monster, whenEaten) {
		this.hasHitObstacle(monster);
		monster.startEating(whenEaten);
		this._obstaclesHit.push(monster.id);
		this.isMoving = false;
		this.isBeingEaten = true;
	}

	reset() {
		this._obstaclesHit = [];
		this._pixelsTravelled = 0;
		this.isMoving = true;
		this.isJumping = false;
		this.hasBeenHit = false;
		this._canSpeedBoost = true;
	}

	setHitObstacleCb(fn) {
		this.onHitObstacleCb = fn || function() {};
	}
}

export default Skier;
