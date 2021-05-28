import GUID from './guid';

class Sprite {
	constructor(data) {
		this.data = data || { parts : {} }
		this.hittableObjects = {}
		this.zIndexesOccupied = [ 0 ];
		this.trackedSpriteToMoveToward;
		this.direction = undefined;
		this.mapPosition = [0, 0, 0];
		this.id = GUID();
		this.canvasX = 0;
		this.canvasY = 0;
		this.canvasZ = 0;
		this.height = 0;
		this.speed = 0;
		this.movingToward = [ 0, 0 ];
		this.metresDownTheMountain = 0;
		this.movingWithConviction = false;
		this.deleted = false;
		this.maxHeight = Object.values(this.data.parts).map(p => p[3]).max();
		this.isMoving = true;
	
		if (!this.data.parts) {
			this.data.parts = {}
		}
	
		if (this.data && this.data.id){
			this.id = this.data.id;
		}
	
		if (this.data && this.data.zIndexesOccupied) {
			this.zIndexesOccupied = this.data.zIndexesOccupied;
		}
	}

	incrementX(amount) {
		this.canvasX += amount.toNumber();
	}

	incrementY(amount) {
		this.canvasY += amount.toNumber();
	}

	getHitBox(forZIndex) {
		if (this.data.hitBoxes) {
			if (this.data.hitBoxes[forZIndex]) {
				return this.data.hitBoxes[forZIndex];
			}
		}
	}

	roundHalf(num) {
		num = Math.round(num*2)/2;
		return num;
	}

