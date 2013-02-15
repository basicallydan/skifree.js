(function (global) {
	function SpriteArray() {
		this.pushHandlers = [];

		return this;
	}

	SpriteArray.prototype = Object.create(Array.prototype);

	SpriteArray.prototype.onPush = function(f) {
		this.pushHandlers.push(f);
	};

	SpriteArray.prototype.push = function(obj) {
		Array.prototype.push.call(this, obj);
		this.pushHandlers.each(function(handler) {
			handler(obj);
		});
	};

	SpriteArray.prototype.cull = function() {
		this.each(function (obj, i) {
			if (obj.deleted) {
				return (delete this[i]);
			}
		});
	};

	global.spriteArray = SpriteArray;
})(this);


if (typeof module !== 'undefined') {
	module.exports = this.spriteArray;
}