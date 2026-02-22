import { describe, it } from 'vitest';
import { expect } from 'vitest';
import Sprite from '../js/lib/sprite.js';
import Skier from '../js/lib/skier.js';

describe('Skier', function() {
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

			expect(skier.hits(tallSprite)).toBe(true);
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

			expect(skier.hits(tallSprite)).toBe(true);
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

			expect(skier.hits(shortSprite)).toBe(false);
		});
	});

	describe('#getSpeedX()', function() {
		it('should ease on the x-axis when the skier turns south-east', function () {
			var skier = new Skier();
			skier.setTurnEaseCycles(5);
			skier.setSpeed(4);
			skier.setMapPosition(10, 30);
			skier.setMapPositionTarget(10, 30);
			expect(skier.getSpeedX()).toBe(0);
			skier.setMapPositionTarget(150, 35);
			expect(skier.getSpeedX()).toBe(4 * (0.33 / 5));
			expect(skier.getSpeedX()).toBe(4 * (0.33 / 5) * 2);
			expect(skier.getSpeedX()).toBe(4 * (0.33 / 5) * 3);
			expect(skier.getSpeedX()).toBe(4 * (0.33 / 5) * 4);
			expect(skier.getSpeedX()).toBe(4 * 0.33);
		});

		it('should ease on the x-axis when the skier turns east-south-east', function () {
			var skier = new Skier();
			skier.setTurnEaseCycles(5);
			skier.setSpeed(4);
			skier.setMapPosition(10, 30);
			skier.setMapPositionTarget(10, 30);
			expect(skier.getSpeedX()).toBe(0);
			skier.setMapPositionTarget(450, 35);
			expect(skier.getSpeedX()).toBe(4 * (0.5 / 5));
			expect(skier.getSpeedX()).toBe(4 * (0.5 / 5) * 2);
			expect(skier.getSpeedX()).toBe(4 * (0.5 / 5) * 3);
			expect(skier.getSpeedX()).toBe(4 * (0.5 / 5) * 4);
			expect(skier.getSpeedX()).toBe(4 * 0.5);
		});

		it('should ease on the x-axis back down when the skier turns from east-south-east to south', function () {
			var skier = new Skier();
			skier.setTurnEaseCycles(5);
			skier.setSpeed(4);
			skier.setMapPosition(10, 30);
			skier.setMapPositionTarget(10, 30);
			expect(skier.getSpeedX()).toBe(0);
			skier.setMapPositionTarget(450, 35);
			expect(skier.getSpeedX()).toBe(4 * (0.5 / 5));
			expect(skier.getSpeedX()).toBe(4 * (0.5 / 5) * 2);
			expect(skier.getSpeedX()).toBe(4 * (0.5 / 5) * 3);
			expect(skier.getSpeedX()).toBe(4 * (0.5 / 5) * 4);
			expect(skier.getSpeedX()).toBe(4 * 0.5);
			skier.setMapPositionTarget(10, 35);
			expect(skier.getSpeedX()).toBe(4 * (0.5 / 5) * 4);
		});
	});

	describe('#getSpeedY()', function() {
		it('should ease on the y-axis when the skier turns from east (stationary) to south-east', function () {
			var skier = new Skier();
			skier.setTurnEaseCycles(5);
			skier.setSpeed(4);
			skier.setMapPosition(10, 30);
			skier.setMapPositionTarget(15, 30);
			expect(skier.getSpeedY()).toBe(0);
			skier.setMapPositionTarget(150, 35);
			expect(skier.getSpeedY()).toBe(4 * (0.85 / 5));
			expect(skier.getSpeedY()).toBe(4 * (0.85 / 5) * 2);
			expect(skier.getSpeedY()).toBe(4 * (0.85 / 5) * 3);
			expect(skier.getSpeedY()).toBe(4 * (0.85 / 5) * 4);
			expect(skier.getSpeedY()).toBe(4 * (0.85 / 5) * 5);
		});

		it('should ease on the y-axis when the skier turns from east (stationary) to east-south-east from', function () {
			var skier = new Skier();
			skier.setTurnEaseCycles(5);
			skier.setSpeed(4);
			skier.setMapPosition(10, 30);
			skier.setMapPositionTarget(10, 30);
			expect(skier.getSpeedY()).toBe(0);
			skier.setMapPositionTarget(450, 35);
			expect(skier.getSpeedY()).toBe(4 * (0.6 / 5));
			expect(skier.getSpeedY()).toBe(4 * (0.6 / 5) * 2);
			expect(skier.getSpeedY()).toBe(4 * (0.6 / 5) * 3);
			expect(skier.getSpeedY()).toBe(4 * (0.6 / 5) * 4);
			expect(skier.getSpeedY()).toBe(4 * 0.6);
		});

		it('should ease on the y-axis when the skier turns from east (stationary) to east-south-east to south', function () {
			var skier = new Skier();
			skier.setTurnEaseCycles(5);
			skier.setSpeed(4);
			skier.setMapPosition(10, 30);
			skier.setMapPositionTarget(10, 30);
			expect(skier.getSpeedY()).toBe(0);
			skier.setMapPositionTarget(450, 35);
			expect(skier.getSpeedY()).toBe(4 * (0.6 / 5));
			expect(skier.getSpeedY()).toBe(4 * (0.6 / 5) * 2);
			expect(skier.getSpeedY()).toBe(4 * (0.6 / 5) * 3);
			expect(skier.getSpeedY()).toBe(4 * (0.6 / 5) * 4);
			expect(skier.getSpeedY()).toBe(4 * 0.6);
			skier.setMapPositionTarget(10, 45);
			expect(skier.getSpeedY()).toBe(4 * (0.6 / 5) * 6);
			expect(skier.getSpeedY()).toBe(4 * (0.6 / 5) * 7);
		});
	});

	describe('#setMapPositionTarget()', function() {
		it('should not allow setting the map position target whilst jumping', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setSpeed(4);
			skier.setSpeedY(4);
			skier.setMapPositionTarget(10, 70);
			expect(skier.getSpeedY()).toBe(4);
			skier.hasHitJump();
			skier.cycle();
			skier.setMapPositionTarget(80, -40);
			expect(skier.getSpeedY()).toBe(6);
		});
	});

	describe('#turnEast()', function() {
		it('should go one discrete direction from stopping west', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(270);
			skier.turnEast();
			expect(skier.direction).toBe(240);
		});

		it('should go two discrete directions from stopping west', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(270);
			skier.turnEast();
			skier.turnEast();
			expect(skier.direction).toBe(195);
		});

		it('should go three discrete directions from stopping west', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(270);
			skier.turnEast();
			skier.turnEast();
			skier.turnEast();
			expect(skier.direction).toBe(180);
		});

		it('should go four discrete directions from stopping west', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(270);
			skier.turnEast();
			skier.turnEast();
			skier.turnEast();
			skier.turnEast();
			expect(skier.direction).toBe(165);
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
			expect(skier.direction).toBe(120);
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
			expect(skier.direction).toBe(90);
		});

		it('should go to next discrete direction from arbitrary direction', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(255);
			skier.turnEast();
			expect(skier.direction).toBe(195);
		});
	});

	describe('#turnWest()', function() {
		it('should go one discrete directions from stopping east', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(90);
			skier.turnWest();
			expect(skier.direction).toBe(120);
		});

		it('should go two discrete directions from stopping east', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(90);
			skier.turnWest();
			skier.turnWest();
			expect(skier.direction).toBe(165);
		});

		it('should go three discrete directions from stopping east', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(90);
			skier.turnWest();
			skier.turnWest();
			skier.turnWest();
			expect(skier.direction).toBe(180);
		});

		it('should go four discrete directions from stopping east', function () {
			var skier = new Skier();
			skier.setMapPosition(10, 30);
			skier.setDirection(90);
			skier.turnWest();
			skier.turnWest();
			skier.turnWest();
			skier.turnWest();
			expect(skier.direction).toBe(195);
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
			expect(skier.direction).toBe(240);
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
			expect(skier.direction).toBe(270);
		});
	});

	describe('#stepWest()',  function() {
		it('should go twice the speed steps to the west', function () {
			var skier = new Skier();
			skier.setSpeed(3);
			skier.setMapPosition(10, 30);
			skier.stepWest();
			expect(skier.mapPosition[0]).toBe(4);
		});
	});

	describe('#stepEast()',  function() {
		it('should go twice the speed steps to the east', function () {
			var skier = new Skier();
			skier.setSpeed(3);
			skier.setMapPosition(10, 30);
			skier.stepEast();
			expect(skier.mapPosition[0]).toBe(16);
		});
	});
});
