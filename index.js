var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.argv[2];



