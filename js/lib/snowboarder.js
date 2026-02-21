import Sprite from './sprite.js';
import { SNOWBOARDER_STANDARD_SPEED } from './constants.js';

class Snowboarder extends Sprite {
	constructor(data) {
		super(data);
		this._standardSpeed = SNOWBOARDER_STANDARD_SPEED;
		this.setSpeed(this._standardSpeed);
	}

	_getDirection() {
		var xDiff = this.movingToward[0] - this.mapPosition[0];
		return xDiff > 0 ? 'sEast' : 'sWest';
	}

	cycle(dContext) {
		if (Math.floor(Math.random() * 11) === 1) {
			this.setMapPositionTarget(dContext.getRandomlyInTheCentreOfMap());
			this.setSpeed(this._standardSpeed + Math.floor(Math.random() * 3) - 1);
		}
		this.setMapPositionTarget(undefined, dContext.getMapBelowViewport() + 600);
		super.cycle();
	}

	draw(dContext) {
		return super.draw(dContext, this._getDirection());
	}
}

export default Snowboarder;
