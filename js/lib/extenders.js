// Extends function so that new-able objects can be given new methods easily
Function.prototype.method = function (name, func) {
    Object.defineProperty(this.prototype, name, {
        value: func,
        enumerable: false,
        writable: true,
        configurable: true
    });
    return this;
};

// Will return the original method of an object when inheriting from another
Object.method('superior', function (name) {
    var that = this;
    var method = that[name];
    return function() {
        return method.apply(that, arguments);
    };
});