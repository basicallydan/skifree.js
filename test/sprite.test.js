var Sprite = require(__dirname + '/../js/lib/sprite');
var assert = require('assert');
var should = require('should');
var sugar = require('sugar');

describe('Sprite', function() {
	describe('#setSpeed()', function() {
		it('should set the correct speed', function() {
			var sprite = new Sprite();

			sprite.setSpeed(5);

			sprite.getSpeed().should.equal(5);
		});
	});

	describe('#setCanvasPosition()', function() {
		it('should set the correct position', function() {
			var sprite = new Sprite();

			sprite.setMapPosition(5, 10);

			sprite.mapPosition[0].should.equal(5);
			sprite.mapPosition[1].should.equal(10);
		});
	});

	describe('#cycle()', function() {
		it('should move the sprite along at the given speed', function() {
			var sprite = new Sprite();

			sprite.setSpeed(3);

			sprite.setMapPosition(5, 10);

			sprite.setMapPositionTarget(10, 18);

			sprite.cycle();

			sprite.mapPosition[0].should.equal(8);
			sprite.mapPosition[1].should.equal(13);
		});

		it('should not move the sprite along if it is not moving', function() {
			var sprite = new Sprite();

			sprite.setSpeed(3);

			sprite.isMoving = false;

			sprite.setMapPosition(5, 10);

			sprite.setMapPositionTarget(10, 18);

			sprite.cycle();

			sprite.mapPosition[0].should.equal(5);
			sprite.mapPosition[1].should.equal(10);
		});

		it('should allow the sprite to move in in opposite directions on either axis', function() {
			var sprite = new Sprite();

			sprite.setSpeed(3);

			sprite.setMapPosition(5, 10);

			sprite.setMapPositionTarget(1, 18);

			sprite.cycle();

			sprite.mapPosition[0].should.equal(2);
			sprite.mapPosition[1].should.equal(13);
		});

		it('should be able to decrease in both dimensions', function() {
			var sprite = new Sprite();

			sprite.setSpeed(3);

			sprite.setMapPosition(5, 10);

			sprite.setMapPositionTarget(1, 1);

			sprite.cycle();

			sprite.mapPosition[0].should.equal(2);
			sprite.mapPosition[1].should.equal(7);
		});

		it('should move the sprite to the target position if it is nearer than the speed', function() {
			var sprite = new Sprite();

			sprite.setSpeed(3);

			sprite.setMapPosition(5, 10);

			sprite.setMapPositionTarget(7, 11);

			sprite.cycle();

			assert.equal(7, sprite.mapPosition[0]);
			assert.equal(11, sprite.mapPosition[1]);
		});

		it('should move up if the y-difference is absolutely greater than the y-position', function() {
			var sprite = new Sprite();

			sprite.setSpeed(3);

			sprite.setMapPosition(6, 20);

			sprite.setMapPositionTarget(-50, -10);

			sprite.cycle();

			sprite.mapPosition[0].should.equal(3);
			sprite.mapPosition[1].should.equal(17);
		});
	});

	describe('#hit()', function() {
		it('should not register two objects as having hit if they do intersect in any dimension', function() {
			var object1 = new Sprite();
			var object2 = new Sprite();

			object1.setCanvasPosition(1, 1);
			object1.setHeight(10);
			object1.setWidth(10);

			object2.setCanvasPosition(15, 15);
			object2.setHeight(10);
			object2.setWidth(10);

			object1.hits(object2).should.equal(false);
		});

		it('should not register two objects as having hit if they intersect in the X dimension', function() {
			var object1 = new Sprite();
			var object2 = new Sprite();

			object1.setCanvasPosition(1, 1);
			object1.setHeight(10);
			object1.setWidth(10);

			object2.setCanvasPosition(3, 15);
			object2.setHeight(10);
			object2.setWidth(10);

			object1.hits(object2).should.equal(false);
			object2.hits(object1).should.equal(false);
		});

		it('should not register two objects as having hit if they intersect in the Y dimension', function() {
			var object1 = new Sprite();
			var object2 = new Sprite();

			object1.setCanvasPosition(1, 1);
			object1.setHeight(10);
			object1.setWidth(10);

			object2.setCanvasPosition(15, 2);
			object2.setHeight(10);
			object2.setWidth(10);

			object1.hits(object2).should.equal(false);
			object2.hits(object1).should.equal(false);
		});

		it('should register two objects as having hit if they intersect in both dimensions', function() {
			var object1 = new Sprite();
			var object2 = new Sprite();

			object1.setCanvasPosition(1, 1);
			object1.setHeight(10);
			object1.setWidth(10);

			object2.setCanvasPosition(3, 3);
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

			object1.setCanvasPosition(0, 0);
			object1.setHeight(10);
			object1.setWidth(10);

			object2.setCanvasPosition(0, 9);
			object2.setHeight(10);
			object2.setWidth(10);

			object3.setCanvasPosition(20, 0);
			object3.setHeight(10);
			object3.setWidth(10);

			object4.setCanvasPosition(20, 9);
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
			
			object1.setCanvasPosition(1, 1);
			object1.setHeight(10);
			object1.setWidth(10);

			object2.setCanvasPosition(3, 3);
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

			object1.setCanvasPosition(1, 1);
			object1.setHeight(10);
			object1.setWidth(10);

			object2.setCanvasPosition(3, 3);
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

	describe('#follow()', function () {
		it('should move toward the a stationary sprite it is following', function () {
			var hunter = new Sprite();
			hunter.isMoving = true;
			hunter.setSpeed(1);
			hunter.setMapPosition(5, 20);

			var prey = new Sprite();
			prey.isMoving = false;
			prey.setMapPosition(10, 20);

			hunter.follow(prey);

			hunter.cycle();
			prey.cycle();

			hunter.mapPosition[0].should.equal(6);
			hunter.mapPosition[1].should.equal(20);

			prey.mapPosition[0].should.equal(10);
			prey.mapPosition[1].should.equal(20);
		});
	});

	describe('#setDirection()', function () {
		it('should move down by the speed if the direction is 180 degrees', function () {
			var sprite = new Sprite();
			sprite.isMoving = true;
			sprite.setSpeed(1);
			sprite.setDirection(180);
			sprite.setMapPosition(10, 20);
			sprite.cycle();
			sprite.mapPosition[0].should.equal(10);
			sprite.mapPosition[1].should.equal(21);
		});

		it('should move right by the speed if the direction is 90 degrees', function () {
			var sprite = new Sprite();
			sprite.isMoving = true;
			sprite.setSpeed(1);
			sprite.setDirection(90);
			sprite.setMapPosition(10, 20);
			sprite.cycle();
			sprite.mapPosition[0].should.equal(11);
			sprite.mapPosition[1].should.equal(20);
		});

		it('should move left by the speed if the direction is 270 degrees', function () {
			var sprite = new Sprite();
			sprite.isMoving = true;
			sprite.setSpeed(1);
			sprite.setDirection(270);
			sprite.setMapPosition(10, 20);
			sprite.cycle();
			sprite.mapPosition[0].should.equal(9);
			sprite.mapPosition[1].should.equal(20);
		});

		it('should move right and down by half by the speed if the direction is 135 degrees', function () {
			var sprite = new Sprite();
			sprite.isMoving = true;
			sprite.setSpeed(1);
			sprite.setDirection(135);
			sprite.setMapPosition(10, 20);
			sprite.cycle();
			sprite.mapPosition[0].should.equal(10.5);
			sprite.mapPosition[1].should.equal(20.5);
		});

		it('should move left and down by half by the speed if the direction is 225 degrees', function () {
			var sprite = new Sprite();
			sprite.isMoving = true;
			sprite.setSpeed(1);
			sprite.setDirection(225);
			sprite.setMapPosition(10, 20);
			sprite.cycle();
			sprite.mapPosition[0].should.equal(9.5);
			sprite.mapPosition[1].should.equal(20.5);
		});

		it('should move up by half by the speed if the direction is 0 degrees', function () {
			var sprite = new Sprite();
			sprite.isMoving = true;
			sprite.setSpeed(1);
			sprite.setDirection(0);
			sprite.setMapPosition(10, 20);
			sprite.cycle();
			sprite.mapPosition[0].should.equal(10);
			sprite.mapPosition[1].should.equal(19);
		});
	});
});