/*
 *
 * For the browser ONLY
 *
 */

var global = this;

function require (name) {
	var indexToGoFrom = name.lastIndexOf('/');
	name = name.substring(indexToGoFrom + 1);
	return global[name];
}