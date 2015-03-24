var port = "8001";
var url = 'http://localhost:' + port;
var socketio = require('socket.io-client');
var connectionSocket = socketio(url);
connectionSocket.on('connect', function() {});
var socket = {}; 
var player = false;

var preselectedPlayer = false;
if (process.argv[2]) {
	preselectedPlayer = parseInt(process.argv[2], 10);
	if (!preselectedPlayer) {
		console.log("not valid argument: " + process.argv[2]); 
	}
}

var connected = false;

connectionSocket.on("init", function(response) {
	if (connected) { //TODO: I don't like this code. replace.
		return;
	}
	connected = true;

	if (preselectedPlayer) {
		player = findConnection(preselectedPlayer, response.availableConnections);
		if (player) {
			setNamespace(url + player.namespace);
		} else {
			promptUser("Pick a connection and hit enter.");
		}
	} else {
		promptUser("Pick a connection and hit enter.");
	}

	function promptUser (message) {
		console.log(message);
		for (var i = 0; i < response.availableConnections.length; i++) {
	    	console.log(response.availableConnections[i].playerNumber + ": " + response.availableConnections[i].namespace);
	    }
	    process.stdin.setEncoding('utf8');
	    process.stdin.once('data', function(input) {
	    	input = input.trim();
	    	var selection = parseInt(input, 10);
	    	if (selection || selection === 0) {
				player = findConnection(selection, response.availableConnections);
				if (player) {
					setNamespace(url + player.namespace);
				} else {
					promptUser("Type a number listed and hit enter.");	
				}
			} else {
				promptUser(input + " is invalid input.  Type a number and press enter.");
			}
	    });
	}
	

   //  function promptUser (promptString, availableConnections) {
   //  	console.log(promptString);
   //  	for (var i = 0; i < availableConnections.length; i++) {
	  //   	console.log(availableConnections[i].playerNumber + ": " + availableConnections[i].namespace);
	  //   }
	  //   process.stdin.setEncoding('utf8');
	  //   process.stdin.once('data', function(input) {
	  //   	input = input.trim();
	  //   	var selection = parseInt(input, 10);
	  //   	if (selection) {
			// 	player = findConnection(selection, response.availableConnections);
			// 	if (player) {
			// 		setNamespace(url + player.namespace);	
			// 	}
			// }
	  //   });
   //  }
	function findConnection(selection, availableConnections) {
		var ac = availableConnections.filter(function(connection) {
			return parseInt(connection.playerNumber) === parseInt(selection); //(NaN === NaN) is false
		});
		return (ac.length > 0) ? ac[0] : false;
	}
    function setNamespace(urlPlusNamespace) {
    	socket = socketio(urlPlusNamespace); //set namespace
    	socket.on('connect', function() { //connect to namespace
			socket.on("connected", driver);
			console.log("connected");
			socket.on("disconnect", function() {
				console.log("disconnecting");
				process.exit(1)
			});
		}); 
    }
});



