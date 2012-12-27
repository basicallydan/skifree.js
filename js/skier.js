function Skier(data) {
	var that = new Sprite(data);
	var super_draw = that.superior('draw');
	that.isMoving = true;
	that.hasBeenHit = false;

	that.moveToward = function (cx, cy) {
		if (that.hasBeenHit) return;

		if (cy > that.y) {
			that.isMoving = true;
		} else {
			that.isMoving = false;
		}
		that.movingToward = [ cx, cy ];
	};

	that.getMovingTowardOpposite = function () {
		if (!that.isMoving || that.hasBeenHit) {
			return [0, 0];
		}

		var skierMouseX = (that.movingToward[0] - that.getXPosition());
		var skierMouseY = (that.movingToward[1] - that.getYPosition());

		var oppositeX = (Math.abs(skierMouseX) > 75 ? skierMouseX * 10 : 0);
		var oppositeY = (Math.abs(skierMouseY) > 75 ? skierMouseY * 10 : 0);

		return [ oppositeX, oppositeY ];
	};

	that.draw = function(dContext) {
		var spritePartToUse = function () {
			if (that.hasBeenHit) {
				return 'hit';
			}
			
			var xDiff = that.movingToward[0] - that.x;
			var yDiff = that.movingToward[1] - that.y;
			if (yDiff < 0) {
				if (xDiff > 0) {
					return 'east';
				} else {
					return 'west';
				}
			}

			if (xDiff > 300) {
				return 'esEast';
			} else if (xDiff > 75) {
				return 'sEast';
			} else if (xDiff < -300) {
				return 'wsWest';
			} else if (xDiff < -76) {
				return 'sWest';
			}
			return 'south';
		};

		return super_draw(dContext, spritePartToUse());
	};

	that.hasHitObstacle = function(obs) {
		that.isMoving = false;
		that.hasBeenHit = true;
		setTimeout (function() {
			that.isMoving = true;
			that.hasBeenHit = false;
		}, 2000);
	};

	return that;
}