import Sprite from './sprite.js';
import { MONSTER_STANDARD_SPEED, MONSTER_EATING_INTERVAL_MS, MONSTER_EATING_STAGES } from './constants.js';

class Monster extends Sprite {
	constructor(data) {
		super(data);
		this._spriteVersion = 1;
		this._eatingStage = 0;

		this.isEating = false;
		this.isFull = false;
		this.setSpeed(MONSTER_STANDARD_SPEED);
	}

	draw(dContext) {
		const spritePartToUse = () => {
			var xDiff = this.movingToward[0] - this.canvasX;

			if (this.isEating) {
				return 'eating' + this._eatingStage;
			}

			if (this._spriteVersion + 0.1 > 2) {
				this._spriteVersion = 0.1;
			} else {
				this._spriteVersion += 0.1;
			}

			return xDiff >= 0
				? 'sEast' + Math.ceil(this._spriteVersion)
				: 'sWest' + Math.ceil(this._spriteVersion);
		};

		return super.draw(dContext, spritePartToUse());
	}

	startEating(whenDone) {
		this._eatingStage += 1;
		this.isEating = true;
		this.isMoving = false;
		if (this._eatingStage < MONSTER_EATING_STAGES) {
			setTimeout(() => this.startEating(whenDone), MONSTER_EATING_INTERVAL_MS);
		} else {
			this._eatingStage = 0;
			this.isEating = false;
			this.isMoving = true;
			whenDone();
		}
	}
}

export default Monster;
