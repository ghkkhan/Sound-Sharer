////////////////////// SOCKET STUFF
// https://stackoverflow.com/questions/23653617/socket-io-listen-events-in-separate-files-in-node-js

exports = module.exports = function(io, Room, Song, User, siofu, ss, path, fs, getAudioDurationInSeconds, rooms, uploads_dir, desync_allowed, update_rooms, add_song_to_room_queue, add_user_to_room){

var saferoom;

io.sockets.on('connection', function (socket) {
    console.log('connected');

    socket.on("create_room", (data) => {
        // create server side room variable. tell client to set local variables
        console.log("Creating Room");
        console.log("username: " + data.uName);
        console.log("roomname: " + data.rName);

        saferoom = true;

        rooms.forEach(elem => { 
            if(elem.room_name == data.rName){ saferoom=false;}
        });    
        if(saferoom) {
            room = new Room(data.rName);
            rooms.push(room);
            socket.emit("room-success", data = {
                status:"SUCCESS"
            });
        }
        else {
            socket.emit("room-error", data = {
                status: "RAE",
            });
        }
    });

    socket.on("join_room", (data) => {
        // check to see if room exists. tell client to set local variables
        console.log("Joining Room");
        console.log("username: " + data.uName);
        console.log("roomname: " + data.rName);
        saferoom = false;
        rooms.forEach(elem => {
            if(elem.room_name == data.rName) saferoom = true;
        });

        if(saferoom) {
            // room exists and user may join it...
            socket.emit("room-success", data = {
                status:"SUCCESS"
            });
        }
        else {
            // room does not exist... warn user to enter a new name
            socket.emit("room-error", data = {
                status: "ROOM-DNE"
            });
        }

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

}