(function (global) {
	function Sprite (data) {
		var that = this;
		that.x = 0;
		that.y = 0;
		that.height = 0;
		that.speed = 3;
		that.data = data;
		that.movingToward = [ 0, 0 ];
		that.metresDownTheMountain = 0;
		that.movingWithConviction = false;

		function incrementX(amount) {
			that.x += amount.toNumber();
		}

		function incrementY(amount) {
			that.y += amount.toNumber();
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

		this.getLeftEdge = this.getXPosition;

		this.getTopEdge = this.getYPosition;

		this.getRightEdge = function getRightEdge () {
			return that.x + that.width;
		};

		this.getBottomEdge = function getBottomEdge () {
			return that.y + that.height;
		};

		this.getPositionInFrontOf = function getPositionInFrontOf () {
			return [that.x, that.y + that.height];
		};

		this.setSpeed = function setSpeed (s) {
			that.speed = s;
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

		this.move = function move () {
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

		this.moveToward = function moveToward (cx, cy, override) {
			if (override) {
				that.movingWithConviction = false;
			}

			if (!that.movingWithConviction) {
				that.movingToward = [ cx, cy ];

				that.movingWithConviction = false;
			}

			that.move();
		};

		this.moveTowardWithConviction = function moveToward (cx, cy) {
			that.moveToward(cx, cy);
			that.movingWithConviction = true;
		};

		this.hits = function hits (other) {
			var verticalIntersect = false;
			var horizontalIntersect = false;

			// Test that THIS has a bottom edge inside of the other object
			if (other.getTopEdge() <= that.getBottomEdge() && other.getBottomEdge() >= that.getBottomEdge()) {
				verticalIntersect = true;
			}

			// Test that THIS has a top edge inside of the other object
			if (other.getTopEdge() <= that.getTopEdge() && other.getBottomEdge() >= that.getTopEdge()) {
				verticalIntersect = true;
			}

			// Test that THIS has a right edge inside of the other object
			if (other.getLeftEdge() <= that.getRightEdge() && other.getRightEdge() >= that.getRightEdge()) {
				horizontalIntersect = true;
			}

			// Test that THIS has a left edge inside of the other object
			if (other.getLeftEdge() <= that.getLeftEdge() && other.getRightEdge() >= that.getLeftEdge()) {
				horizontalIntersect = true;
			}

			return verticalIntersect && horizontalIntersect;
		};

		this.isAbove = function (cy) {
			return (that.y + that.height) < cy;
		};

		return that;
	}

	global.Sprite = Sprite;
})( this );


if (typeof module !== 'undefined') {
	module.exports = this.Sprite;
}