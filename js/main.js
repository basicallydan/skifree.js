var mainCanvas = document.getElementById('skifree-canvas');
var dContext = mainCanvas.getContext('2d');
var imageSources = [ 'sprite-characters.png', 'skifree-objects.png' ];
var global = this;

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
			hit : [ 0, 78, 31, 31 ]
		}
	},
	'smallTree' : {
		$imageFile : 'skifree-objects.png',
		parts : {
			main : [ 0, 28, 30, 34 ]
		}
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
		}
	}
};
var pixelsPerMetre = 18;
var monstersComeOut = false;
var distanceTravelledInMetres = 0;
var livesLeft = 5;

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

function drawScene (images) {
	var skier;
	var infoBox;
	var trees = [];
	var monsters = [];
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
		monsters = [];
		trees = [];
	}

	function detectEnd () {
		if (livesLeft === 0) {
			paused = true;
		}
	}

	skier = new Skier(sprites.skier);

	infoBox = new InfoBox({
		initialLines : [
			'SkiFree.js',
			'Use the mouse to control the skier',
			'Travelled 0m',
			'Skiers left: ' + livesLeft,
			'Created by Dan Hough (@basicallydan)'
		],
		position: {
			top: 15,
			right: 10
		}
	});

	skier.setPosition(mouseX, getMiddleOfViewport());

	setInterval(function () {
		var skierOpposite = skier.getMovingTowardOpposite();

		mainCanvas.width = mainCanvas.width;

		skier.moveToward(mouseX, mouseY);

		skier.draw(dContext);

		monsters.each(function (monster, i) {
			if (monster.isAbove(getAboveViewport() - 100)) {
				console.log('Deleting monster');
				return (delete monsters[i]);
			}

			if (monster.isFull) {
				monster.move();
			} else if (!skier.isBeingEaten) {
				monster.setSpeed(1);
				monster.moveToward(skier.getXPosition(), skier.getYPosition(), true);
			} else if (skier.isBeingEaten && !monster.isEating) {
				monster.setSpeed(skier.getSpeed());
				monster.moveTowardWithConviction(getRandomlyInTheCentre(), getAboveViewport());
			}

			monster.draw(dContext);

			if (skier.hits(monster)) {
				skier.hasHitObstacle(monster);
				skier.isEatenBy(monster, function () {
					livesLeft -= 1;
					monster.isFull = true;
					monster.isEating = false;
					skier.isBeingEaten = false;
					monster.setSpeed(skier.getSpeed());
					monster.moveTowardWithConviction(getRandomlyInTheCentre(), getAboveViewport());
				});
			}
		});

		trees.each(function (tree, i) {
			if (tree.isAbove(0)) {
				console.log('Deleting tree');
				return (delete trees[i]);
			}

			var moveTreeTowardX = tree.getXPosition() + skierOpposite[0];
			var moveTreeTowardY = tree.getYPosition() + skierOpposite[1];

			tree.moveToward(moveTreeTowardX, moveTreeTowardY);

			if (skier.hits(tree)) {
				skier.hasHitObstacle(tree);
			}

			monsters.each(function (monster, i) {
				if (monster.hits(tree)) {
					return (delete monsters[i]);
				}
			});

			tree.draw(dContext, 'main');
		});

		if (Number.random(8) === 1 && skier.isMoving) {
			(Number.random(1)).times(function () {
				var newTree = new Sprite(sprites.smallTree);
				newTree.setSpeed(skier.getSpeed());
				newTree.setPosition(getRandomlyInTheCentre(200), getBelowViewport());
				trees.push(newTree);
			});
		}

		distanceTravelledInMetres = parseFloat(skier.getPixelsTravelledDownMountain() / pixelsPerMetre).toFixed(1);

		infoBox.setLines([
			'SkiFree.js',
			'Use the mouse to control the skier',
			'Travelled ' + distanceTravelledInMetres + 'm',
			'Skiers left: ' + livesLeft,
			'Created by Dan Hough (@basicallydan)'
		]);

		if (!monstersComeOut && distanceTravelledInMetres >= 200) {
			monstersComeOut = true;
		}

		infoBox.draw(dContext);

		if (monstersComeOut && Number.random(300) === 1) {
			var newMonster = new Monster(sprites.monster);
			newMonster.setPosition(getRandomlyInTheCentre(), getAboveViewport());
			newMonster.setSpeed(1);
			monsters.push(newMonster);
		}
	}, 10);

	$(mainCanvas)
	.mousemove(function (e) {
		mouseX = e.pageX;
		mouseY = e.pageY;
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
	});
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

window.addEventListener('resize', resizeCanvas, false);

resizeCanvas();

loadImages(imageSources, drawScene);