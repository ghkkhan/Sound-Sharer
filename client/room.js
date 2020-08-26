// const SocketIOFileUploadServer = import("socketio-file-upload");

var fileName = "placeholder";
var fire;
window.onload = function() {
    document.body.className += " magic";
}

///////////////////////////////////////// SOCKET STUFF
var socket = io.connect();
var uploader = new SocketIOFileUpload(socket);
// uploader.listenOnInput(document.getElementById("mp3Upload"));
uploader.listenOnSubmit(document.getElementById("enqueue_file"),document.getElementById("mp3Upload"));

socket.emit('enter_room', {
    rName: localStorage.rName,
    uName: localStorage.uName
})

socket.on("room_info", data => {
    //user info and stuff...
    document.getElementById("queue").innerText = data.song_queue;
});

/////////////// FILE UPLOAD
var filename = ""; // keep track of name of file being uploaded
var input = document.getElementById('mp3Upload');
input.onchange = ()=>{
    console.log("prepared:", input.files.item(0).name);
};
enqueue = () => {
    let data = {
        uploader:localStorage.user_name,
        room_name:localStorage.room_name,
        song_name:document.getElementById("song-name").value,
        file_name: input.files.item(0).name,
        file_size: input.files.item(0).size,
        file_type: input.files.item(0).type
    }
    socket.emit("queueing", data);
}


/////////////// AUDIO PLAYER STREAMING
document.getElementById("play_button").addEventListener("click", (event)=>{ 
    console.log('play button')
    socket.emit('client-stream-request', {
        file: 'redbone'
    })
  });


var audio = document.getElementById('audio_player');
ss(socket).on('audio-stream', function(stream, data) {
    parts = [];
    stream.on('data', function(chunk){
        console.log("loading song!");
        parts.push(chunk);
    });
    stream.on('end', function () {
        console.log("playing song!");
        audio.src = (window.URL || window.webkitURL).createObjectURL(new Blob(parts));
        audio.play();
    });
});