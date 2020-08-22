var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var mongoUrl = "mongodb+srv://node-user:xTOdShw2dWdKVOFz@songdb.r4pht.mongodb.net/songSink?retryWrites=true&w=majority";

// serve up all client files
var htmlPath = path.join(__dirname, 'client');
app.use(express.static(htmlPath));

////////////////////// ROOM INFO
class Song{
    constructor(dbID){
        this._dbID = dbID;
    }
}

class User{
    constructor(name, socket){
        this._name = name;
        this._socket = socket;
    }
    get socket(){
        return this._socket;
    }
}

class Room{
    constructor(room_name){
        this._room_name = room_name;
        this._users = [];
        this._song_queue = [];
        this._song_index = 0; // which songs to play from song_queue
        this._song_time = 0; // in seconds
    }
    // get room_name(){ return this._room_name; }
    // set room_name(x){ this._room_name = x; }
    add_user(User){
        this._users.push(User);
    }
    add_song(Song){
        this._song_queue.push(Song);
    }
    notify_users(msg){
        this._users.forEach((user)=>{
            let socket = user.socket;
            socket.emit('notify', {
                msg: msg
            });
        });
    }
}

rooms = []; // array of Room instances

////////////////////// SOCKET STUFF
http.listen(port, function(){
    console.log('listening on *:' + port);
});

io.on('connection', function(socket){
    console.log('connected');

    socket.on("create_room", (data) => {
        console.log("Creating Room");
        console.log("username: " + data.uName);
        console.log("roomname: " + data.rName);

        room = new Room(data.rName);
        user = new User(data.uName, socket);
        room.add_user(user);
        rooms.push(room);
        console.log(rooms[0]._users);
        room.notify_users('hi')
    });

    socket.on("join_room", (data) => {
        console.log("Joining Room");
        console.log("username: " + data.uName);
        console.log("roomname: " + data.rName);
    });
});

////////////////////// MONGO STUFF
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
       .then(() => {
         console.log('Database connection successful')
       })
       .catch(err => {
         console.error('Database connection error')
       });

// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose
// Get the default connection
var db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Import models from models folder
var SongModel = require('./models/song');
var UserModel = require('./models/user')

function create_song(title){
    // create instance of song model
    let songInstance = new SongModel({
        title: title
    })
    songInstance.save() // save to mongo server
}

function create_user(name){
    // create instance of song model
    let userInstance = new UserModel({
        name: name
    })
    userInstance.save() // save to mongo server
}

create_song('test song title')
create_user('ian')