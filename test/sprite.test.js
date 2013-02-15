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

			sprite.setPositionTarget(10, 18);

			sprite.cycle();

			assert.equal(8, sprite.getXPosition());
			assert.equal(13, sprite.getYPosition());
		});

		it('should be able to decrease in one dimension and increase in another', function() {
			var sprite = new Sprite();

			sprite.setSpeed(3);

			sprite.setPosition(5, 10);

			sprite.setPositionTarget(1, 18);

			sprite.cycle();

			assert.equal(2, sprite.getXPosition());
			assert.equal(13, sprite.getYPosition());
		});

		it('should be able to decrease in both dimensions', function() {
			var sprite = new Sprite();

			sprite.setSpeed(3);

			sprite.setPosition(5, 10);

			sprite.setPositionTarget(1, 1);

			sprite.cycle();

			assert.equal(2, sprite.getXPosition());
			assert.equal(7, sprite.getYPosition());
		});

		it('should move the sprite to the target position if it is nearer than the speed', function() {
			var sprite = new Sprite();

			sprite.setSpeed(3);

			sprite.setPosition(5, 10);

			sprite.setPositionTarget(7, 11);

			sprite.cycle();

			assert.equal(7, sprite.getXPosition());
			assert.equal(11, sprite.getYPosition());
		});

		it('should move up if the y-difference is absolutely greater than the y-position', function() {
			var sprite = new Sprite();

			sprite.setSpeed(3);

			sprite.setPosition(6, 20);

			sprite.setPositionTarget(-50, -10);

			sprite.cycle();

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

		it('should not register two objects with hitboxes as having hit if they intersect in both dimensions but their hitboxes do not', function() {
			var object1 = new Sprite({
				hitBoxes: {
					0: [ 0, 5, 10, 10 ]
				}
			});
			var object2 = new Sprite({
				hitBoxes: {
					0: [ 0, 5, 10, 10 ]
				}
			});
			var object3 = new Sprite({
				hitBoxes: {
					0: [ 0, 0, 5, 5 ]
				}
			});
			var object4 = new Sprite({
				hitBoxes: {
					0: [ 0, 0, 10, 10 ]
				}
			});

			object1.setPosition(0, 0);
			object1.setHeight(10);
			object1.setWidth(10);

			object2.setPosition(0, 9);
			object2.setHeight(10);
			object2.setWidth(10);

			object3.setPosition(20, 0);
			object3.setHeight(10);
			object3.setWidth(10);

			object4.setPosition(20, 9);
			object4.setHeight(10);
			object4.setWidth(10);

			object1.hits(object2).should.equal(false);
			object2.hits(object1).should.equal(false);

			object3.hits(object4).should.equal(false);
			object4.hits(object3).should.equal(false);
		});
	});

	describe('#onHitting()', function () {
		it('should run the appropriate callback when two things hit in a cycle', function() {
			var object1 = new Sprite();
			var object2 = new Sprite();
			var testString = 'not hit';
			
			object1.setPosition(1, 1);
			object1.setHeight(10);
			object1.setWidth(10);

			object2.setPosition(3, 3);
			object2.setHeight(10);
			object2.setWidth(10);

			object1.onHitting(object2, function () {
				testString = 'hit';
			});

			object1.cycle();

			testString.should.equal('hit');
		});

		it('should not register the hit if a hittable object has been deleted', function() {
			var object1 = new Sprite();
			var object2 = new Sprite();
			var testString = 'not hit';

			object1.setPosition(1, 1);
			object1.setHeight(10);
			object1.setWidth(10);

			object2.setPosition(3, 3);
			object2.setHeight(10);
			object2.setWidth(10);

			object1.onHitting(object2, function () {
				testString = 'hit';
			});

			object2.deleteOnNextCycle();
			object1.cycle();

			testString.should.equal('not hit');
		});
	});
});