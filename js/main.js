var mainCanvas = document.getElementById('skifree-canvas');
var dContext = mainCanvas.getContext('2d');
var imageSources = [ 'sprite-characters.png', 'skifree-objects.png' ];

var sprites = {
	'skier' : {
		$imageFile : 'sprite-characters.png',
		parts : {
			east : [ 0, 0, 24, 34 ],
			esEast : [ 24, 0, 24, 34 ],
			sEast : [ 49, 0, 17, 34 ],
			south : [ 65, 0, 17, 34 ],
			sWest : [ 49, 37, 17, 34 ],
			wsWest : [ 24, 37, 24, 34 ],
			west : [ 0, 37, 24, 34 ]
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
			sWest2 : [ 90, 158, 32, 43 ]
		}
	}
};

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
	var trees = [];
	var monsters = [];
	var mouseX = getCentreOfViewport();
	var mouseY = mainCanvas.height;

	dContext.getLoadedImage = function (imgPath) {
		if (images[imgPath]) {
			return images[imgPath];
		}
	};

	skier = new Skier(sprites.skier);
	tree = new Sprite(sprites.smallTree);

	skier.setPosition(mouseX, getMiddleOfViewport());

	setInterval(function () {
		var xChange = '0';

		mainCanvas.width = mainCanvas.width;

		skier.moveToward(mouseX, mouseY);

		skier.draw(dContext);

		trees.each(function (tree, i) {
			if (tree.isAbove(0)) {
				console.log('Deleting tree');
				return (delete trees[i]);
			}

			var skierOpposite = skier.getMovingTowardOpposite();

			tree.moveToward(tree.getXPosition() - skierOpposite[0], tree.getYPosition() - skierOpposite[1]);
			tree.draw(dContext, 'main');
		});

		// monsters.each(function (monster, i) {
		// 	monster.moveToward(skier.getXPosition(), skier.getYPosition());
		// 	monster.draw(dContext);
		// });

		if (Number.random(10) === 1) {
			(Number.random(1)).times(function () {
				var newTree = new Sprite(sprites.smallTree);
				newTree.setSpeed = skier.getSpeed();
				newTree.setPosition(getRandomlyInTheCentre(200), getBelowViewport());
				trees.push(newTree);
			});
		}

		// if (Number.random(100) === 1) {
		// 	var newMonster = new Monster(sprites.monster);
		// 	console.log('Making a monster');
		// 	newMonster.setPosition(getRandomlyInTheCentre(), getAboveViewport());
		// 	newMonster.setSpeed(1);
		// 	monsters.push(newMonster);
		// }
	}, 10);

	$(mainCanvas).mousemove(function (e) {
		mouseX = e.pageX;
		mouseY = e.pageY;
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

// function run (firstFn) {
// 	var fns = [];
// 	var fnParams = [];

// 	function then (nextFn) {
// 		fns.push(nextFn);
// 		if (parameters.length > 1) {
// 			fnParams.push(parameters.slice(1));
// 		} else {
// 			fnParams.push(false);
// 		}
// 	}

// 	function go () {
// 		(fns.length - 1).times(function (i) {
// 			var newParams;
// 			if (fnParams[i]) {
// 				newParams = fnParams[i];
// 				newParams = newParams.concat(function () {
// 					if (fn[i + 1]) {
// 						return fn[i + 1]
// 					}
// 				});
// 			}
// 			fns[i]()
// 		});
// 	}

// 	then (firstFn, parameters);

// 	return {
// 		then : then,
// 		go : go
// 	};
// }

loadImages(imageSources, drawScene);

run(loadImages, imageSources)
	.then(drawScene);