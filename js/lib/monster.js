import Sprite from './sprite';

class Monster extends Sprite {
	constructor(data) {
		super(data);
		this.spriteVersion = 1;
		this.eatingStage = 0;
		this.standardSpeed = 6;
	
		this.isEating = false;
		this.isFull = false;
		this.setSpeed(this.standardSpeed);
	}

	draw(dContext) {
		const spritePartToUse = () => {
			var xDiff = this.movingToward[0] - this.canvasX;

			if (this.isEating) {
				return 'eating' + eatingStage;
			}

			if (this.spriteVersion + 0.1 > 2) {
				this.spriteVersion = 0.1;
			} else {
				this.spriteVersion += 0.1;
			}
			if (xDiff >= 0) {
				return 'sEast' + Math.ceil(this.spriteVersion);
			} else if (xDiff < 0) {
				return 'sWest' + Math.ceil(this.spriteVersion);
			}
		};

		return super.draw(dContext, spritePartToUse());
	};

	startEating(whenDone) {
		this.eatingStage += 1;
		this.isEating = true;
		this.isMoving = false;
		if (eatingStage < 6) {
			setTimeout(function () {
				startEating(whenDone);
			}, 300);
		} else {
			eatingStage = 0;
			this.isEating = false;
			this.isMoving = true;
			whenDone();
		}
	}
}

export default Monster;
