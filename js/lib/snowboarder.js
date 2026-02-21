import Sprite from './sprite.js';
import { SNOWBOARDER_STANDARD_SPEED } from './constants.js';

class Snowboarder extends Sprite {
	constructor(data) {
		super(data);
		this._standardSpeed = SNOWBOARDER_STANDARD_SPEED;
		this._camera = null; // set by Game.addMovingObject before first cycle
		this.setSpeed(this._standardSpeed);
	}

	_getDirection() {
		var xDiff = this.movingToward[0] - this.mapPosition[0];
		return xDiff > 0 ? 'sEast' : 'sWest';
	}

	cycle(dt = 1) {
		if (Math.floor(Math.random() * 11) === 1) {
			this.setMapPositionTarget(this._camera.getRandomlyInTheCentreOfMap());
			this.setSpeed(this._standardSpeed + Math.floor(Math.random() * 3) - 1);
		}
		this.setMapPositionTarget(undefined, this._camera.getMapBelowViewport() + 600);
		super.cycle(dt);
	}

	draw(dContext) {
		return super.draw(dContext, this._getDirection());
	}
}

export default Snowboarder;
