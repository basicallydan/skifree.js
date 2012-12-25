function Monster(data) {
	var that = new Sprite(data);
	var super_draw = that.superior('draw');
	var spriteVersion = 1;

	that.draw = function(dContext) {
		var spritePartToUse = function () {
			var xDiff = that.movingToward[0] - that.x;
			if (spriteVersion + 0.1 > 2) {
				spriteVersion = 0.1;
			} else {
				spriteVersion += 0.1;
			}
			if (xDiff >= 0) {
				return 'sEast' + Math.ceil(spriteVersion);
			} else if (xDiff < 0) {
				return 'sWest' + Math.ceil(spriteVersion);
			}
		};

		return super_draw(dContext, spritePartToUse());
	};

	return that;
}