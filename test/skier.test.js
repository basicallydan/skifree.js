var extenders = require(__dirname + '/../js/extenders');
var Sprite = require(__dirname + '/../js/sprite');
var Skier = require(__dirname + '/../js/skier');
var should = require('should');
var sugar = require('sugar');

describe('Skier', function() {
	describe('#getMovingTowardOpposite()', function() {
		it('should return the point relative to the skier, rotated 180 degrees around the skier if the skier is going right', function() {
			var skier = new Skier();
			skier.setPosition(10, 30);
			skier.moveToward(100, 36);

			skier.getMovingTowardOpposite()[0].should.equal(-90);
			skier.getMovingTowardOpposite()[1].should.equal(-6);
		});

		it('should return the point relative to the skier, rotated 180 degrees around the skier if the skier is going left', function() {
			var skier = new Skier();
			skier.setPosition(10, 30);
			skier.moveToward(-100, 36);

			skier.getMovingTowardOpposite()[0].should.equal(110);
			skier.getMovingTowardOpposite()[1].should.equal(-6);
		});
	});
});