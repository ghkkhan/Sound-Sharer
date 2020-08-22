var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var mongoUrl = "mongodb+srv://node-user:xTOdShw2dWdKVOFz@songdb.r4pht.mongodb.net/songSink?retryWrites=true&w=majority";
var multer = require('multer');

// serve up all client files
var htmlPath = path.join(__dirname, 'client');
app.use(express.static(htmlPath));
app.use(express.json());

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
        this._song_queue = ['song-afejwfp8922390'];
        this._song_index = 0; // which songs to play from song_queue
        this._song_time = 0; // in seconds
    }
    get room_name(){ return this._room_name; }
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

var rooms = []; // array of Room instances

function add_song_to_room_queue(room_name, song_file){
    rooms.forEach((fu) => {
        console.log(fu.room_name)
        console.log(room_name)
        if(fu.room_name == room_name){
            fu.add_song(song_file)
        }
    });
}

// iterate = (room_name) => {
//     rooms.forEach((fu) => {
//         console.log(fu.room_name)
//         console.log(room_name)
//         if(fu.room_name == room_name){
//             console.log(fu)
//             return fu
//         }
//     });
// }
function add_user_to_room(user, room_name){
    // iterate through each room and find matching name
    rooms.forEach((room)=>{
        console.log(room.room_name)
        console.log(room_name)
        if(room.room_name == room_name){
            room.add_user(user)
        }
    })
}

////////////////////// SOCKET STUFF
http.listen(port, function(){
    console.log('listening on *:' + port);
});

io.on('connection', function(socket){
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
    })

    socket.on("disconnect", ()=>{
        console.log('socket disconnected')
    });

    socket.on('addSong', (data) => {
        console.log(data.filename);
        console.log(data.username);
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

var counter = 0;
////////////////////////////////////// MULTER STUFF (FILE STORAGE)
// https://stackabuse.com/handling-file-uploads-in-node-js-with-expres-and-multer/
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'song_uploads/');
    },
    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, counter + path.extname(file.originalname));
    },
});

var upload = multer({ storage : storage}).single('song');

app.post('/upload-song/:uName/:rName', (req, res)=>{
    console.log(req.params)
    let room_name = req.params.rName;
    let user_name = req.params.uName;
    upload(req,res,function(err) {
        if(err) {
            console.log(err)
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    })

    add_song_to_room_queue(room_name, counter+1 + ".mp3")
    // iterate(room_name).add_song(counter + ".mp3")
    // iterate(room_name).then(fu => {
    //     fu.add_song(counter + ".mp3");
    // });
    counter++
    console.log(rooms[0]._song_queue)
})