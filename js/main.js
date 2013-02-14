var mainCanvas = document.getElementById('skifree-canvas');
var dContext = mainCanvas.getContext('2d');
var imageSources = [ 'sprite-characters.png', 'skifree-objects.png' ];
var global = this;
var infoBoxControls = 'Use the mouse to control the skier';
if (isMobileDevice()) infoBoxControls = 'Tap on the piste to control the skier';
var EventedArray = require('eventedArray');
var Monster = require('monster');

var sprites = {
	'skier' : {
		$imageFile : 'sprite-characters.png',
		parts : {
			blank : [ 0, 0, 0, 0 ],
			east : [ 0, 0, 24, 34 ],
			esEast : [ 24, 0, 24, 34 ],
			sEast : [ 49, 0, 17, 34 ],
			south : [ 65, 0, 17, 34 ],
			sWest : [ 49, 37, 17, 34 ],
			wsWest : [ 24, 37, 24, 34 ],
			west : [ 0, 37, 24, 34 ],
			hit : [ 0, 78, 31, 31 ],
			jumping : [ 84, 0, 32, 34 ]
		},
		id : 'player',
		hitBehaviour: {}
	},
	'smallTree' : {
		$imageFile : 'skifree-objects.png',
		parts : {
			main : [ 0, 28, 30, 34 ]
		},
		hitBehaviour: {}
	},
	'tallTree' : {
		$imageFile : 'skifree-objects.png',
		parts : {
			main : [ 95, 66, 32, 64 ]
		},
		zIndexesOccupied : [0, 1],
		hitBehaviour: {}
	},
	'thickSnow' : {
		$imageFile : 'skifree-objects.png',
		parts : {
			main : [ 143, 53, 43, 10 ]
		},
		hitBehaviour: {}
	},
	'monster' : {
		$imageFile : 'sprite-characters.png',
		parts : {
			sEast1 : [ 64, 112, 26, 43 ],
			sEast2 : [ 90, 112, 32, 43 ],
			sWest1 : [ 64, 158, 26, 43 ],
			sWest2 : [ 90, 158, 32, 43 ],
			eating1 : [ 122, 112, 34, 43 ],
			eating2 : [ 156, 112, 31, 43 ],
			eating3 : [ 187, 112, 31, 43 ],
			eating4 : [ 219, 112, 25, 43 ],
			eating5 : [ 243, 112, 26, 43 ]
		},
		hitBehaviour: {}
	},
	'jump' : {
		$imageFile : 'skifree-objects.png',
		parts : {
			main : [ 109, 55, 32, 8 ]
		},
		hitBehaviour: {}
	}
};
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

function monsterHitsTreeBehaviour(monster) {
	monster.deleteOnNextCycle();
}

sprites.monster.hitBehaviour.tree = monsterHitsTreeBehaviour;

function treeHitsMonsterBehaviour(tree, monster) {
	monster.deleteOnNextCycle();
}

sprites.smallTree.hitBehaviour.monster = treeHitsMonsterBehaviour;
sprites.tallTree.hitBehaviour.monster = treeHitsMonsterBehaviour;

function skierHitsTreeBehaviour(skier, tree) {
	skier.hasHitObstacle(tree);
}

function treeHitsSkierBehaviour(tree, skier) {
	skier.hasHitObstacle(tree);
}

sprites.smallTree.hitBehaviour.skier = treeHitsSkierBehaviour;
sprites.tallTree.hitBehaviour.skier = treeHitsSkierBehaviour;

function skierHitsJumpBehaviour(skier, jump) {
	skier.hasHitJump(jump);
}

function jumpHitsSkierBehaviour(jump, skier) {
	skier.hasHitJump(jump);
}

sprites.jump.hitBehaviour.skier = jumpHitsSkierBehaviour;

function skierHitsThickSnowBehaviour(skier, thickSnow) {
	// Need to implement this properly
	skier.setSpeed(2);
	setTimeout(function() {
		skier.resetSpeed();
	}, 700);
}

