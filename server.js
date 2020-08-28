var express = require('express');
var app = express();
var siofu = require("socketio-file-upload")
var http = require('http').Server(app);
var socketio = require('socket.io');
var ss = require('socket.io-stream');
var path = require('path');
var port = process.env.PORT || 3000;
var fs = require('fs');
const { getAudioDurationInSeconds } = require('get-audio-duration');

// serve up all client files
var htmlPath = path.join(__dirname, 'client');
app = express()
        .use(siofu.router)
        .use(express.static(htmlPath))
        .use(express.json())
        .listen(port);

// GLOBAL VARS
var rooms = []; // array of Room instances
var refresh_delay = 3000; // time delay to send room info in millis
var uploads_dir = "./song_uploads"
var desync_allowed = 3; // time desync allowed between server and client audio in seconds


////////////////////// ROOM INFO
class Song {
    constructor(file_name, song_name, uploader, duration){
        this._file_name = file_name;
        this._song_name = song_name;
        this._uploader = uploader; // user name
        this._duration = duration; // in seconds
    }
    get file_name(){
        return this._file_name;
    }
    get song_name(){
        return this._song_name;
    }
    get duration(){
        return this._duration;
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
    get song_queue() { return this._song_queue; }
    set play_song(b){ this._play_song = b; }
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
            socket.emit('room_update', {
                song_queue: this._song_queue,
                users: user_list, // using this._users will cause recursive things for some reason???
                room_name: this._room_name,
                song_index: this._song_index,
                song_time: this._song_time,
                song_play: this._play_song
            })
        })
    }
    get current_song(){
        // returns song object
        return this._song_queue[this._song_index];
    }
}

// tell all rooms to update: timer
// tell all users to update songqueue, user list, room name, song time, song index...
function update_rooms(){
    console.log(rooms[0])
    rooms.forEach((room)=>{
        room.send_info() // send info to clients

        if(room._play_song){
            // if song is playing:

            // if song is over, roll over to next song in queue
            let current_song = room.current_song;
            let current_song_duration = current_song.duration;
            if(room._song_time > current_song_duration){
                room._song_time = 0;

                room._song_index += 1;
                if(room._song_index >= room._song_queue.length){
                    // if at end of queue, go to beginning
                    room._song_index = 0;
                }
            }

            // update song time
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
        // when user is on room.html, use local variables to add them into room
        // deals with fact that sockets are renewed on refresh
        user = new User(data.uName, socket); // create instance of user
        console.log(data.uName)
        console.log(data.rName)
        add_user_to_room(user, data.rName); // add user to room
        console.log(rooms)

        socket.emit('room_info', {
            // initial info when user joins room
            desync_allowed: desync_allowed
        })
    });

    socket.on("disconnect", ()=>{
        console.log('socket disconnected')
    });

    socket.on('addSong', (data) => {
        console.log(data.filename);
        console.log(data.username);
    });

    socket.on('play_queue', (data)=>{
        // client requested to start playing songs
        rooms.some((room)=>{
            if(room.room_name == data.room_name){
                if(room.song_queue.length>0){
                    room.play_song = true;
                }
                return true;
            }
        })
    })

    /////////// CODE FOR FILE UPLOAD
    var uploader = new siofu();
    uploader.dir = uploads_dir;
    uploader.listen(socket);
    
    //gets the data of the uploader....
    socket.on("queueing", data => {
        console.log(data)
        console.log("Uploader: " + data.uploader);
        console.log("Song Name: " + data.song_name);
        // get duration of song idk how to do this better
        getAudioDurationInSeconds(path.join(uploads_dir, data.file_name)).then((duration) => {
            console.log("Duration:" + duration);
            let song = new Song(data.file_name, data.song_name, data.uploader, duration);
            add_song_to_room_queue(data.room_name, song);
        });
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
    socket.on('client_stream_request', function (data) {
        // client requesting to stream current song

        // get file name of current song.
        rooms.some((room)=>{
            // get to current room
            if(room.room_name == data.room_name){
                let current_song = room.current_song; // will be undefined if song queue is empty
                if(current_song){
                    let file = current_song.file_name;

                    // create stream to client
                    var stream = ss.createStream();
                    var filename = path.join(uploads_dir, file);
                    ss(socket).emit('audio-stream', stream, { name: filename });
                    fs.createReadStream(filename).pipe(stream);
                }
                return true;
            }
        })
    });
});