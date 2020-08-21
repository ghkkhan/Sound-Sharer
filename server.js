var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var port = process.env.PORT || 3000;

// serve up all client files
var htmlPath = path.join(__dirname, 'client');
app.use(express.static(htmlPath));

////////////////////// SOCKET STUFF
http.listen(port, function(){
    console.log('listening on *:' + port);
});

io.on('connection', function(socket){
    console.log('connected');

    // socket.on('test', ()=>{
    //     console.log('test')
    // })

    socket.on("create_room", (data) => {

        console.log("Creating Room");
        console.log("username: " + data.uName);
        console.log("roomname: " + data.rName);
    });
    socket.on("join_room", (data) => {
        console.log("Joining Room");
        console.log("username: " + data.uName);
        console.log("roomname: " + data.rName);
    });
});