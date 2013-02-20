var mainCanvas = document.getElementById('skifree-canvas');
var dContext = mainCanvas.getContext('2d');
var imageSources = [ 'sprite-characters.png', 'skifree-objects.png' ];
var global = this;
var infoBoxControls = 'Use the mouse or WASD to control the skier';
if (isMobileDevice()) infoBoxControls = 'Tap or drag on the piste to control the skier';
var SpriteArray = require('spriteArray');
var Monster = require('monster');
var Sprite = require('sprite');
var Snowboarder = require('snowboarder');
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
		dContext.storeLoadedImage(src, im);
	});
}

function monsterHitsSkierBehaviour(monster, skier) {
	skier.isEatenBy(monster, function () {
		livesLeft -= 1;
		monster.isFull = true;
		monster.isEating = false;
		skier.isBeingEaten = false;
		monster.setSpeed(skier.getSpeed());
		monster.setMapPositionTargetWithConviction(dContext.getRandomlyInTheCentreOfCanvas(), dContext.getAboveViewport());
	});
}

function startGame (images) {
	var skier;
	var startSign;
	var infoBox;
	var staticObjects = new SpriteArray();
	var monsters = [];
	var snowboarders = [];
	var jumps = [];
	var thickSnowPatches = [];
	var mouseX = dContext.getCentreOfViewport();
	var mouseY = 0;
	var paused = false;

	function resetGame () {
		pixelsPerMetre = 18;
		monstersComeOut = false;
		distanceTravelledInMetres = 0;
		livesLeft = 5;
		highScore = localStorage.getItem('highScore');
		monsters = [];
		skier.reset();
		skier.setMapPosition(0, 0, 0);
	}

	function detectEnd () {
		paused = true;
		highScore = localStorage.setItem('highScore', distanceTravelledInMetres);
		console.log('Game over!');
	}

	function randomlyGenerateObject(sprite, dropRate) {
		var rateModifier = Math.max(800 - mainCanvas.width, 0);
		if (Number.random(100 + rateModifier) <= dropRate && skier.isMoving) {
			var newSprite = new Sprite(sprite);
			newSprite.setSpeed(0);
			var randomPosition = dContext.getRandomMapPositionBelowViewport();
			newSprite.setMapPosition(randomPosition[0], randomPosition[1]);

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
		var randomPosition = dContext.getRandomMapPositionAboveViewport();
		newMonster.setMapPosition(randomPosition[0], randomPosition[1]);
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

	function spawnBoarder () {
		var newBoarder = new Snowboarder(sprites.snowboarder);
		var randomPositionAbove = dContext.getRandomMapPositionAboveViewport();
		var randomPositionBelow = dContext.getRandomMapPositionBelowViewport();
		newBoarder.setMapPosition(randomPositionAbove[0], randomPositionAbove[1]);
		newBoarder.setMapPositionTarget(randomPositionBelow[0], randomPositionBelow[1]);
		newBoarder.onHitting(skier, sprites.snowboarder.hitBehaviour.skier);

		snowboarders.push(newBoarder);
	}

	startSign = new Sprite(sprites.signStart);
	startSign.setMapPosition(-50, 0);

	skier = new Skier(sprites.skier);
	skier.setMapPosition(0, 0);
	skier.setMapPositionTarget(0, -10);
	dContext.followSprite(skier);

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

	var intervalNum = 0;

	setInterval(function () {
		// Clear canvas
		mainCanvas.width = mainCanvas.width;
		var mouseMapPosition = dContext.canvasPositionToMapPosition([mouseX, mouseY]);

		if (!skier.isJumping) {
			if (intervalNum === 0) {
				console.log('Skier targets: ' + skier.movingToward[0] + ', ' + skier.movingToward[1]);
			}
			skier.setMapPositionTarget(mouseMapPosition[0], mouseMapPosition[1]);
			if (intervalNum === 0) {
				console.log('Skier targets: ' + skier.movingToward[0] + ', ' + skier.movingToward[1]);
			}
		}

		intervalNum++;

		startSign.draw(dContext, 'main');
		skier.draw(dContext);

		monsters.each(function (monster, i) {
			if (monster.isAboveOnCanvas(dContext.getAboveViewport() - 100) || monster.deleted) {
				return (delete monsters[i]);
			}

			if (monster.isFull) {
				monster.stopFollowing();
			} else if (!skier.isBeingEaten) {
				monster.follow(skier);
			} else if (skier.isBeingEaten && !monster.isEating) {
				monster.stopFollowing();
				monster.setMapPositionTargetWithConviction(dContext.getRandomlyInTheCentreOfCanvas(), dContext.getAboveViewport());
			}

			monster.cycle();
			monster.draw(dContext);
		});

		snowboarders.each(function (snowboarder, i) {
			if (snowboarder.isBelowOnCanvas(dContext.getBelowViewport() + 499)) {
				console.log('Deleting snowboarder');
				return (delete snowboarders[i]);
			}

			snowboarder.cycle(dContext);
			snowboarder.draw(dContext);
		});

		randomlyGenerateObject(sprites.smallTree, 4);
		randomlyGenerateObject(sprites.tallTree, 2);
		randomlyGenerateObject(sprites.jump, 1);
		randomlyGenerateObject(sprites.thickSnow, 1);
		randomlyGenerateObject(sprites.rock, 1);

		distanceTravelledInMetres = parseFloat(skier.getPixelsTravelledDownMountain() / pixelsPerMetre).toFixed(1);

		if (!monstersComeOut && distanceTravelledInMetres >= 1000) {
			monstersComeOut = true;
		}
 
		if (monstersComeOut && Number.random(1600) === 1) {
			spawnMonster();
		}
 
		if (Number.random(1300) === 1) {
			spawnBoarder();
		}


		skier.cycle();
		
		staticObjects.cull();

		staticObjects.each(function (staticObject, i) {
			staticObject.cycle();
			staticObject.draw(dContext, 'main');

			if (staticObject.isAboveOnCanvas(0)) {
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
			'Current Speed: ' + skier.getSpeed()/*,
			'Skier Map Position: ' + skier.mapPosition[0].toFixed(1) + ', ' + skier.mapPosition[1].toFixed(1),
			'Mouse Map Position: ' + mouseMapPosition[0].toFixed(1) + ', ' + mouseMapPosition[1].toFixed(1)*/
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
	.bind('keydown', function (e) {
		// F Key
		if (e.keyCode === 70 || e.keyCode === 102) {
			skier.speedBoost();
		}
		//W Key
		if (e.Keycode === 87 || e.keyCode === 119 || e.keyCode === 38) {
			mouseX = 0;
			mouseY = 0;
		}
		// A Key
		if (e.keyCode === 65 || e.keyCode === 97 || e.keyCode === 37) {
			mouseX = 0;
			mouseY = mainCanvas.height;
		}
		// S Key
		if (e.keyCode === 83 || e.keyCode === 115 || e.keyCode === 40) {
			mouseX = mainCanvas.width / 2;
			mouseY = mainCanvas.height;
		}
		// D Key
		if (e.keyCode === 68 || e.keyCode === 100 || e.keyCode === 39) {
			mouseX = mainCanvas.width;
			mouseY = mainCanvas.height;
		}
		// M key
		if (e.keyCode === 77 || e.keyCode === 109) {
			spawnMonster();
		}
		// B key
		if (e.keyCode === 66 || e.keyCode === 98) {
			spawnBoarder();
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