function thickSnowHitsSkierBehaviour(thickSnow, skier) {
	// Need to implement this properly
	skier.setSpeed(2);
	setTimeout(function() {
		skier.resetSpeed();
	}, 700);
}

sprites.thickSnow.hitBehaviour.skier = thickSnowHitsSkierBehaviour;

function monsterHitsSkierBehaviour(monster, skier) {
	skier.isEatenBy(monster, function () {
		livesLeft -= 1;
		monster.isFull = true;
		monster.isEating = false;
		skier.isBeingEaten = false;
		monster.setSpeed(skier.getSpeed());
		monster.moveTowardWithConviction(getRandomlyInTheCentre(), getAboveViewport());
	});
}

function drawScene (images) {
	var skier;
	var infoBox;
	var staticObjects = new EventedArray();
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

	function spawnMonster () {
		var newMonster = new Monster(sprites.monster);
		newMonster.setPosition(getRandomlyInTheCentre(), getAboveViewport());
		newMonster.setSpeed(1);

		newMonster.onHitting(skier, monsterHitsSkierBehaviour);

		staticObjects.each(function (obj) {
			if (obj.data.hitBehaviour.monster) {
				obj.onHitting(newMonster, obj.data.hitBehaviour.monster);
			}
		});

/*		staticObjects.onPush(function (obj) {
			if (obj.data.hitBehaviour.monster) {
				obj.onHitting(newMonster, obj.data.hitBehaviour.monster);
			}
		});*/

		monsters.push(newMonster);
	}

	function detectEnd () {
		paused = true;
		highScore = localStorage.setItem('highScore', distanceTravelledInMetres);
		console.log('Game over!');
	}

	skier = new Skier(sprites.skier);

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

	skier.setPosition(mouseX, getMiddleOfViewport() - skier.getMaxHeight());

	function randomlyGenerateObject(sprite, dropRate) {
		if (Number.random(100) <= dropRate && skier.isMoving) {
			var newSprite = new Sprite(sprite);
			newSprite.setSpeed(skier.getSpeed());
			newSprite.setPosition(getRandomlyInTheCentre(200), getBelowViewport());

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

	setInterval(function () {
		var skierOpposite = skier.getMovingTowardOpposite();

		mainCanvas.width = mainCanvas.width;

		if (!skier.isJumping) {
			skier.moveToward(mouseX, mouseY);
		}

		skier.draw(dContext);

		monsters.each(function (monster, i) {
			if (monster.isAbove(getAboveViewport() - 100) || monster.deleted) {
				return (delete monsters[i]);
			}

			if (monster.isFull) {
				monster.move();
			} else if (!skier.isBeingEaten) {
				monster.setSpeed(4 - skier.getSpeed());
				monster.moveToward(skier.getXPosition(), skier.getYPosition(), true);
			} else if (skier.isBeingEaten && !monster.isEating) {
				monster.setSpeed(skier.getSpeed());
				monster.moveTowardWithConviction(getRandomlyInTheCentre(), getAboveViewport());
			}

			monster.draw(dContext);
			monster.cycle();
		});

		randomlyGenerateObject(sprites.smallTree, 10);
		randomlyGenerateObject(sprites.tallTree, 5);
		randomlyGenerateObject(sprites.jump, 5);
		randomlyGenerateObject(sprites.thickSnow, 5);

		distanceTravelledInMetres = parseFloat(skier.getPixelsTravelledDownMountain() / pixelsPerMetre).toFixed(1);

		if (!monstersComeOut && distanceTravelledInMetres >= 200) {
			monstersComeOut = true;
		}

		if (monstersComeOut && Number.random(100) === 1) {
			spawnMonster();
		}

		skier.cycle();
		
		staticObjects.each(function (staticObject, i) {
			if (staticObject.isAbove(0)) {
				staticObject.deleteOnNextCycle();
				return (delete staticObjects[i]);
			}

			staticObject.moveAwayFromSprite(skier);

			staticObject.cycle();
			staticObject.draw(dContext, 'main');
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

loadImages(imageSources, drawScene);