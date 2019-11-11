import Sprite from './sprite';

class Snowboarder extends Sprite {
	constructor(data) {
		super(data);
		this.directions = {
			sEast: function(xDiff) { return xDiff > 0; },
			sWest: function(xDiff) { return xDiff <= 0; }
		};
		var standardSpeed = 3;
	
		this.setSpeed(standardSpeed);
	}

	getDirection() {
		var xDiff = this.movingToward[0] - this.mapPosition[0];

		if (this.directions.sEast(xDiff)) {
			return 'sEast';
		} else {
			return 'sWest';
		}
	}

	cycle(dContext) {
		if (Number.random(10) === 1) {
			this.setMapPositionTarget(dContext.getRandomlyInTheCentreOfMap());
			this.setSpeed(this.standardSpeed + Number.random(-1, 1));
		}

		this.setMapPositionTarget(undefined, dContext.getMapBelowViewport() + 600);

		super.cycle();
	}

	draw(dContext) {
		return super.draw(dContext, this.getDirection());
	}
}

export default Snowboarder