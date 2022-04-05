class SpriteArray extends Array {
	constructor(...items) {
		super(...items);
		this.pushHandlers = [];
	}

	onPush(f, retroactive) {
		this.pushHandlers.push(f);

		if (retroactive) {
			this.each(f);
		}
	}

	push(obj) {
		Array.prototype.push.call(this, obj);
		this.pushHandlers.each(function(handler) {
			handler(obj);
		});
	}

	cull() {
		this.each(function (obj, i) {
			if (obj.deleted) {
				return (delete this[i]);
			}
		});
	}
}

export default SpriteArray;

// (function (global) {
// 	function SpriteArray() {
// 		this.pushHandlers = [];

// 		return this;
// 	}

// 	SpriteArray.prototype = Object.create(Array.prototype);

// 	SpriteArray.prototype.onPush = function(f, retroactive) {
// 		this.pushHandlers.push(f);

// 		if (retroactive) {
// 			this.each(f);
// 		}
// 	};

// 	SpriteArray.prototype.push = function(obj) {
// 		Array.prototype.push.call(this, obj);
// 		this.pushHandlers.each(function(handler) {
// 			handler(obj);
// 		});
// 	};

// 	SpriteArray.prototype.cull = function() {
// 		this.each(function (obj, i) {
// 			if (obj.deleted) {
// 				return (delete this[i]);
// 			}
// 		});
// 	};

// 	global.spriteArray = SpriteArray;
// })(this);


// if (typeof module !== 'undefined') {
// 	module.exports = this.spriteArray;
// }