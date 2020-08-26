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

enqueue = () => {
    let data = {
        uploader:localStorage.user_name,
        room_name:localStorage.room_name,
        song_name:document.getElementById("song-name").value,
    }
    socket.emit("queueing", data);
}

socket.emit('enter_room', {
    rName: localStorage.rName,
    uName: localStorage.uName
})

socket.on("room_info", data => {
    //user info and stuff...
    document.getElementById("queue").innerText = data.song_queue;
});