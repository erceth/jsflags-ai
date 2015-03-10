 var socket = require('socket.io-client')('http://localhost');
 socket.on('connect', function (data) {
 	console.log(data);
 });

 