	move() {
		if (!this.isMoving) {
			return;
		}

		var currentX = this.mapPosition[0];
		var currentY = this.mapPosition[1];

		if (typeof this.direction !== 'undefined') {
			// For this we need to modify the this.direction so it relates to the horizontal
			var d = this.direction - 90;
			if (d < 0) d = 360 + d;
			currentX += this.roundHalf(this.speed * Math.cos(d * (Math.PI / 180)));
			currentY += this.roundHalf(this.speed * Math.sin(d * (Math.PI / 180)));
		} else {
			if (typeof this.movingToward[0] !== 'undefined') {
				if (currentX > this.movingToward[0]) {
					currentX -= Math.min(this.getSpeedX(), Math.abs(currentX - this.movingToward[0]));
				} else if (currentX < this.movingToward[0]) {
					currentX += Math.min(this.getSpeedX(), Math.abs(currentX - this.movingToward[0]));
				}
			}
			
			if (typeof this.movingToward[1] !== 'undefined') {
				if (currentY > this.movingToward[1]) {
					currentY -= Math.min(this.getSpeedY(), Math.abs(currentY - this.movingToward[1]));
				} else if (currentY < this.movingToward[1]) {
					currentY += Math.min(this.getSpeedY(), Math.abs(currentY - this.movingToward[1]));
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
		if (typeof x === 'undefined') {
			x = this.mapPosition[0];
		}
		if (typeof y === 'undefined') {
			y = this.mapPosition[1];
		}
		if (typeof z === 'undefined') {
			z = this.mapPosition[2];
		} else {
			this.zIndexesOccupied = [ z ];
		}
		this.mapPosition = [x, y, z];
	}

	setCanvasPosition(cx, cy) {
		if (cx) {
			if (Object.isString(cx) && (cx.first() === '+' || cx.first() === '-')) this.incrementX(cx);
			else this.canvasX = cx;
		}
		
		if (cy) {
			if (Object.isString(cy) && (cy.first() === '+' || cy.first() === '-')) this.incrementY(cy);
			else this.canvasY = cy;
		}
	}

	getCanvasPositionX() {
		return this.canvasX;
	}

	getCanvasPositionY() {
		return this.canvasY;
	}

	getLeftHitBoxEdge(zIndex) {
		zIndex = zIndex || 0;
		var lhbe = this.getCanvasPositionX();
		if (this.getHitBox(zIndex)) {
			lhbe += this.getHitBox(zIndex)[0];
		}
		return lhbe;
	}

	getTopHitBoxEdge(zIndex) {
		zIndex = zIndex || 0;
		var thbe = this.getCanvasPositionY();
		if (this.getHitBox(zIndex)) {
			thbe += this.getHitBox(zIndex)[1];
		}
		return thbe;
	}

	getRightHitBoxEdge(zIndex) {
		zIndex = zIndex || 0;

		if (this.getHitBox(zIndex)) {
			return this.canvasX + this.getHitBox(zIndex)[2];
		}

		return this.canvasX + this.width;
	}

	getBottomHitBoxEdge(zIndex) {
		zIndex = zIndex || 0;

		if (this.getHitBox(zIndex)) {
			return this.canvasY + this.getHitBox(zIndex)[3];
		}

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

	getSpeed() {
		return this.speed;
	}

	getSpeedX() {
		return this.speed;
	}

	getSpeedY() {
		return this.speed;
	}

	setHeight(h) {
		this.height = h;
	}

	setWidth(w) {
		this.width = w;
	}

	getMaxHeight() {
		return this.maxHeight;
	}

	getMovingTowardOpposite() {
		if (!this.isMoving) {
			return [0, 0];
		}

		var dx = (this.movingToward[0] - this.mapPosition[0]);
		var dy = (this.movingToward[1] - this.mapPosition[1]);

		var oppositeX = (Math.abs(dx) > 75 ? 0 - dx : 0);
		var oppositeY = -dy;

		return [ oppositeX, oppositeY ];
	}

	checkHittableObjects() {
		Object.keys(this.hittableObjects, (k, objectData) => {
			if (objectData.object.deleted) {
				delete this.hittableObjects[k];
			} else {
				if (objectData.object.hits(this)) {
					objectData.callbacks.each( (callback) => {
						callback(this, objectData.object);
					});
				}
			}
		});
	}

	cycle() {
		this.checkHittableObjects();

		if (this.trackedSpriteToMoveToward) {
			this.setMapPositionTarget(this.trackedSpriteToMoveToward.mapPosition[0], this.trackedSpriteToMoveToward.mapPosition[1], true);
		}

		this.move();
	}

	setMapPositionTarget(x, y, override) {
		if (override) {
			this.movingWithConviction = false;
		}

		if (!this.movingWithConviction) {
			if (typeof x === 'undefined') {
				x = this.movingToward[0];
			}

			if (typeof y === 'undefined') {
				y = this.movingToward[1];
			}

			this.movingToward = [ x, y ];

			this.movingWithConviction = false;
		}

		// this.resetDirection();
	}

	setDirection(angle) {
		if (angle >= 360) {
			angle = 360 - angle;
		}
		this.direction = angle;
		this.movingToward = undefined;
	}

	resetDirection() {
		this.direction = undefined;
	}

	setMapPositionTargetWithConviction(cx, cy) {
		this.setMapPositionTarget(cx, cy);
		this.movingWithConviction = true;
		// this.resetDirection();
	}

	follow(sprite) {
		this.trackedSpriteToMoveToward = sprite;
		// this.resetDirection();
	}

	stopFollowing() {
		this.trackedSpriteToMoveToward = false;
	}

	onHitting(objectToHit, callback) {
		if (this.hittableObjects[objectToHit.id]) {
			return this.hittableObjects[objectToHit.id].callbacks.push(callback);
		}

		this.hittableObjects[objectToHit.id] = {
			object: objectToHit,
			callbacks: [ callback ]
		}
	}

	deleteOnNextCycle() {
		this.deleted = true;
	}

	occupiesZIndex(z) {
		return this.zIndexesOccupied.indexOf(z) >= 0;
	}

	hits(other) {
		var verticalIntersect = false;
		var horizontalIntersect = false;

		// Test this.THIS has a bottom edge inside of the other object
		if (other.getTopHitBoxEdge(this.mapPosition[2]) <= this.getBottomHitBoxEdge(this.mapPosition[2]) && other.getBottomHitBoxEdge(this.mapPosition[2]) >= this.getBottomHitBoxEdge(this.mapPosition[2])) {
			verticalIntersect = true;
		}

		// Test this.THIS has a top edge inside of the other object
		if (other.getTopHitBoxEdge(this.mapPosition[2]) <= this.getTopHitBoxEdge(this.mapPosition[2]) && other.getBottomHitBoxEdge(this.mapPosition[2]) >= this.getTopHitBoxEdge(this.mapPosition[2])) {
			verticalIntersect = true;
		}

		// Test this.THIS has a right edge inside of the other object
		if (other.getLeftHitBoxEdge(this.mapPosition[2]) <= this.getRightHitBoxEdge(this.mapPosition[2]) && other.getRightHitBoxEdge(this.mapPosition[2]) >= this.getRightHitBoxEdge(this.mapPosition[2])) {
			horizontalIntersect = true;
		}

		// Test this.THIS has a left edge inside of the other object
		if (other.getLeftHitBoxEdge(this.mapPosition[2]) <= this.getLeftHitBoxEdge(this.mapPosition[2]) && other.getRightHitBoxEdge(this.mapPosition[2]) >= this.getLeftHitBoxEdge(this.mapPosition[2])) {
			horizontalIntersect = true;
		}

		return verticalIntersect && horizontalIntersect;
	}

	isAboveOnCanvas(cy) {
		return (this.canvasY + this.height) < cy;
	}

	isBelowOnCanvas(cy) {
		return (this.canvasY) > cy;
	}
}

Sprite.createObjects = function createObjects(spriteInfoArray, opts) {
	if (!Array.isArray(spriteInfoArray)) spriteInfoArray = [ spriteInfoArray ];
	opts = Object.merge(opts, {
		rateModifier: 0,
		dropRate: 1,
		position: [0, 0]
	}, false, false);

	function createOne (spriteInfo) {
		var position = opts.position;
		if (Number.random(100 + opts.rateModifier) <= spriteInfo.dropRate) {
			var sprite = new Sprite(spriteInfo.sprite);
			sprite.setSpeed(0);

			if (Object.isFunction(position)) {
				position = position();
			}

			sprite.setMapPosition(position[0], position[1]);

			if (spriteInfo.sprite.hitBehaviour && spriteInfo.sprite.hitBehaviour.skier && opts.player) {
				sprite.onHitting(opts.player, spriteInfo.sprite.hitBehaviour.skier);
			}

			return sprite;
		}
	}

	var objects = spriteInfoArray.map(createOne).remove(undefined);

	return objects;
}

export default Sprite;
