var port = "8003";
port = parseInt(process.argv[3], 10) || port
var url = 'http://localhost:' + port;
var socketio = require('socket.io-client');
var socket = socketio(url);
var command;  //socket to send commands on
var initData;
var selectedPlayer;


var connected = false;

var playerSelection;
if (process.argv[2] ||process.argv[2] === 0 ) {
	playerSelection = parseInt(process.argv[2], 10);
} else {
	console.error("usage: node index.js <player-number> <port>")
	process.exit(1)
}

var enemyBases = [];
var myTanks = [];
var allBases = [];
socket.on("init", function(initD) {
	if (connected) {
		return false;
	}
	socket.on("disconnect", function() {
		//process.exit(1);
	});
	connected = true;
	initData = initD;
	selectedPlayer = initData.players[playerSelection];
	command = socketio(url + "/" + selectedPlayer.namespace);
	enemyBases = initData.players.filter(function(p) {
		return selectedPlayer.playerColor !== p.playerColor;
	});
	allBases = initData.players;
	var serverTanks = initData.tanks.filter(function(t) {
		return selectedPlayer.playerColor === t.color;
	});
	for (var i = 0; i < serverTanks.length; i++) {
		myTanks.push(new Tank(i));
	}

	setTimeout(function() {
		startInterval();
	}, 2000);

});


/*** AI logic goes after here ***/

/** send back to server **/
function startInterval() {
	setInterval(function() {
		sendBackCommands();
	}, 500);

	setInterval(function() {
		fire();
	}, 500);
}

function sendBackCommands() {
	//add up all calculations
	var speed, angleVel, orders;
	for (var i = 0; i < myTanks.length; i++) {
		speed = myTanks[i].goal.speed * 1;
		angleVel = myTanks[i].goal.angleVel * 1;
		orders = {
			tankNumbers: [myTanks[i].tankNumber], //an array of numbers e.g. [0,1,2,3]
			speed: speed,                         //speed of tank value of -1 to 1, numbers outside of this range will default to -1 or 1, whichever is closer.
			angleVel: angleVel                    //turning speed of tank positive turns right, negative turns left
		}
		command.emit("move", orders);
	}
}

function fire() {
	var orders = {
		tankNumbers: [0,1,2,3]
	}
	command.emit("fire", orders);
}

/** recieve from server **/
socket.on("refresh", function(gameState) {
	var myTanksNewPosition = gameState.tanks.filter(function(t) {
		return selectedPlayer.playerColor === t.color;
	});

	updateMyTanks(myTanksNewPosition);
	calculateGoal();
	// if (gameState.boundaries.length > 0) {
	// 	//calculateObstacle(gameState.boundaries);
	// }
	
});

function updateMyTanks (myTanksNewPosition) {
	for (var i = 0; i < myTanks.length; i++) {
		for (var j = 0; j < myTanksNewPosition.length; j++) {
			if (myTanks[i].tankNumber === myTanksNewPosition[j].tankNumber) {
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
	var angleDifference = 0;

	for (var i = 0; i < myTanks.length; i++) {
		if (myTanks[i].hasTarget()) {
			goal = myTanks[i].getTarget();
		} else {
			goal = myTanks[i].generateTarget();
		}
		//find distance to goal
		distance = round(Math.sqrt(Math.pow(( goal.x - myTanks[i].position.x ), 2) + Math.pow(( goal.y - myTanks[i].position.y ), 2)), 4);

		//find angle difference to face goal
		relativeX = goal.x - myTanks[i].position.x;
		relativeY = goal.y - myTanks[i].position.y;
		angle = round(Math.atan2(-(relativeY), relativeX), 4);
		degrees = round(angle * (180 / Math.PI), 4);  //convert from radians to degrees
		degrees = -(degrees); // tank degrees ascends clockwise. atan2 ascends counter clockwise. this fixes that difference

		//turn in the direction whichever is closer
		if (degrees < 0) {
			degrees = (degrees + 360) % 360;
		}

		angleDifference = myTanks[i].angle - degrees;

		if (angleDifference > 0) {
			if (angleDifference < 180) {
				myTanks[i].goal.angleVel = -1;
			} else {
				myTanks[i].goal.angleVel = 1;
			}
		} else {
			if (angleDifference > -180) {
				myTanks[i].goal.angleVel = 1;
			} else {
				myTanks[i].goal.angleVel = -1;
			}
		}

		//set speed
		if (distance >= 10) {
			myTanks[i].goal.speed = 1;
		} else {
			//myTanks[i].goal.speed = 0;
			myTanks[i].missionAccomplished();
		}
	}
}

// function calculateObstacle(obstacles) {

// }





/*** TANK ***/
var Tank = function(tankNumber) {
	this.tankNumber = tankNumber;
	this.tankColor = selectedPlayer.playerColor;
	this.position = {x: 0, y: 0};
	this.angle;
	this.goal = {
		speed: 0,
		angleVel: 0
	};
	this.avoidObstacle = {
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
		/* //wander between enemy bases
		var randomNumber = Math.floor(Math.random() * 10 % enemyBases.length); //random num between 0 and enemyBases.length
		//var randomNumber = 1;
		//console.log(randomNumber, enemyBases[randomNumber].base);
		this.target = enemyBases[randomNumber].base.position;
		*/

		//wander between all bases
		var randomNumber = Math.floor(Math.random() * 10 % allBases.length); //random num between 0 and enemyBases.length
		this.target = allBases[randomNumber].base.position;

		this.hasATarget = true;
		return this.target;
	},
	missionAccomplished: function() {
		this.hasATarget = false;
	}
};


//rounds number (value) to specified number of decimals
function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}


