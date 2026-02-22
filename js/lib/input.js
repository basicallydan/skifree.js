import Hammer from 'hammerjs';
import Mousetrap from 'br-mousetrap';

export default function setupInput({ player, game, canvas, spawnMonster, spawnBoarder, resetGame }) {
	canvas.addEventListener('mousemove', e => {
		game.setMouseX(e.pageX);
		game.setMouseY(e.pageY);
		player.resetDirection();
		player.startMovingIfPossible();
	});
	canvas.addEventListener('click', e => {
		game.setMouseX(e.pageX);
		game.setMouseY(e.pageY);
		player.resetDirection();
		player.startMovingIfPossible();
	});
	canvas.focus();

	Mousetrap.bind('f', player.speedBoost.bind(player));
	Mousetrap.bind('t', player.attemptTrick.bind(player));
	Mousetrap.bind(['w', 'up'], () => player.stop());
	Mousetrap.bind(['a', 'left'], () => {
		if (player.direction === 270) {
			player.stepWest();
		} else {
			player.turnWest();
		}
	});
	Mousetrap.bind(['s', 'down'], () => {
		player.setDirection(180);
		player.startMovingIfPossible();
	});
	Mousetrap.bind(['d', 'right'], () => {
		if (player.direction === 90) {
			player.stepEast();
		} else {
			player.turnEast();
		}
	});
	Mousetrap.bind('m', spawnMonster);
	Mousetrap.bind('b', spawnBoarder);
	Mousetrap.bind('space', resetGame);

	Hammer(canvas).on('press', e => {
		e.preventDefault();
		game.setMouseX(e.gesture.center.x);
		game.setMouseY(e.gesture.center.y);
	}).on('tap', e => {
		game.setMouseX(e.gesture.center.x);
		game.setMouseY(e.gesture.center.y);
	}).on('pan', e => {
		game.setMouseX(e.gesture.center.x);
		game.setMouseY(e.gesture.center.y);
		player.resetDirection();
		player.startMovingIfPossible();
	}).on('doubletap', () => player.speedBoost());
}
