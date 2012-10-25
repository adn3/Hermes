var port = process.env.PORT;//|| 4444;
var addr = process.env.IP;//|| "127.0.0.1";
var net = require("net");
var sys = require("util");
var Host = require('./adn3.net.host');
var Channel = require('./adn3.net.channel');  
var u = require('./adn3.net.utils');
var puts = console.log;
var inspect = sys.inspect;
require('./adn3.net.version');

var RqtHandler = function(host) {
    this.host = host;
    };

RqtHandler.prototype.onConnect = function() {
    this.host.message("test", undefined);
};
RqtHandler.prototype.onData = function(data) {
	try {
		var i;
        var buffer = "";
        buffer += data;
		while (i = buffer.indexOf("\r\n")) {
			if (i < 0) break;
			var msg = buffer.slice(0,i);
			if (msg.length > 1024) {
				this.host.quit("Too much data");
			} else {
				buffer = buffer.slice(i+2);
				this.host.process(msg);
			}
		}
	} catch(e) {
		puts("Receive : Exception - " + e);
	}
};
RqtHandler.prototype.onEnd = function(data) {
	try {
		if (this.host !== undefined) { 
			this.host.quit("Connection reset by peer");
		}
	} catch (e) {
		puts("Eof : Exception - " + e);
	}    
};
RqtHandler.prototype.onTimeout = function(data) {
	try {
		if (this.host !== undefined) {
			this.host.quit("idle timeout");
		}
	} catch (e) {
		puts("Timeout : Exception - " + e);
	}    
};

var server = net.createServer(function (s) {
    s.setTimeout(2*60*1000); // 2 minutes idle timeout
    //s.setEncoding("utf8");
	u.debug("Connection from " + s.remoteAddress);
	
	var host = new Host(s);
	u.hosts[host.uuid] = host;
    var rqtHandler = new RqtHandler(host);
	
    s.addListener("connect", rqtHandler.onConnect);
    s.addListener("data", rqtHandler.onData);
    s.addListener("end",rqtHandler.onEnd);
    s.addListener("timeout",rqtHandler.onTimeout);
    /*
    s.addListener("connect", function () {
		host.message("test", undefined);
	});
	s.addListener("data", function (data) {
		try {
			var i;
            buffer += data;
			while (i = buffer.indexOf("\r\n")) {
				if (i < 0) break;
				var msg = buffer.slice(0,i);
				if (msg.length > 1024) {
					host.quit("Too much data");
				} else {
					buffer = buffer.slice(i+2);
					host.process(msg);
				}
			}
		} catch(e) {
			puts("Receive : Exception - " + e);
		}
	});
	s.addListener("end", function (data) {
		try {
			if (host !== undefined) { 
				host.quit("Connection reset by peer");
			}
		} catch (e) {
			puts("Eof : Exception - " + e);
		}
	});
	
	s.addListener("timeout", function (data) {
		try {
			if (host !== undefined) {
				host.quit("idle timeout");
			}
		} catch (e) {
			puts("Timeout : Exception - " + e);
		}
	});
    */
});
server.listen(port, addr);
puts("Listening on ["+addr+"] port ["+port+"]");
