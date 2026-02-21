import { describe, it, expect, vi, beforeEach } from 'vitest';
import Game from '../js/lib/game.js';
import Sprite from '../js/lib/sprite.js';

// Minimal camera mock that satisfies Game's needs without a real canvas
function makeCamera() {
	return {
		getCentreOfViewport: () => 400,
		canvasPositionToMapPosition: () => [0, 0],
		followSprite: vi.fn(),
		clearRect: vi.fn(),
		logicalWidth: () => 800,
		logicalHeight: () => 600,
		canvas: { width: 800, height: 600 },
		drawImage: vi.fn(),
		getLoadedImage: vi.fn(),
		mapPositionToCanvasPosition: () => [0, 0],
	};
}

function makePlayer() {
	var player = new Sprite();
	player.draw = vi.fn();
	player.cycle = vi.fn();
	player.setMapPosition = vi.fn();
	player.setMapPositionTarget = vi.fn();
	player.isJumping = false;
	return player;
}

describe('Game', function() {
	var camera, player, game;

	beforeEach(function() {
		camera = makeCamera();
		player = makePlayer();
		// Game constructor starts the game loop; stub it out
		vi.mock('eventedloop', () => ({
			default: class {
				on() {}
				start() {}
				stop() {}
			}
		}));
		game = new Game(camera, player);
	});

	describe('#isPaused()', function() {
		it('should not be paused initially', function() {
			expect(game.isPaused()).toBe(false);
		});
	});

	describe('#pause()', function() {
		it('should mark the game as paused', function() {
			game.pause();
			expect(game.isPaused()).toBe(true);
		});
	});

	describe('#addStaticObject()', function() {
		it('should add an object that appears in the draw cycle', function() {
			var drawn = [];
			var obj = { draw: (cam, frame) => drawn.push(frame) };
			game.addStaticObject(obj);
			game.draw();
			expect(drawn).toContain('main');
		});
	});

	describe('#beforeCycle() / #afterCycle()', function() {
		it('should call beforeCycle callbacks before cycling', function() {
			var order = [];
			game.beforeCycle(() => order.push('before'));
			game.cycle();
			expect(order[0]).toBe('before');
		});

		it('should call afterCycle callbacks after cycling', function() {
			var order = [];
			game.beforeCycle(() => order.push('before'));
			game.afterCycle(() => order.push('after'));
			game.cycle();
			expect(order).toEqual(['before', 'after']);
		});
	});

	describe('#setMouseX() / #setMouseY()', function() {
		it('should update mouse coordinates used during cycle', function() {
			// Just check no errors are thrown when coordinates are set
			expect(() => {
				game.setMouseX(100);
				game.setMouseY(200);
				game.cycle();
			}).not.toThrow();
		});
	});
});
