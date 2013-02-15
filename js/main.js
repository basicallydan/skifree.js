var mainCanvas = document.getElementById('skifree-canvas');
var dContext = mainCanvas.getContext('2d');
var imageSources = [ 'sprite-characters.png', 'skifree-objects.png' ];
var global = this;
var infoBoxControls = 'Use the mouse to control the skier';
if (isMobileDevice()) infoBoxControls = 'Tap on the piste to control the skier';
var SpriteArray = require('spriteArray');
var Monster = require('monster');
var Sprite = require('sprite');
var Skier = require('skier');
var InfoBox = require('infoBox');
var sprites = require('spriteInfo');

var pixelsPerMetre = 18;
var monstersComeOut = false;
var distanceTravelledInMetres = 0;
var livesLeft = 5;
var highScore = 0;
if (localStorage.getItem('highScore')) highScore = localStorage.getItem('highScore');

function loadImages (sources, next) {
	var loaded = 0;
	var images = {};

	function finish () {
		loaded += 1;
		if (loaded === sources.length) {
			next(images);
		}
	}

	sources.each(function (src) {
		var im = new Image();
		im.onload = finish;
		im.src = src;
		images[src] = im;
	});
}

function monsterHitsSkierBehaviour(monster, skier) {
	skier.isEatenBy(monster, function () {
		livesLeft -= 1;
		monster.isFull = true;
		monster.isEating = false;
		skier.isBeingEaten = false;
		monster.setSpeed(skier.getSpeed());
		monster.setPositionTargetWithConviction(getRandomlyInTheCentre(), getAboveViewport());
	});
}

