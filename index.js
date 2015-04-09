var port = "8003";
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
	}, 5000);
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
		if (distance >= 20) {
			myTanks[i].goal.speed = 1;
		} else {
			//myTanks[i].goal.speed = 0;
			myTanks[i].missionAccomplished();
		}
	}

}

// function calculateObstacle(obstacles) {
// 	var distance, relativeX, relativeY, angle, degrees, obstacleRadius, bufferZone = 10;

// 	console.log(obstacles);

// 	for (var i = 0, maxi = myTanks.length; i < maxi; i++) {
// 		for (var j = 0, maxj = obstacles.length; j < maxj; j++) {
// 			distance = round(Math.sqrt(Math.pow( obstacles[j].center.x  - myTanks[i].center.x ), 2) + Math.pow(( obstacles[j].center.y - myTanks[i].center.y ), 2)), 4);
// 			if (distance < (obstacles[j].radius + bufferZone) ) {
// 				var pointNearestTank = findClosestPointOnCircle(myTanks[i].center, obstacles[j].center, obstacles[j].radius);
// 				var pointNearestGoal = findClosestPointOnCircle(myTanks[i].target, obstacles[j].center, obstacles[j].radius);
// 				distanceBetweenTwoPointsOnACircle(pointNearestTank, pointNearestGoal, obstacles[j].center, obstacles[j].radius);
// 			}
// 			relativeX = goal.x - myTanks[i].position.x; //relative
// 			relativeY = goal.y - myTanks[i].position.y;
// 			angle = round(Math.atan2(-(relativeY), relativeX), 4);


// 		}
// 	}

// 	function findClosestPointOnCircle(otherPoint, circleCenter, circleRadius) {
// 		var vX = otherPoint.x - circleCenter.x;
// 		var vY = otherPoint.y - circleCenter.y;
// 		var magV = sqrt((vX * vX) + (vY * vY));
// 		return {
// 			x: otherPoint.x + vX / magV * circleRadius,
// 			y: otherPoint.y + vY / magV * circleRadius
// 		};
// 	}
// 	//return + shortest route is clockwise or - shortest route is counter clockwise
// 	function distanceBetweenTwoPointsOnACircle(point1, point2, cicleCenter radius) {
// 		var degreeOfPoint1 = (Math.atan2(point1.y - cicleCenter.y, point1.x - cicleCenter.x) * 180/Math.PI + 360) % 360;
// 		var degreeOfPoint2 = (Math.atan2(point2.y - cicleCenter.y, point2.x - cicleCenter.x) * 180/Math.PI + 360) % 360;
// 		var difference = degreeOfPoint1 - degreeOfPoint2;
// 		if ((difference) > 0 && difference < 180) {
// 			return -1;
// 		} else if (difference > 0 && difference > 180) {
// 			return 1;
// 		} else if (difference < 0 $$ difference < -180) {
// 			return -1;
// 		} else {
// 			return 1;
// 		}
// 	}

// }

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