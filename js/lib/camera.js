class Camera {
	constructor(ctx) {
		this._ctx = ctx;
		this._images = {};
		this._centralSprite = null;
	}

	// Logical (CSS) dimensions — independent of devicePixelRatio.
	// All game coordinate calculations must use these so that world coordinates
	// stay in logical pixels regardless of the backing-store scale.
	logicalWidth() {
		const styleWidth = this._ctx.canvas.style.width;
		return styleWidth ? parseFloat(styleWidth) : this._ctx.canvas.width;
	}

	logicalHeight() {
		const styleHeight = this._ctx.canvas.style.height;
		return styleHeight ? parseFloat(styleHeight) : this._ctx.canvas.height;
	}

	storeLoadedImage(key, image) {
		this._images[key] = image;
	}

	getLoadedImage(key) {
		return this._images[key];
	}

	followSprite(sprite) {
		this._centralSprite = sprite;
	}

	getCentralPosition() {
		return {
			map: this._centralSprite.mapPosition,
			canvas: [
				Math.round(this.logicalWidth() * 0.5),
				Math.round(this.logicalHeight() * 0.5),
				0
			]
		};
	}

	mapPositionToCanvasPosition(position) {
		var central = this.getCentralPosition();
		var mapDifferenceX = central.map[0] - position[0];
		var mapDifferenceY = central.map[1] - position[1];
		return [central.canvas[0] - mapDifferenceX, central.canvas[1] - mapDifferenceY];
	}

	canvasPositionToMapPosition(position) {
		var central = this.getCentralPosition();
		var mapDifferenceX = central.canvas[0] - position[0];
		var mapDifferenceY = central.canvas[1] - position[1];
		return [central.map[0] - mapDifferenceX, central.map[1] - mapDifferenceY];
	}

	getCentreOfViewport() {
		return Math.floor(this.logicalWidth() / 2);
	}

	getMiddleOfViewport() {
		return Math.floor(this.logicalHeight() / 2);
	}

	getBelowViewport() {
		return Math.floor(this.logicalHeight());
	}

	getMapBelowViewport() {
		var below = this.getBelowViewport();
		return this.canvasPositionToMapPosition([0, below])[1];
	}

	getAboveViewport() {
		return 0 - Math.floor(this.logicalHeight() / 4);
	}

	getTopOfViewport() {
		return this.canvasPositionToMapPosition([0, 0])[1];
	}

	getRandomlyInTheCentreOfCanvas(buffer) {
		var min = 0;
		var max = this.logicalWidth();
		if (buffer) {
			min -= buffer;
			max += buffer;
		}
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	getRandomlyInTheCentreOfMap(buffer) {
		var random = this.getRandomlyInTheCentreOfCanvas(buffer);
		return this.canvasPositionToMapPosition([random, 0])[0];
	}

	getRandomMapPositionBelowViewport() {
		var xCanvas = this.getRandomlyInTheCentreOfCanvas();
		var yCanvas = this.getBelowViewport();
		return this.canvasPositionToMapPosition([xCanvas, yCanvas]);
	}

	getRandomMapPositionAboveViewport() {
		var xCanvas = this.getRandomlyInTheCentreOfCanvas();
		var yCanvas = this.getAboveViewport();
		return this.canvasPositionToMapPosition([xCanvas, yCanvas]);
	}

	// Returns a proxy that forwards unknown property access to the underlying
	// CanvasRenderingContext2D, so callers can use native canvas API methods
	// (drawImage, fillText, measureText, clearRect, font, canvas, etc.) directly.
	static create(ctx) {
		const camera = new Camera(ctx);
		return new Proxy(camera, {
			get(target, prop) {
				if (prop in target) {
					const val = target[prop];
					return typeof val === 'function' ? val.bind(target) : val;
				}
				const ctxVal = ctx[prop];
				if (typeof ctxVal === 'function') return ctxVal.bind(ctx);
				return ctxVal;
			},
			set(target, prop, value) {
				if (prop in target) {
					target[prop] = value;
				} else {
					ctx[prop] = value;
				}
				return true;
			}
		});
	}
}

export default Camera;
