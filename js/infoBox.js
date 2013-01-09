(function(global) {
	function InfoBox(data) {
		var that = this;

		that.lines = data.initialLines;

		that.top = data.position.top;
		that.right = data.position.right;
		that.bottom = data.position.bottom;
		that.left = data.position.left;

		that.width = data.width;
		that.height = data.height;

		that.setLines = function (lines) {
			that.lines = lines;
		};

		that.draw = function (dContext) {
			var yOffset = 0;
			that.lines.each(function (line) {
				var textSize = dContext.measureText(line);
				var xPos, yPos;
				if (that.top) {
					yPos = that.top;
				} else if (that.bottom) {
					yPos = dContext.canvas.height - that.top - textSize.height;
				}

				if (that.right) {
					xPos = dContext.canvas.width - that.right - textSize.width;
				} else if (that.left) {
					xPos = that.left;
				}

				dContext.fillText(line, xPos, yPos);
			});
		};

		return that;
	}

	global.InfoBox = InfoBox;
})(this);

if (typeof module !== 'undefined') {
	module.exports = this.InfoBox;
}
