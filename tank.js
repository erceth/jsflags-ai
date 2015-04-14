exports.Tank = function(tankNumber, selectedPlayer) {
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
}


