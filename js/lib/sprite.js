import GUID from './guid.js';

class Sprite {
	constructor(data) {
		this._hittableObjects = {};
		this._zIndexesOccupied = [0];
		this._trackedSpriteToMoveToward = undefined;

		this.direction = undefined;
		this.mapPosition = [0, 0, 0];
		this.id = GUID();
		this.canvasX = 0;
		this.canvasY = 0;
		this.canvasZ = 0;
		this.height = 0;
		this.speed = 0;
		this.data = data || { parts: {} };
		this.movingToward = [0, 0];
		this.metresDownTheMountain = 0;
		this.movingWithConviction = false;
		this.deleted = false;

		if (!this.data.parts) {
			this.data.parts = {};
		}

		const heights = Object.values(this.data.parts).map(p => p[3]);
		this.maxHeight = heights.length ? Math.max(...heights) : undefined;
		this.isMoving = true;

		if (data && data.id) {
			this.id = data.id;
		}

		if (data && data.zIndexesOccupied) {
			this._zIndexesOccupied = data.zIndexesOccupied;
		}
	}

	_incrementX(amount) {
		this.canvasX += parseFloat(amount);
	}

	_incrementY(amount) {
		this.canvasY += parseFloat(amount);
	}

	_getHitBox(forZIndex) {
		if (this.data.hitBoxes && this.data.hitBoxes[forZIndex]) {
			return this.data.hitBoxes[forZIndex];
		}
	}

	_roundHalf(num) {
		return Math.round(num * 2) / 2;
	}

	// dt is a frame-time multiplier (1.0 = one target frame of 20ms).
	// Multiply all movement by dt so speed stays consistent across frame rates.
	_move(dt = 1) {
		if (!this.isMoving) {
			return;
		}

		var currentX = this.mapPosition[0];
		var currentY = this.mapPosition[1];

		if (typeof this.direction !== 'undefined') {
			var d = this.direction - 90;
			if (d < 0) d = 360 + d;
			currentX += this._roundHalf(this.speed * dt * Math.cos(d * (Math.PI / 180)));
			currentY += this._roundHalf(this.speed * dt * Math.sin(d * (Math.PI / 180)));
		} else {
			if (typeof this.movingToward[0] !== 'undefined') {
				if (currentX > this.movingToward[0]) {
					currentX -= Math.min(this.getSpeedX() * dt, Math.abs(currentX - this.movingToward[0]));
				} else if (currentX < this.movingToward[0]) {
					currentX += Math.min(this.getSpeedX() * dt, Math.abs(currentX - this.movingToward[0]));
				}
			}

			if (typeof this.movingToward[1] !== 'undefined') {
				if (currentY > this.movingToward[1]) {
					currentY -= Math.min(this.getSpeedY() * dt, Math.abs(currentY - this.movingToward[1]));
				} else if (currentY < this.movingToward[1]) {
					currentY += Math.min(this.getSpeedY() * dt, Math.abs(currentY - this.movingToward[1]));
				}
			}
		}

		this.setMapPosition(currentX, currentY);
	}

	draw(dCtx, spriteFrame) {
		var fr = this.data.parts[spriteFrame];
		this.height = fr[3];
		this.width = fr[2];

		var newCanvasPosition = dCtx.mapPositionToCanvasPosition(this.mapPosition);
		this.setCanvasPosition(newCanvasPosition[0], newCanvasPosition[1]);

		dCtx.drawImage(dCtx.getLoadedImage(this.data.$imageFile), fr[0], fr[1], fr[2], fr[3], this.canvasX, this.canvasY, fr[2], fr[3]);
	}

	setMapPosition(x, y, z) {
		if (typeof x === 'undefined') x = this.mapPosition[0];
		if (typeof y === 'undefined') y = this.mapPosition[1];
		if (typeof z === 'undefined') {
			z = this.mapPosition[2];
		} else {
			this._zIndexesOccupied = [z];
		}
		this.mapPosition = [x, y, z];
	}

	setCanvasPosition(cx, cy) {
		if (cx) {
			if (typeof cx === 'string' && (cx[0] === '+' || cx[0] === '-')) this._incrementX(cx);
			else this.canvasX = cx;
		}
		if (cy) {
			if (typeof cy === 'string' && (cy[0] === '+' || cy[0] === '-')) this._incrementY(cy);
			else this.canvasY = cy;
		}
	}

	getCanvasPositionX() { return this.canvasX; }
	getCanvasPositionY() { return this.canvasY; }

	getLeftHitBoxEdge(zIndex) {
		zIndex = zIndex || 0;
		var lhbe = this.getCanvasPositionX();
		if (this._getHitBox(zIndex)) lhbe += this._getHitBox(zIndex)[0];
		return lhbe;
	}

	getTopHitBoxEdge(zIndex) {
		zIndex = zIndex || 0;
		var thbe = this.getCanvasPositionY();
		if (this._getHitBox(zIndex)) thbe += this._getHitBox(zIndex)[1];
		return thbe;
	}

	getRightHitBoxEdge(zIndex) {
		zIndex = zIndex || 0;
		if (this._getHitBox(zIndex)) return this.canvasX + this._getHitBox(zIndex)[2];
		return this.canvasX + this.width;
	}

