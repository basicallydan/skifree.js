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
		dContext.font = '11px monospace';
		var yOffset = 0;
		that.lines.each(function (line) {
			var fontSize = +dContext.font.slice(0,2);
			var textWidth = dContext.measureText(line).width;
			var textHeight = fontSize * 1.5;
			var xPos, yPos;
			if (that.top) {
				yPos = that.top + yOffset;
			} else if (that.bottom) {
				yPos = dContext.canvas.height - that.top - textHeight + yOffset;
			}

			if (that.right) {
				xPos = dContext.canvas.width - that.right - textWidth;
			} else if (that.left) {
				xPos = that.left;
			}

			yOffset += textHeight;


			dContext.fillText(line, xPos, yPos);
		});
	};

	return that;
}

if (typeof module !== 'undefined') {
	module.exports = InfoBox;
}
