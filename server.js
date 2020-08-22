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

////////////////////// SOCKET STUFF
http.listen(port, function(){
    console.log('listening on *:' + port);
});

io.on('connection', function(socket){
    console.log('connected');

    socket.on('test', ()=>{
        console.log('test')
    })
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