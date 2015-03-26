var port = "8001";
var url = 'http://localhost:' + port;
var socketio = require('socket.io-client');
var socket = socketio(url);
var command;  //socket to send commands on
var initData;
var selectedPlayer;


var connected = false;

var playerSelection;
if (process.argv[2]) {
	playerSelection = parseInt(process.argv[2], 10);
}

var enemyBases = [];
var myTanks = [];
socket.on("init", function(initD) {
	if (connected) {
		return false;
	}
	connected = true;
	initData = initD;
	selectedPlayer = initData.players[playerSelection];
	command = socketio(url + "/" + selectedPlayer.namespace);
	enemyBases = initData.players.filter(function(p) {
		return selectedPlayer.playerColor !== p.playerColor;
	});
	for (var i = 0; i < initData.numOfTanks; i++) {
		myTanks.push(new Tank(i));
	}

	setTimeout(function() {
		startInterval();
	}, 2000);

});


//AI logic goes after here
socket.on("refresh", function(gameState) {
	var myTanksNewPosition = gameState.tanks.filter(function(t) {
		return selectedPlayer.playerColor === t.color;
	});

	updateMyTanks(myTanksNewPosition);
	calculateGoal();
	if (gameState.boundaries.length > 0) {
		//calculateObstacle(gameState.boundaries);
	}
	
});


function startInterval() {
	// var orders = {
	// 	tankNumbers: [1],
	// 	speed: 1,
	// 	angleVel: 0.15
	// }
	// command.emit("move", orders);
	setInterval(function() {
		sendBackCommands();
	}, 500);

	setInterval(function() {
		fire();
	}, 3000);
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

function fire() {
	var orders = {
		tankNumbers: [0,1,2,3]
	}
	command.emit("fire", orders);
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


		//set speed
		if (distance >= 100) {
			myTanks[i].goal.speed = 1;
		} else {
			myTanks[i].goal.speed = 0;
			myTanks[i].missionAccomplished();
		}
	}

}

function calculateObstacle(obstacles) {
	var distance, relativeX, relativeY, angle, degrees;

	console.log(obstacles);

	for (var i = 0, maxi = myTanks.length; i < maxi; i++) {
		for (var j = 0, maxj = obstacles.length; j < maxj; j++) {
			distance = round(Math.sqrt(Math.pow(( obstacles - myTanks[i].position.x ), 2) + Math.pow(( goal.y - myTanks[i].position.y ), 2)), 4);
			relativeX = goal.x - myTanks[i].position.x; //relative
			relativeY = goal.y - myTanks[i].position.y;
			angle = round(Math.atan2(-(relativeY), relativeX), 4);


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
		command.emit("move", orders);
	}
}



var Tank = function(tankNumber) {
	this.tankNumber = tankNumber;
	this.tankColor = selectedPlayer.playerColor;
	this.position = {x: 0, y: 0};
	this.angle;
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
};






	// orders = {
	// 	tankNumbers: [0,1,2,3]
	// }
	// setInterval(function() {
	// 	socket.emit("fire", orders);
	// }, 3000);




function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}




// var orders = {
	// 	tankNumbers: [0],
	// 	speed: 1,
	// 	angleVel: 0.15
	// }
	// command.emit("move", orders);

	// orders = {
	// 	tankNumbers: [1],
	// 	speed: .75,
	// 	angleVel: -0.5
	// }
	// command.emit("move", orders);

	// orders = {
	// 	tankNumbers: [2],
	// 	speed: .5,
	// 	angleVel: 0.2
	// }
	// command.emit("move", orders);

	// orders = {
	// 	tankNumbers: [3],
	// 	speed: .25,
	// 	angleVel: -0.1
	// }
	// command.emit("move", orders);