//AI logic goes in this function
function driver() {

	var staticData;
	var enemyBases = [];
	var myBase = [];
	var myTanks = [];
	socket.emit("getStaticData");
	socket.on("returnStaticData", function(response) {
		staticData = response;
		enemyBases = response.staticPlayerData.filter(function(playerData) {
			return playerData.playerColor !== player.playerColor;
		});
		myBase = response.staticPlayerData.filter(function(playerData) {
			return playerData.playerColor === player.playerColor;
		})[0];
		for (var i = 0; i < myBase.numberOfTanks; i++) { 
			myTanks.push(new Tank({tankNumber: i, tankColor: player.playerColor}));
		}
	});

	setInterval(drive, 1000/10);
	

	function drive() {
		socket.emit("getDynamicState");
		socket.on("returnDynamicState", function(response) { //console.log(response);
			var myTanksNewPosition = response.dynamicBodies.filter(function(db) {
				return db.color === player.playerColor;
			});
			//console.log(myTanksNewPosition[0].position);

			updateMyTanks(myTanksNewPosition);

			calculateGoal();

			sendBackCommands();


			

			//calculate distance and angle

			//send back commands

			// for (var i = 0; i < myTanks.length; i++) {
			// 	var d = getDistance(myTanks[i]);
			// 	var goal = enemyBases[0].base;

			// }
			for (var i = 0; i < response.dynamicBodies.length; i++) {
				//console.log(response.dynamicBodies[i]);
			}
		});
	}

	function updateMyTanks (myTanksNewPosition) {
		for (var i = 0; i < myTanks.length; i++) {
			for (var j = 0; j < myTanksNewPosition.length; j++) {
				if (myTanks[i].tankNumber === myTanksNewPosition[j].tankNumber) { //change to j for all tanks
					myTanks[i].position = myTanksNewPosition[j].position;
					myTanks[i].angle = myTanksNewPosition[j].angle;
				}
			}
		}
	}

	function calculateGoal() {
		var distance = 0;
		var angle = 0;
		var degrees = 0;
		var relativeX = 0;
		var relativeY = 0;


		for (var i = 0; i < myTanks.length; i++) {
			if (myTanks[i].hasTarget()) {
				goal = myTanks[i].getTarget();
			} else {
				goal = myTanks[i].generateTarget();
			}

			//console.log(goal);
			distance = round(Math.sqrt(Math.pow(( goal.x - myTanks[i].position.x ), 2) + Math.pow(( goal.y - myTanks[i].position.y ), 2)), 4);
			relativeX = goal.x - myTanks[i].position.x; //relative
			relativeY = goal.y - myTanks[i].position.y;
			angle = round(Math.atan2(-(relativeY), relativeX), 4);
			//angle = Math.atan( ( goal.y - myTanks[i].position.y ) / ( goal.x - myTanks[i].position.x ) );
			degrees = round(angle * (180 / Math.PI), 4);  //convert from radians to degrees
			degrees = degrees % 360; //(-360 to 360)prevent overflow
			//console.log( goal.y, myTanks[i].position.y, goal.x, myTanks[i].position.x );
			//console.log("distance: " + distance, "angle: " + angle, "degrees: " + degrees);
			//console.log(degrees, myTanks[i].angle);
			degrees = -(degrees); // tank degrees ascends clockwise. atan2 ascends counter clockwise.
			//console.log(Math.abs(myTanks[i].angle), Math.abs(degrees));
			//turn in the direction whichever is closer

			var angleDiff = 0;
			if (degrees > myTanks[i].angle) { // +
				myTanks[i].goal.angleVel = 1;
			} else { // -
				myTanks[i].goal.angleVel = -1;	
			} 

			// var angleDiff = 0;
			// if (degrees > myTanks[i].angle) { // +
			// 	angleDiff = degrees - myTanks[i].angle;
			// 	if (angleDiff > 50) {
			// 		myTanks[i].goal.angleVel = 1;
			// 	} else if (angleDiff > 20) {
			// 		myTanks[i].goal.angleVel = 0.5;
			// 	} else if (angleDiff > 10) {
			// 		myTanks[i].goal.angleVel = 0.1;
			// 	} else {
			// 		myTanks[i].goal.angleVel = 0.01;
			// 	}
			// } else if (degrees < myTanks[i].angle) { // -
			// 	angleDiff = myTanks[i].angle - degrees;
			// 	if (angleDiff > 50) {
			// 		myTanks[i].goal.angleVel = -1;
			// 	} else if (angleDiff > 20) {
			// 		myTanks[i].goal.angleVel = -0.5;
			// 	} else if (angleDiff > 10) {
			// 		myTanks[i].goal.angleVel = -0.1;
			// 	} else {
			// 		myTanks[i].goal.angleVel = -0.01;
			// 	}
			// } else {
			// 	console.log("does this ever happen?");
			// }

			// var angleDiff = Math.abs(myTanks[i].angle) - Math.abs(degrees);
			// if (angleDiff < -50) { 
			// 	myTanks[i].goal.angleVel = 1;
			// } else if (angleDiff < -20) {
			// 	myTanks[i].goal.angleVel = 0.5;
			// } else if (angleDiff < -10) {
			// 	myTanks[i].goal.angleVel = 0.1;
			// } 
			// else if (angleDiff > 50) {
			// 	myTanks[i].goal.angleVel = -1;
			// } else if (angleDiff > 20) {
			// 	myTanks[i].goal.angleVel = -0.5;
			// } else if (angleDiff > 10) {
			// 	myTanks[i].goal.angleVel = -0.1;
			// } 
			// else {
			// 	myTanks[i].goal.angleVel = 0;
			// }
			//console.log(angleDiff, myTanks[i].goal.angleVel);

			//set speed
			if (distance >= 100) {
				myTanks[i].goal.speed = 1;
			} else {
				myTanks[i].goal.speed = 0;
				myTanks[i].missionAccomplished();
			}
		}

	}

	function sendBackCommands() {
		//add up all calculations
		var speed, angleVel, orders;
		for (var i = 0; i < myTanks.length; i++) {
			speed = myTanks[i].goal.speed * 1;
			angleVel = myTanks[i].goal.angleVel * 1;
			orders = {
				tankNumbers: [myTanks[i].tankNumber],
				speed: speed,
				angleVel: angleVel
			}
			socket.emit("move", orders);
			orders = {
				tankNumbers: [0,1,2,3]
			}
			socket.emit("fire", orders);
		}
	}


	var Tank = function(tankInfo) {
		this.tankNumber = tankInfo.tankNumber;
		this.tankColor = tankInfo.tankColor;
		this.position = {x: 0, y: 0};
		this.angle = tankInfo.angle;
		this.goal = {
			speed: 0,
			angleVel: 0
		};
		this.target = {x: 100, y: 100};
		this.hasATarget = false;
	};
	Tank.prototype = {
		getTarget: function() {
			return this.target;
		},
		hasTarget: function() {
			return this.hasATarget;
		},
		generateTarget: function() {
			var randomNumber = Math.floor(Math.random() * 10 % enemyBases.length); //random num between 0 and enemyBases.length
			//console.log(randomNumber, enemyBases[randomNumber].base);
			this.target = enemyBases[randomNumber].base.position;
			this.hasATarget = true;
			return this.target;
		},
		missionAccomplished: function() {
			this.hasATarget = false;
		}
		// setSpeed: function(speed) {
		// 	if (speed > 1) {
		// 		this.speed = speed;
		// 	}
		// 	else if (speed < 0) {
		// 		this.speed = 0;
		// 	} else {
		// 		this.speed = 0;
		// 	}
		// },
		// setAngleVelocity: function(angleVel) {
		// 	angleVel = angleVel % 360 //prevent angle overflow
		// 	this.angleVel = angleVel;
		// }


	};



	// var orders = {
	// 	tankNumbers: [0],
	// 	speed: 1,
	// 	angleVel: 0.15
	// }
	// socket.emit("move", orders);

	// orders = {
	// 	tankNumbers: [1],
	// 	speed: .75,
	// 	angleVel: -0.5
	// }
	// socket.emit("move", orders);

	// orders = {
	// 	tankNumbers: [2],
	// 	speed: .5,
	// 	angleVel: 0.2
	// }
	// socket.emit("move", orders);

	// orders = {
	// 	tankNumbers: [3],
	// 	speed: .25,
	// 	angleVel: -0.1
	// }
	// socket.emit("move", orders);

	// orders = {
	// 	tankNumbers: [0,1,2,3]
	// }
	// setInterval(function() {
	// 	socket.emit("fire", orders);
	// }, 3000);
}




function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}




