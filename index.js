var connect = require('./connect.js');
var app = connect.connect;


app(function(data) {
    var serverTanks = data.serverTanks;
    var allBases = data.allBases;
    var socket = data.socket;
    var command = data.command;
    var selectedPlayer = data.selectedPlayer;
    var myTanks = [];
    //Create base tank Object with properties
    var Tank = function(tankNumber) {
        this.tankNumber = tankNumber;
        this.tankColor = selectedPlayer.playerColor;
        this.position = {
            x: 0,
            y: 0
        };
        this.angle;
        this.goal = {
            speed: 0,
            angleVel: 0
        };
        this.avoidObstacle = {
            speed: 0,
            angleVel: 0
        };
        this.target = {
            x: 100,
            y: 100
        };
        this.hasATarget = false;
    };
    //extend Tank with functions
    Tank.prototype = {
        getTarget: function() {
            return this.target;
        },
        hasTarget: function() {
            return this.hasATarget;
        },
        generateTarget: function() {

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

    //assign serverTanks to myTanks array
    for (var i = 0; i < serverTanks.length; i++) {
        myTanks.push(new Tank(i));
    }

    function startInterval() {
        setInterval(function() {
            sendBackCommands();
        }, 100);

        setInterval(function() {
            fire();
        }, 100);
    }
    //start sending Commands and Firing.
    startInterval();

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

    function fire() {
        var orders = {
            tankNumbers: [0, 1, 2, 3]
        }
        command.emit("fire", orders);
    }

    socket.on("refresh", function(gameState) {

        var myTanksNewPosition = gameState.tanks.filter(function(t) {
            return selectedPlayer.playerColor === t.color;
        });

        updateMyTanks(myTanksNewPosition);
        calculateGoal();

    });

    function updateMyTanks(myTanksNewPosition) {
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

        for (var i = 0; i < myTanks.length; i++) {
            if (myTanks[i].hasTarget()) {
                goal = myTanks[i].getTarget();
            } else {
                goal = myTanks[i].generateTarget();
            }
            //find distance to goal
            distance = round(Math.sqrt(Math.pow((goal.x - myTanks[i].position.x), 2) + Math.pow((goal.y - myTanks[i].position.y), 2)), 4);

            //find angle difference to face goal
            relativeX = goal.x - myTanks[i].position.x;
            relativeY = goal.y - myTanks[i].position.y;
            angle = round(Math.atan2(-(relativeY), relativeX), 4);
            degrees = round(angle * (180 / Math.PI), 4); //convert from radians to degrees
            degrees = degrees % 360; //(0 to 360)prevent overflow
            degrees = -(degrees); // tank degrees ascends clockwise. atan2 ascends counter clockwise. this fixes that difference

            //turn in the direction whichever is closer
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


    //rounds number (value) to specified number of decimals
    function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }
});
