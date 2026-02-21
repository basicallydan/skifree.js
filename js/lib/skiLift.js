import Sprite from './sprite.js';
import { SKI_LIFT_STANDARD_SPEED } from './constants.js';

class SkiLift extends Sprite {
	constructor(data) {
		super(data);
		this.setSpeed(SKI_LIFT_STANDARD_SPEED);
	}

	draw(dContext) {
		return super.draw(dContext, 'main');
	}

	cycle(dt = 1) {
		return super.cycle(dt);
	}
}

export default SkiLift;
