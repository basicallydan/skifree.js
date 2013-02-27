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
var Game = require('game');
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
		monster.stopFollowing();
		monster.setMapPositionTargetWithConviction(dContext.getRandomlyInTheCentreOfCanvas(), dContext.getAboveViewport());
	});
}

function startNeverEndingGame (images) {
	var skier;
	var startSign;
	var infoBox;
	var game;

	function resetGame () {
		monstersComeOut = false;
		distanceTravelledInMetres = 0;
		livesLeft = 5;
		highScore = localStorage.getItem('highScore');
		game.reset();
		game.addStaticObject(startSign);
	}

	function detectEnd () {
		if (!game.isPaused()) {
			highScore = localStorage.setItem('highScore', distanceTravelledInMetres);
			infoBox.setLines([
				'Game over!',
				'Hit space to restart'
			]);
			game.pause();
			game.cycle();
		}
	}

	function randomlyGenerateObject(sprite, dropRate) {
		var rateModifier = Math.max(800 - mainCanvas.width, 0);
		if (Number.random(100 + rateModifier) <= dropRate && skier.isMoving) {
			var newSprite = new Sprite(sprite);
			newSprite.setSpeed(0);
			var randomPosition = dContext.getRandomMapPositionBelowViewport();
			newSprite.setMapPosition(randomPosition[0], randomPosition[1]);

/*			if (sprite.hitBehaviour.monster) {
				monsters.each(function (monster) {
					newSprite.onHitting(monster, sprite.hitBehaviour.monster);
				});
			}*/

			if (sprite.hitBehaviour.skier) {
				newSprite.onHitting(skier, sprite.hitBehaviour.skier);
			}

			game.addStaticObject(newSprite);
		}
	}

	function spawnMonster () {
		var newMonster = new Monster(sprites.monster);
		var randomPosition = dContext.getRandomMapPositionAboveViewport();
		newMonster.setMapPosition(randomPosition[0], randomPosition[1]);
		newMonster.follow(skier);
		newMonster.onHitting(skier, monsterHitsSkierBehaviour);

		game.addMovingObject(newMonster, 'monster');
	}

	function spawnBoarder () {
		var newBoarder = new Snowboarder(sprites.snowboarder);
		var randomPositionAbove = dContext.getRandomMapPositionAboveViewport();
		var randomPositionBelow = dContext.getRandomMapPositionBelowViewport();
		newBoarder.setMapPosition(randomPositionAbove[0], randomPositionAbove[1]);
		newBoarder.setMapPositionTarget(randomPositionBelow[0], randomPositionBelow[1]);
		newBoarder.onHitting(skier, sprites.snowboarder.hitBehaviour.skier);

		game.addMovingObject(newBoarder);
	}

	skier = new Skier(sprites.skier);
	skier.setMapPosition(0, 0);
	skier.setMapPositionTarget(0, -10);

	game = new Game(mainCanvas, skier);

	startSign = new Sprite(sprites.signStart);
	game.addStaticObject(startSign);
	startSign.setMapPosition(-50, 0);
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

	game.beforeCycle(function () {
		randomlyGenerateObject(sprites.smallTree, 4);
		randomlyGenerateObject(sprites.tallTree, 2);
		randomlyGenerateObject(sprites.jump, 1);
		randomlyGenerateObject(sprites.thickSnow, 1);
		randomlyGenerateObject(sprites.rock, 1);
		distanceTravelledInMetres = parseFloat(skier.getPixelsTravelledDownMountain() / pixelsPerMetre).toFixed(1);
		if (!game.isPaused()) {
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
		}
	});

	game.afterCycle(function() {
		if (livesLeft === 0) {
			detectEnd();
		}
	});

	game.addUIElement(infoBox);
	
	$(mainCanvas)
	.mousemove(function (e) {
		game.setMouseX(e.pageX);
		game.setMouseY(e.pageY);
	})
	.bind('click', function (e) {
		game.setMouseX(e.pageX);
		game.setMouseY(e.pageY);
	})
	.bind('keydown', function (e) {
		// F Key
		if (e.keyCode === 70 || e.keyCode === 102) {
			skier.speedBoost();
		}
		//W Key
		if (e.Keycode === 87 || e.keyCode === 119 || e.keyCode === 38) {
			game.setMouseX(0);
			game.setMouseY(0);
		}
		// A Key
		if (e.keyCode === 65 || e.keyCode === 97 || e.keyCode === 37) {
			game.setMouseX(0);
			game.setMouseY(mainCanvas.height);
		}
		// S Key
		if (e.keyCode === 83 || e.keyCode === 115 || e.keyCode === 40) {
			game.setMouseX(mainCanvas.width / 2);
			game.setMouseY(mainCanvas.height);
		}
		// D Key
		if (e.keyCode === 68 || e.keyCode === 100 || e.keyCode === 39) {
			game.setMouseX(mainCanvas.width);
			game.setMouseY(mainCanvas.height);
		}
		// M key
		if (e.keyCode === 77 || e.keyCode === 109) {
			spawnMonster();
		}
		// B key
		if (e.keyCode === 66 || e.keyCode === 98) {
			spawnBoarder();
		}

		// Space bar
		if (e.keyCode === 32) {
			resetGame();
		}
	})
	.hammer({})
	.bind('hold', function (e) {
		game.setMouseX(e.position[0].x);
		game.setMouseY(e.position[0].y);
	})
	.bind('tap', function (e) {
		game.setMouseX(e.position[0].x);
		game.setMouseY(e.position[0].y);
	})
	.bind('drag', function (e) {
		game.setMouseX(e.position.x);
		game.setMouseY(e.position.y);
	})
	.bind('doubletap', function (e) {
		skier.speedBoost();
	})
	// Focus on the canvas so we can listen for key events immediately
	.focus();

	game.start();
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

loadImages(imageSources, startNeverEndingGame);
