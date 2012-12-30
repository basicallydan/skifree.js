var Sprite = require(__dirname + '/../js/sprite');
var assert = require('assert');
var should = require('should');
var sugar = require('sugar');

describe('Sprite', function() {
	describe('#setSpeed()', function() {
		it('should set the correct speed', function() {
			var sprite = new Sprite();

			sprite.setSpeed(5);

			assert.equal(5, sprite.getSpeed());
		});
	});

	describe('#setPosition()', function() {
		it('should set the correct position', function() {
			var sprite = new Sprite();

			sprite.setPosition(5, 10);

			assert.equal(5, sprite.getXPosition());
			assert.equal(10, sprite.getYPosition());
		});
	});

	describe('#moveToward()', function() {
		it('should move the sprite along at the given speed', function() {
			var sprite = new Sprite();

			sprite.setSpeed(3);

			sprite.setPosition(5, 10);

			sprite.moveToward(10, 18);

			assert.equal(8, sprite.getXPosition());
			assert.equal(13, sprite.getYPosition());
		});

		it('should be able to decrease in one dimension and increase in another', function() {
			var sprite = new Sprite();

			sprite.setSpeed(3);

			sprite.setPosition(5, 10);

			sprite.moveToward(1, 18);

			assert.equal(2, sprite.getXPosition());
			assert.equal(13, sprite.getYPosition());
		});

		it('should be able to decrease in both dimensions', function() {
			var sprite = new Sprite();

			sprite.setSpeed(3);

			sprite.setPosition(5, 10);

			sprite.moveToward(1, 1);

			assert.equal(2, sprite.getXPosition());
			assert.equal(7, sprite.getYPosition());
		});

		it('should move the sprite to the target position if it is nearer than the speed', function() {
			var sprite = new Sprite();

			sprite.setSpeed(3);

			sprite.setPosition(5, 10);

			sprite.moveToward(7, 11);

			assert.equal(7, sprite.getXPosition());
			assert.equal(11, sprite.getYPosition());
		});

		it('should move up if the y-difference is absolutely greater than the y-position', function() {
			var sprite = new Sprite();

			sprite.setSpeed(3);

			sprite.setPosition(6, 20);

			sprite.moveToward(-50, -10);

			sprite.getXPosition().should.equal(3);
			sprite.getYPosition().should.equal(17);
		});
	});

	describe('#hit()', function() {
		it('should not register two objects as having hit if they do intersect in any dimension', function() {
			var object1 = new Sprite();
			var object2 = new Sprite();

			object1.setPosition(1, 1);
			object1.setHeight(10);
			object1.setWidth(10);

			object2.setPosition(15, 15);
			object2.setHeight(10);
			object2.setWidth(10);

			object1.hits(object2).should.equal(false);
		});

		it('should not register two objects as having hit if they intersect in the X dimension', function() {
			var object1 = new Sprite();
			var object2 = new Sprite();

			object1.setPosition(1, 1);
			object1.setHeight(10);
			object1.setWidth(10);

			object2.setPosition(3, 15);
			object2.setHeight(10);
			object2.setWidth(10);

			object1.hits(object2).should.equal(false);
			object2.hits(object1).should.equal(false);
		});

		it('should not register two objects as having hit if they intersect in the Y dimension', function() {
			var object1 = new Sprite();
			var object2 = new Sprite();

			object1.setPosition(1, 1);
			object1.setHeight(10);
			object1.setWidth(10);

			object2.setPosition(15, 2);
			object2.setHeight(10);
			object2.setWidth(10);

			object1.hits(object2).should.equal(false);
			object2.hits(object1).should.equal(false);
		});

		it('should register two objects as having hit if they intersect in both dimensions', function() {
			var object1 = new Sprite();
			var object2 = new Sprite();

			object1.setPosition(1, 1);
			object1.setHeight(10);
			object1.setWidth(10);

			object2.setPosition(3, 3);
			object2.setHeight(10);
			object2.setWidth(10);

			object1.hits(object2).should.not.equal(false);
			object2.hits(object1).should.not.equal(false);
		});
	});
});