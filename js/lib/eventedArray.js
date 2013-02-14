(function (global) {
	function EventedArray() {
		this.pushHandlers = [];

		return this;
	}

	EventedArray.prototype = Object.create(Array.prototype);

	EventedArray.prototype.onPush = function(f) {
		this.pushHandlers.push(f);
	};

	EventedArray.prototype.push = function(obj) {
		Array.prototype.push.call(this, obj);
		this.pushHandlers.each(function(handler) {
			handler(obj);
		});
	};

	global.eventedArray = EventedArray;
})(this);


if (typeof module !== 'undefined') {
	module.exports = this.eventedArray;
}