	getBottomHitBoxEdge(zIndex) {
		zIndex = zIndex || 0;
		if (this._getHitBox(zIndex)) return this.canvasY + this._getHitBox(zIndex)[3];
		return this.canvasY + this.height;
	}

	getPositionInFrontOf() {
		return [this.canvasX, this.canvasY + this.height];
	}

	setSpeed(s) {
		this.speed = s;
		this.speedX = s;
		this.speedY = s;
	}

	incrementSpeedBy(s) {
		this.speed += s;
	}

	getSpeed() { return this.speed; }
	getSpeedX() { return this.speed; }
	getSpeedY() { return this.speed; }

	setHeight(h) { this.height = h; }
	setWidth(w) { this.width = w; }
	getMaxHeight() { return this.maxHeight; }

	checkHittableObjects() {
		Object.keys(this._hittableObjects).forEach(k => {
			var objectData = this._hittableObjects[k];
			if (objectData.object.deleted) {
				delete this._hittableObjects[k];
			} else {
				if (objectData.object.hits(this)) {
					objectData.callbacks.forEach(callback => callback(this, objectData.object));
				}
			}
		});
	}

	cycle(dt = 1) {
		this.checkHittableObjects();

		if (this._trackedSpriteToMoveToward) {
			this.setMapPositionTarget(
				this._trackedSpriteToMoveToward.mapPosition[0],
				this._trackedSpriteToMoveToward.mapPosition[1],
				true
			);
		}

		this._move(dt);
	}

	setMapPositionTarget(x, y, override) {
		if (override) {
			this.movingWithConviction = false;
		}

		if (!this.movingWithConviction) {
			if (typeof x === 'undefined') x = this.movingToward[0];
			if (typeof y === 'undefined') y = this.movingToward[1];
			this.movingToward = [x, y];
			this.movingWithConviction = false;
		}
	}

	setDirection(angle) {
		if (angle >= 360) angle = 360 - angle;
		this.direction = angle;
		this.movingToward = undefined;
	}

	resetDirection() {
		this.direction = undefined;
	}

	setMapPositionTargetWithConviction(cx, cy) {
		this.setMapPositionTarget(cx, cy);
		this.movingWithConviction = true;
	}

	follow(sprite) {
		this._trackedSpriteToMoveToward = sprite;
	}

	stopFollowing() {
		this._trackedSpriteToMoveToward = false;
	}

	onHitting(objectToHit, callback) {
		if (this._hittableObjects[objectToHit.id]) {
			return this._hittableObjects[objectToHit.id].callbacks.push(callback);
		}
		this._hittableObjects[objectToHit.id] = {
			object: objectToHit,
			callbacks: [callback]
		};
	}

	deleteOnNextCycle() {
		this.deleted = true;
	}

	occupiesZIndex(z) {
		return this._zIndexesOccupied.indexOf(z) >= 0;
	}

	hits(other) {
		var verticalIntersect = false;
		var horizontalIntersect = false;
		var z = this.mapPosition[2];

		if (other.getTopHitBoxEdge(z) <= this.getBottomHitBoxEdge(z) && other.getBottomHitBoxEdge(z) >= this.getBottomHitBoxEdge(z)) {
			verticalIntersect = true;
		}
		if (other.getTopHitBoxEdge(z) <= this.getTopHitBoxEdge(z) && other.getBottomHitBoxEdge(z) >= this.getTopHitBoxEdge(z)) {
			verticalIntersect = true;
		}
		if (other.getLeftHitBoxEdge(z) <= this.getRightHitBoxEdge(z) && other.getRightHitBoxEdge(z) >= this.getRightHitBoxEdge(z)) {
			horizontalIntersect = true;
		}
		if (other.getLeftHitBoxEdge(z) <= this.getLeftHitBoxEdge(z) && other.getRightHitBoxEdge(z) >= this.getLeftHitBoxEdge(z)) {
			horizontalIntersect = true;
		}

		return verticalIntersect && horizontalIntersect;
	}

	isAboveOnCanvas(cy) {
		return (this.canvasY + this.height) < cy;
	}

	isBelowOnCanvas(cy) {
		return this.canvasY > cy;
	}

	static createObjects(spriteInfoArray, opts) {
		if (!Array.isArray(spriteInfoArray)) spriteInfoArray = [spriteInfoArray];
		opts = Object.assign({ rateModifier: 0, dropRate: 1, position: [0, 0] }, opts);

		function createOne(spriteInfo) {
			var position = opts.position;
			if (Math.floor(Math.random() * (101 + opts.rateModifier)) <= spriteInfo.dropRate) {
				var sprite = new Sprite(spriteInfo.sprite);
				sprite.setSpeed(0);

				if (typeof position === 'function') {
					position = position();
				}

				sprite.setMapPosition(position[0], position[1]);

				if (spriteInfo.sprite.hitBehaviour && spriteInfo.sprite.hitBehaviour.skier && opts.player) {
					sprite.onHitting(opts.player, spriteInfo.sprite.hitBehaviour.skier);
				}

				return sprite;
			}
		}

		return spriteInfoArray.map(createOne).filter(x => x !== undefined);
	}
}

export default Sprite;
