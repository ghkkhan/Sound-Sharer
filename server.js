var express = require('express');
var app = express();
var siofu = require("socketio-file-upload")
var http = require('http').Server(app);
var socketio = require('socket.io');
var ss = require('socket.io-stream');
var path = require('path');
var port = process.env.PORT || 3000;
var fs = require('fs');
// var mongoose = require('mongoose');
// var mongoUrl = "mongodb+srv://node-user:xTOdShw2dWdKVOFz@songdb.r4pht.mongodb.net/songSink?retryWrites=true&w=majority";

// serve up all client files
var htmlPath = path.join(__dirname, 'client');
app = express()
        .use(siofu.router)
        .use(express.static(htmlPath))
        .use(express.json())
        .listen(port)

// GLOBAL VARS
var counter = 0; // for naming files
var rooms = []; // array of Room instances
var songs = [];
var refresh_delay = 1000; // time delay to send room info


////////////////////// ROOM INFO
class Song {
    constructor(file_name, song_name, uploader){
        this._file_name = file_name;
        this._song_name = song_name;
        this._uploader = uploader; // user name
    }
}

class User{
    constructor(name, socket){
        this._name = name;
        this._socket = socket;
    }
    get name(){
        return this._name;
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
        this._play_song = false;
    }
    get room_name(){ return this._room_name; }
    // set room_name(x){ this._room_name = x; }
    add_user(User){
        this._users.push(User);
    }
    add_song(Song){
        console.log(Song);
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
    send_info(){
        // send info about room to all users
        let user_list = this._users.map(()=>{user.name})
        this._users.forEach((user)=>{
            let socket = user.socket;
            socket.emit('room_info', {
                song_queue: this._song_queue,
                users: user_list, // using this._users will cause recursive things for some reason???
                room_name: this._room_name,
                song_index: this._song_index,
                song_time: this._song_time
            })
        })
    }
}

// tell all rooms to update: timer
// tell all users to update songqueue, user list, room name, song time, song index...
function update_rooms(){
    //console.log('update rooms')
    rooms.forEach((room)=>{
        room.send_info()
        if(room._play_song){
            room._song_time += refresh_delay/1000
        }
    })
}

setInterval(update_rooms, refresh_delay)

function add_song_to_room_queue(room_name, Song){
    // input: string, Song object
    rooms.some((room) => {
        if(room.room_name == room_name){
            room.add_song(Song)
            return true
        }
    });
}

function add_user_to_room(user, room_name){
    // input: User object, string
    // iterate through each room and find matching name
    rooms.some((room)=>{
        if(room.room_name == room_name){
            room.add_user(user);
            return true;
        }
    })
}

////////////////////// SOCKET STUFF
var io = socketio.listen(app);
console.log("Listening on port 3000");

io.sockets.on('connection', function(socket){
    console.log('connected');

    socket.on("create_room", (data) => {
        // create server side room variable. tell client to set local variables
        console.log("Creating Room");
        console.log("username: " + data.uName);
        console.log("roomname: " + data.rName);
        room = new Room(data.rName);
        rooms.push(room);

    });

    socket.on("join_room", (data) => {
        // check to see if room exists. tell client to set local variables
        console.log("Joining Room");
        console.log("username: " + data.uName);
        console.log("roomname: " + data.rName);

    });

    socket.on('enter_room', (data)=>{
        user = new User(data.uName, socket); // create instance of user
        add_user_to_room(user, data.rName); // add user to room
        console.log(rooms)
    });

    socket.on("disconnect", ()=>{
        console.log('socket disconnected')
    });

    socket.on('addSong', (data) => {
        console.log(data.filename);
        console.log(data.username);
    });

    /////////// CODE FOR FILE UPLOAD
    var uploader = new siofu();
    uploader.dir = "./song_uploads";
    uploader.listen(socket);
    
    //gets the data of the uploader....
    socket.on("queueing", data => {
        console.log(data)
        console.log("Uploader: " + data.uploader);
        console.log("Song Name: " + data.song_name);
        song = new Song(data.file_name, data.song_name, data.uploader);
        add_song_to_room_queue(data.room_name, song);
    })

    uploader.on("start", function(event) {
        console.log("I'ts coming");
    })
    uploader.on("saved", function(event) {
        console.log("file saved");

    });
    uploader.on("error", function(event){
        console.log("error from the uploader");
    });

    ////////// FILE STREAM
    // https://github.com/nkzawa/socket.io-stream/issues/73
    socket.on('client-stream-request', function (data) {
        var stream = ss.createStream();
        var filename = "./song_uploads/" + data.file + ".mp3";
        ss(socket).emit('audio-stream', stream, { name: filename });
        fs.createReadStream(filename).pipe(stream);
    });
});

// ////////////////////// MONGO STUFF
// mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
//        .then(() => {
//          console.log('Database connection successful')
//        })
//        .catch(err => {
//          console.error('Database connection error')
//        });

// // https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose
// // Get the default connection
// var db = mongoose.connection;

// // Bind connection to error event (to get notification of connection errors)
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Import models from models folder
// var SongModel = require('./models/song');
// var UserModel = require('./models/user');
// const song = require('./models/song');

// function create_song(title){
//     // create instance of song model
//     let songInstance = new SongModel({
//         title: title
//     })
//     songInstance.save() // save to mongo server
// }

// function create_user(name){
//     // create instance of song model
//     let userInstance = new UserModel({
//         name: name
//     })
//     userInstance.save() // save to mongo server
// }