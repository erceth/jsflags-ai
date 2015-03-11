var port = "8001";
var url = 'http://localhost:' + port;
var socketio = require('socket.io-client');
var socket = socketio(url);
socket.on('connect', function() {});

var preselectedPlayer = false; console.log(process.argv[2]);
if (process.argv[2]) {
	preselectedPlayer = process.argv[2];
}


var connection = "";

socket.on("init", function(availableConnections) {
	if (preselectedPlayer || preselectedPlayer === 0) {
		setNamespace(url + availableConnections.availableConnections[preselectedPlayer].namespace);
	} else {
	    console.log("Pick a connection and hit enter.");
	    for (var i = 0; i < availableConnections.availableConnections.length; i++) {
	    	console.log(i + ": " + availableConnections.availableConnections[i].namespace);
	    }
		process.stdin.setEncoding('utf8');
	    process.stdin.on('data', function(input) {
	    	input = input.trim();
	    	var selection = parseInt(input, 10)
	    	if (selection || selection === 0) {
	    		setNamespace(url + availableConnections.availableConnections[selection].namespace);
	    	} else {
	    		console.log('Problem with input:', input);	
	    		console.log("Pick a number and hit enter.");
			    for (var i = 0; i < availableConnections.availableConnections.length; i++) {
			    	console.log(i + ": " + availableConnections.availableConnections[i].namespace);
			    }
	    	}
	    });
	}
    function setNamespace(urlPlusNamespace) {
    	socket = socketio(urlPlusNamespace); //set namespace
    	socket.on('connect', function() { //connect to namespace
			socket.on("connected", driver);
		}); 
    }
});



//AI logic goes in this function
function driver() {
	var orders = {
		tankNumbers: [0],
		speed: 1,
		angleVel: 1
	}
	socket.emit("move", orders);

	var orders = {
		tankNumbers: [1],
		speed: .5,
		angleVel: -0.5
	}
	socket.emit("move", orders);

	var orders = {
		tankNumbers: [2],
		speed: .1,
		angleVel: -0.1
	}
	socket.emit("move", orders);

	var orders = {
		tankNumbers: [3],
		speed: 1,
		angleVel: -0.1
	}
	socket.emit("move", orders);
}

