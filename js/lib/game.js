import SpriteArray from './spriteArray.js';

// One target frame at the legacy 50 fps rate.
// All speed values in the game are expressed in "pixels per 20 ms", so we
// normalise every rAF delta against this constant to keep movement consistent
// across different display refresh rates.
const TARGET_FRAME_MS = 20;

class Game {
	constructor(camera, player) {
		this._camera = camera;
		this._player = player;
		this._staticObjects = new SpriteArray();
		this._movingObjects = new SpriteArray();
		this._uiElements = new SpriteArray();
		this._mouseX = camera.getCentreOfViewport();
		this._mouseY = 0;
		this._paused = false;
		this._beforeCycleCallbacks = [];
		this._afterCycleCallbacks = [];
		this._rafId = null;
		this._lastTimestamp = null;

		player.setMapPosition(0, 0);
		player.setMapPositionTarget(0, -10);
		camera.followSprite(player);
	}

	// ─── Object management ────────────────────────────────────────────────────

	addStaticObject(sprite) {
		this._staticObjects.push(sprite);
	}

	addStaticObjects(sprites) {
		sprites.forEach(this.addStaticObject.bind(this));
	}

	addMovingObject(movingObject, movingObjectType) {
		// Give the entity a camera reference so it can query viewport dimensions
		// during its own cycle() without needing it passed as a parameter.
		movingObject._camera = this._camera;

		if (movingObjectType) {
			this._staticObjects.onPush(obj => {
				if (obj.data && obj.data.hitBehaviour[movingObjectType]) {
					obj.onHitting(movingObject, obj.data.hitBehaviour[movingObjectType]);
				}
			}, true);
		}
		this._movingObjects.push(movingObject);
	}

	addUIElement(element) {
		this._uiElements.push(element);
	}

	// ─── Callbacks ────────────────────────────────────────────────────────────

	beforeCycle(callback) {
		this._beforeCycleCallbacks.push(callback);
	}

	afterCycle(callback) {
		this._afterCycleCallbacks.push(callback);
	}

	// ─── Input ────────────────────────────────────────────────────────────────

	setMouseX(x) { this._mouseX = x; }
	setMouseY(y) { this._mouseY = y; }

	// ─── Game loop ────────────────────────────────────────────────────────────

	_tick(timestamp) {
		if (this._lastTimestamp === null) {
			this._lastTimestamp = timestamp;
		}

		// Cap the delta at 100 ms so a long tab-switch doesn't send sprites
		// flying across the mountain on the first frame back.
		const elapsed = Math.min(timestamp - this._lastTimestamp, 100);
		const dt = elapsed / TARGET_FRAME_MS;
		this._lastTimestamp = timestamp;

		this.cycle(dt);
		this.draw();

		this._rafId = requestAnimationFrame(ts => this._tick(ts));
	}

	start() {
		if (this._rafId) return;
		this._lastTimestamp = null;
		this._rafId = requestAnimationFrame(ts => this._tick(ts));
	}

	pause() {
		this._paused = true;
		if (this._rafId) {
			cancelAnimationFrame(this._rafId);
			this._rafId = null;
		}
	}

	isPaused() { return this._paused; }

	reset() {
		this._paused = false;
		this._staticObjects = new SpriteArray();
		this._movingObjects = new SpriteArray();
		this._mouseX = this._camera.getCentreOfViewport();
		this._mouseY = 0;
		this._player.reset();
		this._player.setMapPosition(0, 0, 0);
		this._lastTimestamp = null;
		this.start();
	}

	// ─── Per-frame logic and rendering ────────────────────────────────────────

	cycle(dt = 1) {
		this._beforeCycleCallbacks.forEach(c => c());

		var mouseMapPosition = this._camera.canvasPositionToMapPosition([this._mouseX, this._mouseY]);

		if (!this._player.isJumping) {
			this._player.setMapPositionTarget(mouseMapPosition[0], mouseMapPosition[1]);
		}

		this._player.cycle(dt);

		this._movingObjects.forEach(obj => obj.cycle(dt));

		this._staticObjects.cull();
		this._staticObjects.forEach(obj => {
			if (obj.cycle) obj.cycle(dt);
		});

		this._uiElements.forEach(obj => {
			if (obj.cycle) obj.cycle(dt);
		});

		this._afterCycleCallbacks.forEach(c => c());
	}

	draw() {
		// clearRect in logical coordinates; the scale(dpr, dpr) transform applied
		// on the context maps these to the full physical backing store.
		this._camera.clearRect(0, 0, this._camera.logicalWidth(), this._camera.logicalHeight());

		this._player.draw(this._camera);
		this._player.cycle();

		this._movingObjects.forEach(obj => obj.draw(this._camera));

		this._staticObjects.forEach(obj => {
			if (obj.draw) obj.draw(this._camera, 'main');
		});

		this._uiElements.forEach(obj => {
			if (obj.draw) obj.draw(this._camera, 'main');
		});
	}
}

export default Game;
