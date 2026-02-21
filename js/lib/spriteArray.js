class SpriteArray extends Array {
	constructor() {
		super();
		this.pushHandlers = [];
	}

	onPush(f, retroactive) {
		this.pushHandlers.push(f);
		if (retroactive) {
			this.forEach(f);
		}
	}

	push(obj) {
		super.push(obj);
		this.pushHandlers.forEach(handler => handler(obj));
	}

	cull() {
		this.forEach((obj, i) => {
			if (obj && obj.deleted) {
				delete this[i];
			}
		});
	}
}

export default SpriteArray;
