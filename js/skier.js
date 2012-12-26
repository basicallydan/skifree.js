function Skier(data) {
	var that = new Sprite(data);
	var super_draw = that.superior('draw');
	that.isMoving = true;

	that.moveToward = function (cx, cy) {
		if (cy > that.y) {
			that.isMoving = true;
		} else {
			that.isMoving = false;
		}
		that.movingToward = [ cx, cy ];
	};

	that.getMovingTowardOpposite = function () {
		if (!that.isMoving) {
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
			var xDiff = that.movingToward[0] - that.x;
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

	return that;
}