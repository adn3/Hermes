// ------------ Channels ----------------- //
var u = require('./adn3.net.utils');

var Channel = function (name) {
    this.name = name,
    this.hosts = [];
};

Channel.prototype.join = function(host) {
        for (var i = 0; i < this.hosts.length; i++) {
                if (this.hosts[i] == host) return false;
        }
        this.hosts.push(host);
        this.broadcast("Host :" + host.uuid + " joined " + this.name, host);
        return true;
};

Channel.prototype.quit = function(host, msg) {
        for (var i = 0; i < this.hosts.length; i++) {
                if (this.hosts[i] == host) {
                        this.hosts.splice(i, 1);
                }
        }
        this.broadcastAll("Host :" +host.uuid+ " quit", host);
};


Channel.prototype.broadcast = function(msg, from) {
	u.debug('Channel.broadcast');
        for (var j = 0; j < this.hosts.length; j++) {
                var host = this.hosts[j];
                if (host == from) continue;
                if (host === undefined) continue;
                host.message(msg, this, from);
        }
	u.debug('Channel.broadcast');
};

Channel.prototype.broadcastAll = function(msg, from) {
        this.broadcast(msg, from);
        from.message(msg, this, from);
};

module.exports = Channel;
