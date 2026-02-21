class InfoBox {
	constructor(data) {
		this.lines = data.initialLines;
		this.top = data.position.top;
		this.right = data.position.right;
		this.bottom = data.position.bottom;
		this.left = data.position.left;
		this.width = data.width;
		this.height = data.height;
	}

	setLines(lines) {
		this.lines = lines;
	}

	draw(dContext) {
		dContext.font = '11px monospace';
		var yOffset = 0;
		this.lines.forEach(line => {
			var fontSize = +dContext.font.slice(0, 2);
			var textWidth = dContext.measureText(line).width;
			var textHeight = fontSize * 1.5;
			var xPos, yPos;

			if (this.top) {
				yPos = this.top + yOffset;
			} else if (this.bottom) {
				yPos = dContext.logicalHeight() - this.bottom - textHeight + yOffset;
			}

			if (this.right) {
				xPos = dContext.logicalWidth() - this.right - textWidth;
			} else if (this.left) {
				xPos = this.left;
			}

			yOffset += textHeight;
			dContext.fillText(line, xPos, yPos);
		});
	}
}

export default InfoBox;
