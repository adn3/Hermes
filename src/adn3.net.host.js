// ------------ Hosts ------------------ //

var u = require('./adn3.net.utils');
var uuid = require('node-uuid');
var version = require('./adn3.net.version');
var Channel = require('./adn3.net.channel');
var sys = require('util');
var jsonschema = require('json-schema');
var inspect = sys.inspect;

function lookupChannel(name) {
        u.debug("In lookupChannel");
        if (u.channels[name]) return u.channels[name];
        u.channels[name] = new Channel(name);
        u.debug("Out lookupChannel");
        return u.channels[name];
}


var Host = function (s) {
        this.socket = s;
        this.channels = [];
        this.registered = false;
        this.uuid = uuid.v4();
};

Host.prototype.message = function (msg, chan, source) {
                u.debug("In Host.message");
                var dat = {
                        source: undefined,
                        target: this.uuid,
                        api_version: version,
                        channel: undefined,
                        data: msg
                };
                if (source !== undefined) { dat.source = source.uuid ; }
                if (chan !== undefined) { dat.channel = chan.name; }
                if (this.socket.readyState != "open" &&
                    this.socket.readyState != "writeOnly") {
                        return false;
                }
                u.debug(inspect(this.socket.readyState));
    	u.debug(inspect(dat));
                var text = JSON.stringify(dat);
                this.socket.write(text + "\r\n");
                u.debug("Out Host.message");
};

Host.prototype.join = function (channelName) {
        u.debug("In Host.join");
        for (var i = 0; i < this.channels.length; i++) {
                if (channelName == this.channels[i].name) return;
        }
        var channel = new lookupChannel(channelName);
        if (channel.join(this)) {
                this.channels.push(channel);
        }
        u.debug ("New channel list");
        for (var i in u.channels) {
                u.debug(u.channels[i]);
        }
        u.debug("Out Host.join");
};

Host.prototype.process = function (msg) {
                // JSON.parse(msg);a
                var match = /^(\w+)\s+(.*)$/.exec(msg);
                if (!match) {
                        u.debug("exec cmd line : " + msg);
			var sent = false;
			for (i = 0; i < this.channels.length; i++) {
				this.channels[i].broadcastAll(msg, this);
				sent = true;
				
			}
			if (!sent) {
				this.message(msg);
			}
			return;
                }
                var cmd = match[1].toUpperCase();
                var rest = match[2];

                switch (cmd) {
                        case "TOPIC":
                                u.debug("in topic");
                                var args = rest.split(/\s/);
                                var chans = args[0].split(",");
                                for (var i = 0; i < chans.length; i++) {
                                        this.join(chans[i]);
                                }
                                break;
			default:
				this.message(msg);
                }
};

Host.prototype.quit = function (msg) {
        this.message(msg);
        u.hosts[this.uuid] = undefined;
        while (this.channels.length > 0) {
                this.channels.pop().quit(this, msg);
        }
        this.socket.close();
};

module.exports = Host;

