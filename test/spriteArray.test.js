import { describe, it, expect, vi } from 'vitest';
import SpriteArray from '../js/lib/spriteArray.js';

describe('SpriteArray', function() {
	describe('#push()', function() {
		it('should add items like a normal array', function() {
			var arr = new SpriteArray();
			arr.push('a');
			arr.push('b');
			expect(arr.length).toBe(2);
			expect(arr[0]).toBe('a');
			expect(arr[1]).toBe('b');
		});

		it('should call registered push handlers when an item is added', function() {
			var arr = new SpriteArray();
			var received = [];
			arr.onPush(function(item) { received.push(item); });
			arr.push('x');
			arr.push('y');
			expect(received).toEqual(['x', 'y']);
		});

		it('should call multiple handlers', function() {
			var arr = new SpriteArray();
			var countA = 0;
			var countB = 0;
			arr.onPush(function() { countA++; });
			arr.onPush(function() { countB++; });
			arr.push('z');
			expect(countA).toBe(1);
			expect(countB).toBe(1);
		});
	});

	describe('#onPush()', function() {
		it('should not call the handler retroactively by default', function() {
			var arr = new SpriteArray();
			arr.push('existing');
			var received = [];
			arr.onPush(function(item) { received.push(item); });
			expect(received).toEqual([]);
		});

		it('should call the handler for existing items when retroactive is true', function() {
			var arr = new SpriteArray();
			arr.push('existing');
			var received = [];
			arr.onPush(function(item) { received.push(item); }, true);
			expect(received).toEqual(['existing']);
		});
	});

	describe('#cull()', function() {
		it('should remove items marked as deleted', function() {
			var arr = new SpriteArray();
			var a = { deleted: false };
			var b = { deleted: true };
			var c = { deleted: false };
			arr.push(a);
			arr.push(b);
			arr.push(c);
			arr.cull();
			var remaining = Array.from(arr).filter(Boolean);
			expect(remaining).toContain(a);
			expect(remaining).not.toContain(b);
			expect(remaining).toContain(c);
		});

		it('should leave non-deleted items untouched', function() {
			var arr = new SpriteArray();
			var a = { deleted: false };
			arr.push(a);
			arr.cull();
			expect(arr[0]).toBe(a);
		});
	});
});
