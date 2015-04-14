exports.connect = function(done){
    var port = "8003";
    var url = 'http://localhost:' + port;
    var socketio = require('socket.io-client');
    var socket = socketio(url);
    var command; //socket to send commands on
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
        var data={
        	serverTanks:serverTanks,
        	enemyBases:enemyBases,
        	socket:socket,
        	command:command,
        	selectedPlayer:selectedPlayer,
        	allBases:allBases
        };

        setTimeout(function() {
           done(data);
        }, 2000);

    });
};
