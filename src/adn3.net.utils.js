
var Utils = function() {
    this.debuglevel = 1,
    this.hosts = {},
	this.channels = {}
};

Utils.prototype.debug = function(m) {
		if (this.debuglevel > 0) {
			console.log(m);
		}
	};

module.exports = new Utils();
