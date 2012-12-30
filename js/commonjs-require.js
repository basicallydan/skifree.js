/*
 *
 * For the browser ONLY
 *
 */

var global = this;

function require (name) {
	if (name.substring(0, 2) == './') {
		name = name.substring(2);
	}
	return global[name];
}