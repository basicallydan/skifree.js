var extenders = require(__dirname + '/../js/lib/extenders');
var Sprite = require(__dirname + '/../js/sprite');
var Skier = require(__dirname + '/../js/skier');
var should = require('should');
var sugar = require('sugar');

describe('Skier', function() {
	describe('#getMovingTowardOpposite()', function() {
		it('should return the point relative to the skier, rotated 180 degrees around the skier if the skier is going right', function() {
			var skier = new Skier();
			skier.setSpeed(3);
			skier.setMapPosition(10, 30);
			skier.setMapPositionTarget(100, 36);

			skier.getMovingTowardOpposite()[0].should.equal(-90);
			skier.getMovingTowardOpposite()[1].should.equal(-6);
		});

		it('should return the point relative to the skier, rotated 180 degrees around the skier if the skier is going left', function() {
			var skier = new Skier();
			skier.setSpeed(3);
			skier.setMapPosition(10, 30);
			skier.setMapPositionTarget(-100, 36);

			skier.getMovingTowardOpposite()[0].should.equal(110);
			skier.getMovingTowardOpposite()[1].should.equal(-6);
		});
	});

	describe('#hits()', function() {
		it('should still hit taller objects if jumping', function() {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.hasHitJump();
			
			var tallSprite = new Sprite({
				zIndexesOccupied : [0, 1]
			});

			tallSprite.setHeight(10);
			tallSprite.setWidth(10);
			tallSprite.setMapPosition(10, 30);

			skier.hits(tallSprite).should.equal(true);
		});

		it('should still hit taller objects with a high-up z-index if jumping', function() {
			var skier = new Skier();
			skier.setMapPosition(30, 25);
			skier.setHeight(10);
			skier.setWidth(10);
			skier.hasHitJump();
			
			var tallSprite = new Sprite({
				zIndexesOccupied : [0, 1],
				hitBoxes: {
					0: [0, 15, 10, 20],
					1: [0, 5, 10, 15]
				}
			});

			tallSprite.setHeight(20);
			tallSprite.setWidth(10);
			tallSprite.setMapPosition(30, 30);

			skier.hits(tallSprite).should.equal(true);
		});

		it('should not hit shorter objects if jumping', function() {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.hasHitJump();

			var shortSprite = new Sprite({
				zIndexesOccupied : [0]
			});

			shortSprite.setHeight(10);
			shortSprite.setWidth(10);
			shortSprite.setMapPosition(10, 30);

			skier.hits(shortSprite).should.equal(false);
		});
	});
});