import { describe, it, expect, vi } from 'vitest';
import Monster from '../js/lib/monster.js';
import { MONSTER_STANDARD_SPEED } from '../js/lib/constants.js';

describe('Monster', function() {
	describe('constructor', function() {
		it('should start with the standard speed', function() {
			var monster = new Monster();
			expect(monster.getSpeed()).toBe(MONSTER_STANDARD_SPEED);
		});

		it('should not be eating initially', function() {
			var monster = new Monster();
			expect(monster.isEating).toBe(false);
		});

		it('should not be full initially', function() {
			var monster = new Monster();
			expect(monster.isFull).toBe(false);
		});

		it('should be moving initially', function() {
			var monster = new Monster();
			expect(monster.isMoving).toBe(true);
		});
	});

	describe('#startEating()', function() {
		it('should set isEating to true immediately', function() {
			var monster = new Monster();
			monster.startEating(function() {});
			expect(monster.isEating).toBe(true);
		});

		it('should stop moving while eating', function() {
			var monster = new Monster();
			monster.startEating(function() {});
			expect(monster.isMoving).toBe(false);
		});

		it('should call the callback once all eating stages are complete', function() {
			return new Promise(function(resolve) {
				vi.useFakeTimers();
				var monster = new Monster();
				var done = vi.fn();
				monster.startEating(done);

				// Advance through all 6 eating stages (300ms each)
				vi.advanceTimersByTime(300 * 6);
				expect(done).toHaveBeenCalledOnce();
				vi.useRealTimers();
				resolve();
			});
		});

		it('should resume moving after eating is complete', function() {
			vi.useFakeTimers();
			var monster = new Monster();
			monster.startEating(function() {});
			vi.advanceTimersByTime(300 * 6);
			expect(monster.isMoving).toBe(true);
			vi.useRealTimers();
		});

		it('should reset isEating to false after all stages', function() {
			vi.useFakeTimers();
			var monster = new Monster();
			monster.startEating(function() {});
			vi.advanceTimersByTime(300 * 6);
			expect(monster.isEating).toBe(false);
			vi.useRealTimers();
		});
	});
});
