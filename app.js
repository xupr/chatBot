var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 3000;

app.use(express.static(__dirname + '/client')); 		// statics
require('./server/routes.js')(app);						// routes
require('./server/socket.js')(io);                      // sockets

server.listen(port);		
console.log("Web server listening on port " + port);