function startGame (images) {
	var skier;
	var infoBox;
	var staticObjects = new SpriteArray();
	var monsters = [];
	var jumps = [];
	var thickSnowPatches = [];
	var mouseX = getCentreOfViewport();
	var mouseY = mainCanvas.height;
	var paused = false;

	dContext.getLoadedImage = function (imgPath) {
		if (images[imgPath]) {
			return images[imgPath];
		}
	};

	function resetGame () {
		pixelsPerMetre = 18;
		monstersComeOut = false;
		distanceTravelledInMetres = 0;
		livesLeft = 5;
		highScore = localStorage.getItem('highScore');
		monsters = [];
		skier.reset();
	}

	function detectEnd () {
		paused = true;
		highScore = localStorage.setItem('highScore', distanceTravelledInMetres);
		console.log('Game over!');
	}

	function randomlyGenerateObject(sprite, dropRate) {
		if (Number.random(100) <= dropRate && skier.isMoving) {
			var newSprite = new Sprite(sprite);
			newSprite.setSpeed(skier.getSpeed());
			newSprite.setPosition(getRandomlyInTheCentre(200), getBelowViewport());
			newSprite.trackSpriteToMoveAround(skier);

			if (sprite.hitBehaviour.monster) {
				monsters.each(function (monster) {
					newSprite.onHitting(monster, sprite.hitBehaviour.monster);
				});
			}

			if (sprite.hitBehaviour.skier) {
				newSprite.onHitting(skier, sprite.hitBehaviour.skier);
			}

			staticObjects.push(newSprite);
		}
	}

	function spawnMonster () {
		var newMonster = new Monster(sprites.monster);
		newMonster.setPosition(getRandomlyInTheCentre(), getAboveViewport());
		newMonster.follow(skier);
		newMonster.onHitting(skier, monsterHitsSkierBehaviour);

		staticObjects.each(function (obj) {
			if (obj.data.hitBehaviour.monster) {
				obj.onHitting(newMonster, obj.data.hitBehaviour.monster);
			}
		});

		staticObjects.onPush(function (obj) {
			if (obj.data.hitBehaviour.monster) {
				obj.onHitting(newMonster, obj.data.hitBehaviour.monster);
			}
		});

		monsters.push(newMonster);
	}

	skier = new Skier(sprites.skier);
	skier.setPosition(mouseX, getMiddleOfViewport() - skier.getMaxHeight());

	infoBox = new InfoBox({
		initialLines : [
			'SkiFree.js',
			infoBoxControls,
			'Travelled 0m',
			'High Score: ' + highScore,
			'Skiers left: ' + livesLeft,
			'Created by Dan Hough (@basicallydan)'
		],
		position: {
			top: 15,
			right: 10
		}
	});

	setInterval(function () {
		var skierOpposite = skier.getMovingTowardOpposite();

		mainCanvas.width = mainCanvas.width;

		if (!skier.isJumping) {
			skier.setPositionTarget(mouseX, mouseY);
		}

		skier.draw(dContext);

		monsters.each(function (monster, i) {
			if (monster.isAbove(getAboveViewport() - 100) || monster.deleted) {
				return (delete monsters[i]);
			}

			if (monster.isFull) {
				monster.stopFollowing();
			} else if (!skier.isBeingEaten) {
				monster.follow(skier);
			} else if (skier.isBeingEaten && !monster.isEating) {
				monster.stopFollowing();
				monster.setPositionTargetWithConviction(getRandomlyInTheCentre(), getAboveViewport());
			}

			monster.cycle();
			monster.draw(dContext);
		});

		randomlyGenerateObject(sprites.smallTree, 10);
		randomlyGenerateObject(sprites.tallTree, 5);
		randomlyGenerateObject(sprites.jump, 5);
		randomlyGenerateObject(sprites.thickSnow, 5);

		distanceTravelledInMetres = parseFloat(skier.getPixelsTravelledDownMountain() / pixelsPerMetre).toFixed(1);

		if (!monstersComeOut && distanceTravelledInMetres >= 200) {
			monstersComeOut = true;
		}
 
		if (monstersComeOut && Number.random(400) === 1) {
			spawnMonster();
		}

		skier.cycle();
		
		staticObjects.cull();

		staticObjects.each(function (staticObject, i) {
			staticObject.cycle();
			staticObject.draw(dContext, 'main');

			if (staticObject.isAbove(0)) {
				staticObject.deleteOnNextCycle();
			}
		});

		infoBox.setLines([
			'SkiFree.js',
			infoBoxControls,
			'Travelled ' + distanceTravelledInMetres + 'm',
			'Skiers left: ' + livesLeft,
			'High Score: ' + highScore,
			'Created by Dan Hough (@basicallydan)',
			'Current Speed: ' + skier.getSpeed()
		]);

		infoBox.draw(dContext);

		if (livesLeft === 0) {
			detectEnd();
			resetGame();
		}
	}, 10);
	
	$(mainCanvas)
	.mousemove(function (e) {
		mouseX = e.pageX;
		mouseY = e.pageY;
	})
	.bind('click', function (e) {
		mouseX = e.pageX;
		mouseY = e.pageY;
	})
	.bind('keypress', function (e) {
		// F Key
		if (e.keyCode === 102) {
			skier.speedBoost();
		}
		//W Key
		if (e.Keycode === 87 || e.keyCode === 119) {
			mouseX = 0;
			mouseY = 0;
		}
		// A Key
		if (e.keyCode === 65 || e.keyCode === 97) {
			mouseX = 0;
			mouseY = mainCanvas.height;
		}
		// S Key
		if (e.keyCode === 83 || e.keyCode === 115) {
			mouseX = mainCanvas.width / 2;
			mouseY = mainCanvas.height;
		}
		// D Key
		if (e.keyCode === 68 || e.keyCode === 100) {
			mouseX = mainCanvas.width;
			mouseY = mainCanvas.height;
		}
		// M key
		if (e.keyCode === 77 || e.keyCode === 109) {
			spawnMonster();
		}
	})
	.hammer({})
	.bind('hold', function (e) {
		mouseX = e.position[0].x;
		mouseY = e.position[0].y;
	})
	.bind('tap', function (e) {
		mouseX = e.position[0].x;
		mouseY = e.position[0].y;
	})
	.bind('drag', function (e) {
		mouseX = e.position.x;
		mouseY = e.position.y;
	})
	.bind('doubletap', function (e) {
		skier.speedBoost();
	})
	// Focus on the canvas so we can listen for key events immediately
	.focus();
}

function resizeCanvas() {
	mainCanvas.width = window.innerWidth;
	mainCanvas.height = window.innerHeight;
}

// X-pos canvas functions
function getRandomlyInTheCentre(buffer) {
	var min = 0;
	var max = mainCanvas.width;

	if (buffer) {
		min -= buffer;
		max += buffer;
	}

	return Number.random(min, max);
}

function getCentreOfViewport() {
	return (mainCanvas.width / 2).floor();
}

// Y-pos canvas functions
function getMiddleOfViewport() {
	return (mainCanvas.height / 2).floor();
}

function getBelowViewport() {
	return mainCanvas.height + (mainCanvas.height / 4).floor();
}

function getAboveViewport() {
	return 0 - (mainCanvas.height / 4).floor();
}

function isMobileDevice() {
	if(navigator.userAgent.match(/Android/i) ||
		navigator.userAgent.match(/webOS/i) ||
		navigator.userAgent.match(/iPhone/i) ||
		navigator.userAgent.match(/iPad/i) ||
		navigator.userAgent.match(/iPod/i) ||
		navigator.userAgent.match(/BlackBerry/i) ||
		navigator.userAgent.match(/Windows Phone/i)
	) {
		return true;
	}
	else {
		return false;
	}
}

window.addEventListener('resize', resizeCanvas, false);

resizeCanvas();

loadImages(imageSources, startGame);