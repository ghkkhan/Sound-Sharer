var express = require('express');
var app = express();
var siofu = require("socketio-file-upload")
//var http = require('http').Server(app);
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

//// Imports for storing room info
var Room = require("./classes/Room")
var Song = require("./classes/Song")
var User = require("./classes/User")

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

// setInterval(update_rooms, refresh_delay)

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

////////// SOCKET STUFF
var io = socketio.listen(app);

// idk if there is better way to do this other than pass everything in this file to the socket file and I'm too lazy to find out
var file = require('./sockets.js')(io, Room, Song, User, siofu, ss, path, fs, getAudioDurationInSeconds, rooms, uploads_dir, desync_allowed, update_rooms, add_song_to_room_queue, add_user_to_room)