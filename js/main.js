import Camera from './lib/camera.js';
import Monster from './lib/monster.js';
import Sprite from './lib/sprite.js';
import Snowboarder from './lib/snowboarder.js';
import Skier from './lib/skier.js';
import InfoBox from './lib/infoBox.js';
import Game from './lib/game.js';
import setupInput from './lib/input.js';
import isMobileDevice from './lib/isMobileDevice.js';
import sprites from './spriteInfo.js';
import { PIXELS_PER_METRE, MONSTER_DISTANCE_THRESHOLD } from './lib/constants.js';

const mainCanvas = document.getElementById('skifree-canvas');
const camera = Camera.create(mainCanvas.getContext('2d'));
const imageSources = ['sprite-characters.png', 'skifree-objects.png'];
const infoBoxControls = isMobileDevice()
	? 'Tap or drag on the piste to control the player'
	: 'Use the mouse or WASD to control the player';

const dropRates = { smallTree: 4, tallTree: 2, jump: 1, thickSnow: 1, rock: 1 };

const state = {
	livesLeft: 5,
	highScore: Number(localStorage.getItem('highScore')) || 0,
	distanceTravelled: 0,
};

function loadImages(sources, next) {
	let loaded = 0;
	sources.forEach(src => {
		const im = new Image();
		im.onload = () => {
			loaded += 1;
			if (loaded === sources.length) next();
		};
		im.src = src;
		camera.storeLoadedImage(src, im);
	});
}

function monsterHitsSkierBehaviour(monster, skier) {
	skier.isEatenBy(monster, () => {
		state.livesLeft -= 1;
		monster.isFull = true;
		monster.isEating = false;
		skier.isBeingEaten = false;
		monster.setSpeed(skier.getSpeed());
		monster.stopFollowing();
		const randomPositionAbove = camera.getRandomMapPositionAboveViewport();
		monster.setMapPositionTarget(randomPositionAbove[0], randomPositionAbove[1]);
	});
}

function startNeverEndingGame() {
	let player;
	let startSign;
	let infoBox;
	let game;

	function resetGame() {
		state.distanceTravelled = 0;
		state.livesLeft = 5;
		state.highScore = Number(localStorage.getItem('highScore')) || 0;
		game.reset();
		game.addStaticObject(startSign);
	}

	function detectEnd() {
		if (!game.isPaused()) {
			localStorage.setItem('highScore', state.distanceTravelled);
			state.highScore = state.distanceTravelled;
			infoBox.setLines([
				'Game over!',
				'Hit space to restart',
			]);
			game.pause();
			game.cycle();
			game.draw();
		}
	}

	function spawnMonster() {
		const newMonster = new Monster(sprites.monster);
		const randomPosition = camera.getRandomMapPositionAboveViewport();
		newMonster.setMapPosition(randomPosition[0], randomPosition[1]);
		newMonster.follow(player);
		newMonster.setSpeed(player.getStandardSpeed());
		newMonster.onHitting(player, monsterHitsSkierBehaviour);
		game.addMovingObject(newMonster, 'monster');
	}

	function spawnBoarder() {
		const newBoarder = new Snowboarder(sprites.snowboarder);
		const randomPositionAbove = camera.getRandomMapPositionAboveViewport();
		const randomPositionBelow = camera.getRandomMapPositionBelowViewport();
		newBoarder.setMapPosition(randomPositionAbove[0], randomPositionAbove[1]);
		newBoarder.setMapPositionTarget(randomPositionBelow[0], randomPositionBelow[1]);
		newBoarder.onHitting(player, sprites.snowboarder.hitBehaviour.skier);
		game.addMovingObject(newBoarder);
	}

	function randomlySpawnNPC(spawnFunction, dropRate) {
		const rateModifier = Math.max(800 - camera.logicalWidth(), 0);
		if (Math.floor(Math.random() * (1001 + rateModifier)) <= dropRate) {
			spawnFunction();
		}
	}

	function spawnTerrain() {
		if (!player.isMoving) return [];
		return Sprite.createObjects([
			{ sprite: sprites.smallTree, dropRate: dropRates.smallTree },
			{ sprite: sprites.tallTree, dropRate: dropRates.tallTree },
			{ sprite: sprites.jump, dropRate: dropRates.jump },
			{ sprite: sprites.thickSnow, dropRate: dropRates.thickSnow },
			{ sprite: sprites.rock, dropRate: dropRates.rock },
		], {
			rateModifier: Math.max(800 - camera.logicalWidth(), 0),
			position: () => camera.getRandomMapPositionBelowViewport(),
			player,
		});
	}

	function tickNPCs() {
		randomlySpawnNPC(spawnBoarder, 0.1);
		state.distanceTravelled = parseFloat(player.getPixelsTravelledDownMountain() / PIXELS_PER_METRE).toFixed(1);
		if (state.distanceTravelled > MONSTER_DISTANCE_THRESHOLD) {
			randomlySpawnNPC(spawnMonster, 0.001);
		}
	}

	function updateHUD() {
		infoBox.setLines([
			'SkiFree.js',
			infoBoxControls,
			`Travelled ${state.distanceTravelled}m`,
			`Skiers left: ${state.livesLeft}`,
			`High Score: ${state.highScore}`,
			'Created by Dan Hough (@basicallydan)',
			`Current Speed: ${player.getSpeed()}`,
		]);
	}

	player = new Skier(sprites.skier);
	player.setMapPosition(0, 0);
	player.setMapPositionTarget(0, -10);

	game = new Game(camera, player);

	startSign = new Sprite(sprites.signStart);
	game.addStaticObject(startSign);
	startSign.setMapPosition(-50, 0);

	infoBox = new InfoBox({
		initialLines: [
			'SkiFree.js',
			infoBoxControls,
			'Travelled 0m',
			`High Score: ${state.highScore}`,
			`Skiers left: ${state.livesLeft}`,
			'Created by Dan Hough (@basicallydan)',
		],
		position: { top: 15, right: 10 },
	});

	game.beforeCycle(() => {
		game.addStaticObjects(spawnTerrain());
		if (!game.isPaused()) {
			tickNPCs();
			updateHUD();
		}
	});

	game.afterCycle(() => {
		if (state.livesLeft === 0) detectEnd();
	});

	game.addUIElement(infoBox);

	setupInput({ player, game, canvas: mainCanvas, spawnMonster, spawnBoarder, resetGame });

	player.isMoving = false;
	player.setDirection(270);

	game.start();
}

function resizeCanvas() {
	const dpr = window.devicePixelRatio || 1;
	// Set CSS size to logical pixels, backing store to physical pixels.
	// All game coordinates remain in logical pixels; the scale() call below
	// handles the mapping so every draw lands on a real screen pixel.
	mainCanvas.style.width = `${window.innerWidth}px`;
	mainCanvas.style.height = `${window.innerHeight}px`;
	mainCanvas.width = Math.round(window.innerWidth * dpr);
	mainCanvas.height = Math.round(window.innerHeight * dpr);
	// canvas resize resets the context, so re-apply the scale and crispness.
	camera.scale(dpr, dpr);
	camera.imageSmoothingEnabled = false;
}

window.addEventListener('resize', resizeCanvas, false);

resizeCanvas();
loadImages(imageSources, startNeverEndingGame);
