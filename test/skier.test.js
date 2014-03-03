var extenders = require(__dirname + '/../js/lib/extenders');
var Sprite = require(__dirname + '/../js/lib/sprite');
var Skier = require(__dirname + '/../js/lib/skier');
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

	describe('#getSpeedX()', function() {
		it('should ease on the x-axis when the skier turns south-east', function () {
			var skier = new Skier();
			skier.setTurnEaseCycles(5);
			skier.setSpeed(4);
			skier.setMapPosition(10, 30);
			skier.setMapPositionTarget(10, 30);
			skier.getSpeedX().should.equal(0);
			skier.setMapPositionTarget(150, 35);
			skier.getSpeedX().should.equal(4 * (0.33 / 5));
			skier.getSpeedX().should.equal(4 * (0.33 / 5) * 2);
			skier.getSpeedX().should.equal(4 * (0.33 / 5) * 3);
			skier.getSpeedX().should.equal(4 * (0.33 / 5) * 4);
			skier.getSpeedX().should.equal(4 * 0.33);
		});

		it('should ease on the x-axis when the skier turns east-south-east', function () {
			var skier = new Skier();
			skier.setTurnEaseCycles(5);
			skier.setSpeed(4);
			skier.setMapPosition(10, 30);
			skier.setMapPositionTarget(10, 30);
			skier.getSpeedX().should.equal(0);
			skier.setMapPositionTarget(450, 35);
			skier.getSpeedX().should.equal(4 * (0.5 / 5));
			skier.getSpeedX().should.equal(4 * (0.5 / 5) * 2);
			skier.getSpeedX().should.equal(4 * (0.5 / 5) * 3);
			skier.getSpeedX().should.equal(4 * (0.5 / 5) * 4);
			skier.getSpeedX().should.equal(4 * 0.5);
		});

		it('should ease on the x-axis back down when the skier turns from east-south-east to south', function () {
			var skier = new Skier();
			skier.setTurnEaseCycles(5);
			skier.setSpeed(4);
			skier.setMapPosition(10, 30);
			skier.setMapPositionTarget(10, 30);
			skier.getSpeedX().should.equal(0);
			skier.setMapPositionTarget(450, 35);
			skier.getSpeedX().should.equal(4 * (0.5 / 5));
			skier.getSpeedX().should.equal(4 * (0.5 / 5) * 2);
			skier.getSpeedX().should.equal(4 * (0.5 / 5) * 3);
			skier.getSpeedX().should.equal(4 * (0.5 / 5) * 4);
			skier.getSpeedX().should.equal(4 * 0.5);
			skier.setMapPositionTarget(10, 35);
			skier.getSpeedX().should.equal(4 * (0.5 / 5) * 4);
		});
	});

	describe('#getSpeedY()', function() {
		it('should ease on the y-axis when the skier turns from east (stationary) to south-east', function () {
			var skier = new Skier();
			skier.setTurnEaseCycles(5);
			skier.setSpeed(4);
			skier.setMapPosition(10, 30);
			skier.setMapPositionTarget(15, 30);
			skier.getSpeedY().should.equal(0);
			skier.setMapPositionTarget(150, 35);
			skier.getSpeedY().should.equal(4 * (0.85 / 5));
			skier.getSpeedY().should.equal(4 * (0.85 / 5) * 2);
			skier.getSpeedY().should.equal(4 * (0.85 / 5) * 3);
			skier.getSpeedY().should.equal(4 * (0.85 / 5) * 4);
			skier.getSpeedY().should.equal(4 * (0.85 / 5) * 5);
		});

		it('should ease on the y-axis when the skier turns from east (stationary) to east-south-east from', function () {
			var skier = new Skier();
			skier.setTurnEaseCycles(5);
			skier.setSpeed(4);
			skier.setMapPosition(10, 30);
			skier.setMapPositionTarget(10, 30);
			skier.getSpeedY().should.equal(0);
			skier.setMapPositionTarget(450, 35);
			skier.getSpeedY().should.equal(4 * (0.6 / 5));
			skier.getSpeedY().should.equal(4 * (0.6 / 5) * 2);
			skier.getSpeedY().should.equal(4 * (0.6 / 5) * 3);
			skier.getSpeedY().should.equal(4 * (0.6 / 5) * 4);
			skier.getSpeedY().should.equal(4 * 0.6);
		});

		it('should ease on the y-axis when the skier turns from east (stationary) to east-south-east to south', function () {
			var skier = new Skier();
			skier.setTurnEaseCycles(5);
			skier.setSpeed(4);
			skier.setMapPosition(10, 30);
			skier.setMapPositionTarget(10, 30);
			skier.getSpeedY().should.equal(0);
			skier.setMapPositionTarget(450, 35);
			skier.getSpeedY().should.equal(4 * (0.6 / 5));
			skier.getSpeedY().should.equal(4 * (0.6 / 5) * 2);
			skier.getSpeedY().should.equal(4 * (0.6 / 5) * 3);
			skier.getSpeedY().should.equal(4 * (0.6 / 5) * 4);
			skier.getSpeedY().should.equal(4 * 0.6);
			skier.setMapPositionTarget(10, 45);
			skier.getSpeedY().should.equal(4 * (0.6 / 5) * 6);
			skier.getSpeedY().should.equal(4 * (0.6 / 5) * 7);
		});
	});

	describe('#setMapPositionTarget()', function() {
		it('should not allow setting the map position target whilst jumping', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setSpeed(4);
			skier.setSpeedY(4);
			skier.setMapPositionTarget(10, 70);
			skier.getSpeedY().should.equal(4);
			skier.hasHitJump();
			skier.cycle();
			skier.setMapPositionTarget(80, -40);
			skier.getSpeedY().should.equal(6);
		});
	});

	describe('#turnEast()', function() {
		it('should go one discrete direction from stopping west', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(270);
			skier.turnEast();
			skier.direction.should.equal(240);
		});
		
		it('should go two discrete directions from stopping west', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(270);
			skier.turnEast();
			skier.turnEast();
			skier.direction.should.equal(195);
		});

		it('should go three discrete directions from stopping west', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(270);
			skier.turnEast();
			skier.turnEast();
			skier.turnEast();
			skier.direction.should.equal(180);
		});

		it('should go four discrete directions from stopping west', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(270);
			skier.turnEast();
			skier.turnEast();
			skier.turnEast();
			skier.turnEast();
			skier.direction.should.equal(165);
		});

		it('should go five discrete directions from stopping west', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(270);
			skier.turnEast();
			skier.turnEast();
			skier.turnEast();
			skier.turnEast();
			skier.turnEast();
			skier.direction.should.equal(120);
		});

		it('should go six discrete directions from stopping west', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(270);
			skier.turnEast();
			skier.turnEast();
			skier.turnEast();
			skier.turnEast();
			skier.turnEast();
			skier.turnEast();
			skier.direction.should.equal(90);
		});

		it('should go to next discrete direction from arbitrary direction', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(255);
			skier.turnEast();
			skier.direction.should.equal(195);
		});
	});

	describe('#turnWest()', function() {
		it('should go one discrete directions from stopping east', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(90);
			skier.turnWest();
			skier.direction.should.equal(120);
		});

		it('should go two discrete directions from stopping east', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(90);
			skier.turnWest();
			skier.turnWest();
			skier.direction.should.equal(165);
		});

		it('should go three discrete directions from stopping east', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(90);
			skier.turnWest();
			skier.turnWest();
			skier.turnWest();
			skier.direction.should.equal(180);
		});
		
		it('should go four discrete directions from stopping east', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(90);
			skier.turnWest();
			skier.turnWest();
			skier.turnWest();
			skier.turnWest();
			skier.direction.should.equal(195);
		});

		it('should go five discrete direction from stopping east', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(90);
			skier.turnWest();
			skier.turnWest();
			skier.turnWest();
			skier.turnWest();
			skier.turnWest();
			skier.direction.should.equal(240);
		});

		it('should go six discrete direction from stopping east', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(90);
			skier.turnWest();
			skier.turnWest();
			skier.turnWest();
			skier.turnWest();
			skier.turnWest();
			skier.turnWest();
			skier.direction.should.equal(270);
		});
	});

	describe('#stepWest()',  function() {
		it('should go twice the speed steps to the west', function () {
			var skier = new Skier();
			skier.setSpeed(3);
			skier.setMapPosition(10, 30);
			skier.stepWest();
			skier.mapPosition[0].should.equal(4);
		});
	});

	describe('#stepEast()',  function() {
		it('should go twice the speed steps to the east', function () {
			var skier = new Skier();
			skier.setSpeed(3);
			skier.setMapPosition(10, 30);
			skier.stepEast();
			skier.mapPosition[0].should.equal(16);
		});
	});
});