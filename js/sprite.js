(function (global) {
	var GUID = require('./lib/guid');
	function Sprite (data) {
		var hittableObjects = {};
		var zIndexesOccupied = [ 0 ];
		var that = this;
		that.id = GUID();
		that.x = 0;
		that.y = 0;
		that.z = 0;
		that.height = 0;
		that.speed = 3;
		that.data = data || { parts : {} };
		that.movingToward = [ 0, 0 ];
		that.metresDownTheMountain = 0;
		that.movingWithConviction = false;
		that.deleted = false;
		that.maxHeight = (function () {
			return Object.values(that.data.parts).map(function (p) { return p[3]; }).max();
		}());

		if (!that.data.parts) {
			that.data.parts = {};
		}

		if (data && data.id){
			that.id = data.id;
		}

		if (data && data.zIndexesOccupied) {
			zIndexesOccupied = data.zIndexesOccupied;
		}

		function incrementX(amount) {
			that.x += amount.toNumber();
		}

		function incrementY(amount) {
			that.y += amount.toNumber();
		}

		function getHitBox(forZIndex) {
			if (that.data.hitBoxes) {
				if (data.hitBoxes[forZIndex]) {
					return data.hitBoxes[forZIndex];
				}
			}
		}

		this.draw = function draw (dCtx, spriteFrame) {
			var fr = that.data.parts[spriteFrame];
			that.height = fr[3];
			that.width = fr[2];
			dCtx.drawImage(dCtx.getLoadedImage(that.data.$imageFile), fr[0], fr[1], fr[2], fr[3], that.x, that.y, fr[2], fr[3]);
		};

		this.setPosition = function setPosition (cx, cy) {
			if (cx) {
				if (Object.isString(cx) && (cx.first() === '+' || cx.first() === '-')) incrementX(cx);
				else that.x = cx;
			}
			
			if (cy) {
				if (Object.isString(cy) && (cy.first() === '+' || cy.first() === '-')) incrementY(cy);
				else that.y = cy;
			}
		};

		this.getXPosition = function getXPosition () {
			return that.x;
		};

		this.getYPosition = function getYPosition () {
			return that.y;
		};

		this.getLeftHitBoxEdge = function getLeftHitBoxEdge(zIndex) {
			zIndex = zIndex || 0;
			var lhbe = this.getXPosition();
			if (getHitBox(zIndex)) {
				lhbe += getHitBox(zIndex)[0];
			}
			return lhbe;
		};

		this.getTopHitBoxEdge = function getTopHitBoxEdge(zIndex) {
			zIndex = zIndex || 0;
			var thbe = this.getYPosition();
			if (getHitBox(zIndex)) {
				thbe += getHitBox(zIndex)[1];
			}
			return thbe;
		};

		this.getRightHitBoxEdge = function getRightHitBoxEdge(zIndex) {
			zIndex = zIndex || 0;

			if (getHitBox(zIndex)) {
				return that.x + getHitBox(zIndex)[2];
			}

			return that.x + that.width;
		};

		this.getBottomHitBoxEdge = function getBottomHitBoxEdge(zIndex) {
			zIndex = zIndex || 0;

			if (getHitBox(zIndex)) {
				return that.y + getHitBox(zIndex)[3];
			}

			return that.y + that.height;
		};

		this.getPositionInFrontOf = function getPositionInFrontOf () {
			return [that.x, that.y + that.height];
		};

		this.setSpeed = function (s) {
			that.speed = s;
		};

		this.incrementSpeedBy = function (s) {
			that.speed += s;
		};

		that.getSpeed = function getSpeed () {
			return that.speed;
		};

		this.setHeight = function setHeight (h) {
			that.height = h;
		};

		this.setWidth = function setHeight (w) {
			that.width = w;
		};

		this.getMaxHeight = function getMaxHeight() {
			return that.maxHeight;
		};

		that.getMovingTowardOpposite = function () {
			if (!that.isMoving) {
				return [0, 0];
			}

			var dx = (that.movingToward[0] - that.getXPosition());
			var dy = (that.movingToward[1] - that.getYPosition());

			var oppositeX = (Math.abs(dx) > 75 ? 0 - dx : 0);
			var oppositeY = -dy;

			return [ oppositeX, oppositeY ];
		};

		this.cycle = function () {
			Object.keys(hittableObjects, function (k, objectData) {
				if (objectData.object.deleted) {
					delete hittableObjects[k];
				} else {
					if (objectData.object.hits(that)) {
						objectData.callbacks.each(function (callback) {
							callback(that, objectData.object);
						});
					}
				}
			});
		};

		this.move = function () {
			if (typeof that.movingToward[0] !== 'undefined') {
				if (that.x > that.movingToward[0]) {
					that.x -= Math.min(that.speed, Math.abs(that.x - that.movingToward[0]));
				} else if (that.x < that.movingToward[0]) {
					that.x += Math.min(that.speed, Math.abs(that.x - that.movingToward[0]));
				}
			}
			
			if (typeof that.movingToward[1] !== 'undefined') {
				if (that.y > that.movingToward[1]) {
					that.y -= Math.min(that.speed, Math.abs(that.y - that.movingToward[1]));
				} else if (that.y < that.movingToward[1]) {
					that.y += Math.min(that.speed, Math.abs(that.y - that.movingToward[1]));
				}
			}
		};

		this.moveToward = function (cx, cy, override) {
			if (override) {
				that.movingWithConviction = false;
			}

			if (!that.movingWithConviction) {
				that.movingToward = [ cx, cy ];

				that.movingWithConviction = false;
			}

			that.move();
		};

		this.moveAwayFromSprite = function (otherSprite) {
			var opposite = otherSprite.getMovingTowardOpposite();
			that.setSpeed(otherSprite.getSpeed());

			var moveTowardX = that.getXPosition() + opposite[0];
			var moveTowardY = that.getYPosition() + opposite[1];

			that.moveToward(moveTowardX, moveTowardY);
		};

		this.moveTowardWithConviction = function (cx, cy) {
			that.moveToward(cx, cy);
			that.movingWithConviction = true;
		};

		this.onHitting = function (objectToHit, callback) {
			if (hittableObjects[objectToHit.id]) {
				return hittableObjects[objectToHit.id].callbacks.push(callback);
			}

			hittableObjects[objectToHit.id] = {
				object: objectToHit,
				callbacks: [ callback ]
			};
		};

		this.deleteOnNextCycle = function () {
			that.deleted = true;
		};

		this.occupiesZIndex = function (z) {
			return zIndexesOccupied.indexOf(z) >= 0;
		};

		this.hits = function (other) {
			var verticalIntersect = false;
			var horizontalIntersect = false;

			// Test that THIS has a bottom edge inside of the other object
			if (other.getTopHitBoxEdge(that.z) <= that.getBottomHitBoxEdge(that.z) && other.getBottomHitBoxEdge(that.z) >= that.getBottomHitBoxEdge(that.z)) {
				verticalIntersect = true;
			}

			// Test that THIS has a top edge inside of the other object
			if (other.getTopHitBoxEdge(that.z) <= that.getTopHitBoxEdge(that.z) && other.getBottomHitBoxEdge(that.z) >= that.getTopHitBoxEdge(that.z)) {
				verticalIntersect = true;
			}

			// Test that THIS has a right edge inside of the other object
			if (other.getLeftHitBoxEdge(that.z) <= that.getRightHitBoxEdge(that.z) && other.getRightHitBoxEdge(that.z) >= that.getRightHitBoxEdge(that.z)) {
				horizontalIntersect = true;
			}

			// Test that THIS has a left edge inside of the other object
			if (other.getLeftHitBoxEdge(that.z) <= that.getLeftHitBoxEdge(that.z) && other.getRightHitBoxEdge(that.z) >= that.getLeftHitBoxEdge(that.z)) {
				horizontalIntersect = true;
			}

			return verticalIntersect && horizontalIntersect;
		};

		this.isAbove = function (cy) {
			return (that.y + that.height) < cy;
		};

		return that;
	}

	global.sprite = Sprite;
})( this );


if (typeof module !== 'undefined') {
	module.exports = this.sprite;
}