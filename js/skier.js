function Skier(data) {
	var that = new Sprite(data);
	var super_draw = that.superior('draw');

	that.draw = function(dContext) {
		var spritePartToUse = function () {
			var xDiff = that.movingToward[0] - that.x;
			if (xDiff > 200) {
				return 'esEast';
			} else if (xDiff > 75) {
				return 'sEast';
			} else if (xDiff < -200) {
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